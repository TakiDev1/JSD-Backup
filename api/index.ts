import { type VercelRequest, VercelResponse } from '@vercel/node';
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Pool } from 'pg';
import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';
import session from 'express-session';

// Type definitions
interface AuthenticatedRequest extends express.Request {
  user: {
    id: number;
    username: string;
    isAdmin: boolean;
  };
}

// Environment variables
const DATABASE_URL = process.env.DATABASE_URL;
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';
const SESSION_SECRET = process.env.SESSION_SECRET || 'your-session-secret';

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Database connection using standard pg instead of Neon serverless
const pool = new Pool({ 
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// JWT Helper functions
function generateToken(user: any): string {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      isAdmin: user.is_admin || user.isAdmin 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Password helpers
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function comparePasswords(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Auth middleware
function authMiddleware(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  
  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
  
  req.user = decoded;
  next();
}

function adminMiddleware(req: any, res: any, next: any) {
  authMiddleware(req, res, () => {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    next();
  });
}

// Database queries
async function getUserByUsername(username: string) {
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  return result.rows[0];
}

async function getUserById(id: number) {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
}

async function getUserByDiscordId(discordId: string) {
  const result = await pool.query('SELECT * FROM users WHERE discord_id = $1', [discordId]);
  return result.rows[0];
}

async function createUser(username: string, email: string, hashedPassword: string, discordId?: string, discordUsername?: string, discordAvatar?: string) {
  const result = await pool.query(
    'INSERT INTO users (username, email, password, discord_id, discord_username, discord_avatar, is_admin, is_premium, is_banned, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
    [username, email, hashedPassword, discordId, discordUsername, discordAvatar, false, false, false, new Date()]
  );
  return result.rows[0];
}

async function updateUserDiscord(userId: number, discordId: string, discordUsername: string, discordAvatar: string) {
  const result = await pool.query(
    'UPDATE users SET discord_id = $1, discord_username = $2, discord_avatar = $3 WHERE id = $4 RETURNING *',
    [discordId, discordUsername, discordAvatar, userId]
  );
  return result.rows[0];
}

// Express app setup
let app: express.Application | null = null;

function createApp() {
  if (app) return app;
  
  const expressApp = express();
  
  // Session configuration
  expressApp.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));
  
  // Middleware
  expressApp.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://jsd-mods.vercel.app', 'https://jsdmods.com']
      : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));
  
  expressApp.use(express.json({ limit: '10mb' }));
  expressApp.use(express.urlencoded({ extended: false, limit: '10mb' }));
  
  // Passport configuration
  expressApp.use(passport.initialize());
  expressApp.use(passport.session());
  
  // Discord OAuth Strategy
  if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
    passport.use(new DiscordStrategy({
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: process.env.DISCORD_CALLBACK_URL || 'https://jsdmods.com/api/auth/discord/callback',
      scope: ['identify', 'email']
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('🔗 Discord OAuth callback received:', {
          id: profile.id,
          username: profile.username,
          email: profile.email
        });
        
        // Check if user exists by Discord ID
        let user = await getUserByDiscordId(profile.id);
        
        if (user) {
          console.log('✅ Existing Discord user found:', user.username);
          // Update Discord info
          user = await updateUserDiscord(user.id, profile.id, profile.username, profile.avatar);
          return done(null, user);
        }
        
        // Check if user exists by email
        if (profile.email) {
          const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [profile.email]);
          if (existingUser.rows.length > 0) {
            console.log('✅ Linking Discord to existing email account');
            user = await updateUserDiscord(existingUser.rows[0].id, profile.id, profile.username, profile.avatar);
            return done(null, user);
          }
        }
        
        // Create new user
        console.log('🆕 Creating new Discord user');
        const username = profile.username || `discord_${profile.id}`;
        const email = profile.email || '';
        
        // Check if username already exists
        let finalUsername = username;
        let counter = 1;
        while (await getUserByUsername(finalUsername)) {
          finalUsername = `${username}_${counter}`;
          counter++;
        }
        
        user = await createUser(
          finalUsername,
          email,
          '', // No password for Discord users
          profile.id,
          profile.username,
          profile.avatar
        );
        
        console.log('✅ Discord user created successfully:', user.username);
        return done(null, user);
      } catch (error) {
        console.error('❌ Discord OAuth error:', error);
        return done(error, null);
      }
    }));
  }
  
  // Passport serialization
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await getUserById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
  
  // Request logging
  expressApp.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
  
  // Health check
  expressApp.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'JSD Mods API (PostgreSQL)',
      database: !!DATABASE_URL
    });
  });
  
  // Test authentication endpoint
  expressApp.post('/api/test/auth-debug', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username and password are required'
        });
      }
      
      // Get user from database
      const user = await getUserByUsername(username);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
      
      if (user.is_banned) {
        return res.status(401).json({
          success: false,
          message: 'Account is banned'
        });
      }
      
      // Check password
      const isValidPassword = await comparePasswords(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
      
      // Generate token
      const token = generateToken(user);
      
      // Return user info without password
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({
        success: true,
        message: 'Authentication successful',
        user: {
          ...userWithoutPassword,
          isAdmin: user.is_admin,
          isPremium: user.is_premium
        },
        token
      });
      
    } catch (error: any) {
      console.error('[AUTH-DEBUG] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Authentication debug test failed',
        error: error.message
      });
    }
  });

  // Simple debug endpoint that we can test directly
  expressApp.get('/api/debug/simple', async (req, res) => {
    try {
      console.log('[SIMPLE-DEBUG] Testing basic functionality...');
      
      const tests: any = {
        environmentVariables: {
          databaseUrl: !!process.env.DATABASE_URL,
          jwtSecret: !!process.env.JWT_SECRET,
          databaseUrlLength: process.env.DATABASE_URL?.length || 0
        },
        timestamp: new Date().toISOString(),
        nodeVersion: process.version
      };
      
      // Test basic database connection
      try {
        console.log('[SIMPLE-DEBUG] Testing database connection...');
        const result = await pool.query('SELECT 1 as test');
        tests.database = {
          connected: true,
          testQuery: result.rows[0]?.test === 1
        };
        console.log('[SIMPLE-DEBUG] Database connection successful');
      } catch (dbError: any) {
        console.error('[SIMPLE-DEBUG] Database error:', dbError);
        tests.database = {
          connected: false,
          error: dbError.message
        };
      }
      
      // Test bcrypt
      try {
        console.log('[SIMPLE-DEBUG] Testing bcrypt...');
        const testHash = await bcrypt.hash('test', 12);
        const testCompare = await bcrypt.compare('test', testHash);
        tests.bcrypt = {
          working: testCompare === true,
          hashGenerated: !!testHash
        };
        console.log('[SIMPLE-DEBUG] Bcrypt working');
      } catch (bcryptError: any) {
        console.error('[SIMPLE-DEBUG] Bcrypt error:', bcryptError);
        tests.bcrypt = {
          working: false,
          error: bcryptError.message
        };
      }
      
      // Test JWT
      try {
        console.log('[SIMPLE-DEBUG] Testing JWT...');
        const testPayload = { id: 1, username: 'test', isAdmin: false };
        const token = jwt.sign(testPayload, JWT_SECRET, { expiresIn: '1h' });
        const decoded = jwt.verify(token, JWT_SECRET);
        tests.jwt = {
          working: !!decoded,
          tokenGenerated: !!token
        };
        console.log('[SIMPLE-DEBUG] JWT working');
      } catch (jwtError: any) {
        console.error('[SIMPLE-DEBUG] JWT error:', jwtError);
        tests.jwt = {
          working: false,
          error: jwtError.message
        };
      }
      
      res.json({
        success: true,
        message: 'Debug test completed',
        tests
      });
      
    } catch (error: any) {
      console.error('[SIMPLE-DEBUG] Overall error:', error);
      res.status(500).json({
        success: false,
        message: 'Debug test failed',
        error: error.message,
        stack: error.stack
      });
    }
  });

  // Test specific user lookup
  expressApp.post('/api/debug/user-test', async (req, res) => {
    try {
      const { username } = req.body;
      console.log(`[USER-DEBUG] Testing user lookup for: ${username || 'no username provided'}`);
      
      if (!username) {
        return res.json({
          success: true,
          message: 'No username provided for testing'
        });
      }
      
      // Test user lookup
      const result = await pool.query('SELECT id, username, is_admin, is_premium, is_banned FROM users WHERE username = $1', [username]);
      
      if (result.rows.length === 0) {
        const availableUsersResult = await pool.query('SELECT username FROM users WHERE is_admin = true LIMIT 5');
        return res.json({
          success: true,
          message: `User '${username}' not found`,
          userExists: false,
          availableUsers: availableUsersResult.rows.map(u => u.username)
        });
      }
      
      const user = result.rows[0];
      res.json({
        success: true,
        message: 'User found',
        userExists: true,
        user: {
          id: user.id,
          username: user.username,
          isAdmin: user.is_admin,
          isPremium: user.is_premium,
          isBanned: user.is_banned
        }
      });
      
    } catch (error: any) {
      console.error('[USER-DEBUG] Error:', error);
      res.status(500).json({
        success: false,
        message: 'User test failed',
        error: error.message
      });
    }
  });
  
  // Discord authentication endpoints
  if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
    console.log("✅ Discord authentication configured - setting up routes");
    
    expressApp.get("/api/auth/discord", (req, res, next) => {
      console.log("🔗 Discord auth route hit - redirecting to Discord");
      passport.authenticate("discord")(req, res, next);
    });
    
    expressApp.get("/api/auth/discord/callback", 
      passport.authenticate("discord", { 
        failureRedirect: "/login?error=discord_failed",
        failureMessage: true 
      }),
      (req, res) => {
        console.log("✅ Discord callback successful, user authenticated");
        
        // Generate JWT token for API consistency
        const user = req.user as any;
        const token = generateToken(user);
        
        // Redirect to frontend with token
        res.redirect(`/?discord_success=true&token=${token}`);
      }
    );
  } else {
    console.log("❌ Discord authentication not configured - missing credentials");
    
    // Fallback routes when Discord is not configured
    expressApp.get("/api/auth/discord", (req, res) => {
      console.log("❌ Discord auth attempted but not configured");
      res.status(503).json({ 
        error: "Discord authentication not configured",
        message: "Discord authentication is not available" 
      });
    });
    
    expressApp.get("/api/auth/discord/callback", (req, res) => {
      console.log("❌ Discord callback attempted but not configured");
      res.status(503).json({ 
        error: "Discord authentication not configured",
        message: "Discord authentication is not available" 
      });
    });
  }
  
  // Add a route to check Discord auth availability
  expressApp.get("/api/auth/discord-status", (req, res) => {
    try {
      console.log("🔍 Discord status check");
      const available = !!(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET);
      console.log("Discord available:", available);
      res.json({ 
        available,
        clientId: process.env.DISCORD_CLIENT_ID ? "configured" : "missing",
        clientSecret: process.env.DISCORD_CLIENT_SECRET ? "configured" : "missing"
      });
    } catch (error) {
      console.error("Error checking Discord status:", error);
      res.status(500).json({ error: "Failed to check Discord status" });
    }
  });
  
  // AUTH ENDPOINTS
  
  // Login
  expressApp.post('/api/auth/login', async (req, res) => {
    try {
      console.log('[AUTH] Login endpoint hit');
      const { username, password } = req.body;
      
      console.log('[AUTH] Login data received:', { username, hasPassword: !!password });
      
      if (!username || !password) {
        console.log('[AUTH] Missing required fields for login');
        return res.status(400).json({
          success: false,
          message: 'Username and password are required'
        });
      }
      
      console.log(`[AUTH] Starting login process for: ${username}`);
      
      // Get user from database
      console.log('[AUTH] Querying database for user...');
      const user = await getUserByUsername(username);
      
      if (!user) {
        console.log(`[AUTH] User not found: ${username}`);
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
      
      console.log(`[AUTH] User found: ${username}, ID: ${user.id}, isAdmin: ${user.is_admin}`);
      
      if (user.is_banned) {
        console.log(`[AUTH] User is banned: ${username}`);
        return res.status(401).json({
          success: false,
          message: 'Account is banned'
        });
      }
      
      // Check password
      console.log('[AUTH] Comparing password...');
      const isValidPassword = await comparePasswords(password, user.password);
      console.log(`[AUTH] Password comparison result: ${isValidPassword}`);
      
      if (!isValidPassword) {
        console.log(`[AUTH] Invalid password for: ${username}`);
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
      
      // Update login info
      console.log('[AUTH] Updating login info...');
      await updateUserLogin(user.id);
      console.log('[AUTH] Login info updated successfully');
      
      // Generate token
      console.log('[AUTH] Generating JWT token...');
      const token = generateToken(user);
      console.log('[AUTH] JWT token generated successfully');
      
      console.log(`[AUTH] Login completed successfully for: ${username}`);
      
      // Return user info without password
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({
        success: true,
        message: 'Login successful',
        user: {
          ...userWithoutPassword,
          isAdmin: user.is_admin,
          isPremium: user.is_premium
        },
        token
      });
      
    } catch (error: any) {
      console.error('[AUTH] Login error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      res.status(500).json({
        success: false,
        message: 'Authentication service error',
        ...(process.env.NODE_ENV === 'development' && { 
          error: error.message,
          stack: error.stack 
        })
      });
    }
  });
  
  // Register
  expressApp.post('/api/auth/register', async (req, res) => {
    try {
      console.log('[AUTH] Registration endpoint hit');
      const { username, email, password } = req.body;
      
      console.log('[AUTH] Registration data received:', { username, email, hasPassword: !!password });
      
      if (!username || !password) {
        console.log('[AUTH] Missing required fields');
        return res.status(400).json({
          success: false,
          message: 'Username and password are required'
        });
      }
      
      console.log(`[AUTH] Starting registration process for: ${username}`);
      
      // Check if user exists
      console.log('[AUTH] Checking if user exists...');
      const existingUser = await getUserByUsername(username);
      
      if (existingUser) {
        console.log(`[AUTH] Username already exists: ${username}`);
        return res.status(400).json({
          success: false,
          message: 'Username already exists'
        });
      }
      
      console.log('[AUTH] Username available, proceeding with registration');
      
      // Hash password
      console.log('[AUTH] Hashing password...');
      const hashedPassword = await hashPassword(password);
      console.log('[AUTH] Password hashed successfully');
      
      // Create user
      console.log('[AUTH] Creating user in database...');
      const newUser = await createUser(username, email || '', hashedPassword);
      console.log('[AUTH] User created successfully with ID:', newUser.id);
      
      // Generate token
      console.log('[AUTH] Generating JWT token...');
      const token = generateToken(newUser);
      console.log('[AUTH] JWT token generated successfully');
      
      console.log(`[AUTH] Registration completed successfully for: ${username}`);
      
      // Return user info without password
      const { password: _, ...userWithoutPassword } = newUser;
      
      res.status(201).json({
        success: true,
        message: 'Registration successful',
        user: {
          ...userWithoutPassword,
          isAdmin: newUser.is_admin,
          isPremium: newUser.is_premium
        },
        token
      });
      
    } catch (error: any) {
      console.error('[AUTH] Registration error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      res.status(500).json({
        success: false,
        message: 'Registration service error',
        ...(process.env.NODE_ENV === 'development' && { 
          error: error.message,
          stack: error.stack 
        })
      });
    }
  });
  
  // Get current user
  expressApp.get('/api/auth/user', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      console.log(`[AUTH] User info request for ID: ${userId}`);
      
      // Get fresh user data from database
      const user = await getUserById(userId);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }
      
      if (user.is_banned) {
        return res.status(401).json({
          success: false,
          message: 'Account is banned'
        });
      }
      
      // Return user info without password
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({
        success: true,
        user: {
          ...userWithoutPassword,
          isAdmin: user.is_admin,
          isPremium: user.is_premium
        }
      });
      
    } catch (error: any) {
      console.error('[AUTH] User info error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user information'
      });
    }
  });
  
  // Logout (client-side token removal)
  expressApp.post('/api/auth/logout', (req, res) => {
    console.log('[AUTH] Logout request');
    res.json({
      success: true,
      message: 'Logout successful'
    });
  });
  
  // Admin login (same as regular login but checks admin status)
  expressApp.post('/api/auth/admin-login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username and password are required'
        });
      }
      
      console.log(`[ADMIN] Admin login attempt for: ${username}`);
      
      // Get user from database
      const user = await getUserByUsername(username);
      
      if (!user) {
        console.log(`[ADMIN] User not found: ${username}`);
        return res.status(401).json({
          success: false,
          message: 'Invalid admin credentials'
        });
      }
      
      if (!user.is_admin) {
        console.log(`[ADMIN] User is not admin: ${username}`);
        return res.status(401).json({
          success: false,
          message: 'Admin access required'
        });
      }
      
      if (user.is_banned) {
        console.log(`[ADMIN] Admin user is banned: ${username}`);
        return res.status(401).json({
          success: false,
          message: 'Account is banned'
        });
      }
      
      // Check password
      const isValidPassword = await comparePasswords(password, user.password);
      
      if (!isValidPassword) {
        console.log(`[ADMIN] Invalid password for admin: ${username}`);
        return res.status(401).json({
          success: false,
          message: 'Invalid admin credentials'
        });
      }
      
      // Update login info
      await updateUserLogin(user.id);
      
      // Generate token
      const token = generateToken(user);
      
      console.log(`[ADMIN] Admin login successful for: ${username}`);
      
      // Return user info without password
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({
        success: true,
        message: 'Admin login successful',
        user: {
          ...userWithoutPassword,
          isAdmin: user.is_admin,
          isPremium: user.is_premium
        },
        token
      });
      
    } catch (error: any) {
      console.error('[ADMIN] Admin login error:', error);
      res.status(500).json({
        success: false,
        message: 'Admin authentication service error'
      });
    }
  });
  
  // MODS ENDPOINTS
  
  // Get mods
  expressApp.get('/api/mods', async (req, res) => {
    try {
      const { category, search, featured, limit = 12, page = 1 } = req.query;
      
      console.log('[MODS] Fetching mods with filters:', { category, search, featured, limit, page });
      
      let query = 'SELECT * FROM mods WHERE 1=1';
      const params: any[] = [];
      let paramCount = 0;
      
      if (category) {
        paramCount++;
        query += ` AND category = $${paramCount}`;
        params.push(category);
      }
      
      if (search) {
        paramCount++;
        query += ` AND (title ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
        params.push(`%${search}%`);
      }
      
      if (featured === 'true') {
        paramCount++;
        query += ` AND is_featured = $${paramCount}`;
        params.push(true);
      }
      
      // Add pagination
      const limitNum = parseInt(limit as string);
      const pageNum = parseInt(page as string);
      const offset = (pageNum - 1) * limitNum;
      
      query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limitNum, offset);
      
      const result = await pool.query(query, params);
      
      // Get total count
      let countQuery = 'SELECT COUNT(*) FROM mods WHERE 1=1';
      const countParams: any[] = [];
      let countParamCount = 0;
      
      if (category) {
        countParamCount++;
        countQuery += ` AND category = $${countParamCount}`;
        countParams.push(category);
      }
      
      if (search) {
        countParamCount++;
        countQuery += ` AND (title ILIKE $${countParamCount} OR description ILIKE $${countParamCount})`;
        countParams.push(`%${search}%`);
      }
      
      if (featured === 'true') {
        countParamCount++;
        countQuery += ` AND is_featured = $${countParamCount}`;
        countParams.push(true);
      }
      
      const countResult = await pool.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);
      
      res.json({
        success: true,
        mods: result.rows,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        }
      });
      
    } catch (error: any) {
      console.error('[MODS] Error fetching mods:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch mods'
      });
    }
  });
  
  // Get featured mods
  expressApp.get('/api/mods/featured', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
      
      console.log(`[MODS] Fetching ${limit} featured mods`);
      
      const result = await pool.query(
        'SELECT * FROM mods WHERE is_featured = true ORDER BY created_at DESC LIMIT $1',
        [limit]
      );
      
      res.json({
        success: true,
        mods: result.rows
      });
      
    } catch (error: any) {
      console.error('[MODS] Error fetching featured mods:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch featured mods'
      });
    }
  });
  
  // Get single mod
  expressApp.get('/api/mods/:id', async (req, res) => {
    try {
      const modId = parseInt(req.params.id);
      
      if (isNaN(modId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid mod ID'
        });
      }
      
      console.log(`[MODS] Fetching mod ${modId}`);
      
      const result = await pool.query('SELECT * FROM mods WHERE id = $1', [modId]);
      const mod = result.rows[0];
      
      if (!mod) {
        return res.status(404).json({
          success: false,
          message: 'Mod not found'
        });
      }
      
      // Get latest version
      const versionResult = await pool.query(
        'SELECT * FROM mod_versions WHERE mod_id = $1 AND is_latest = true LIMIT 1',
        [modId]
      );
      
      res.json({
        success: true,
        mod: {
          ...mod,
          latestVersion: versionResult.rows[0] || null,
          reviews: []
        }
      });
      
    } catch (error: any) {
      console.error('[MODS] Error fetching mod:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch mod'
      });
    }
  });
  
  // CART ENDPOINTS (protected)
  
  // Get cart
  expressApp.get('/api/cart', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      console.log(`[CART] Fetching cart for user ${userId}`);
      
      const result = await pool.query(`
        SELECT ci.*, m.title, m.description, m.price, m.discount_price, m.preview_image_url, m.category
        FROM cart_items ci
        JOIN mods m ON ci.mod_id = m.id
        WHERE ci.user_id = $1
        ORDER BY ci.added_at DESC
      `, [userId]);
      
      res.json({
        success: true,
        items: result.rows
      });
      
    } catch (error: any) {
      console.error('[CART] Error fetching cart:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve cart items'
      });
    }
  });
  
  // Add to cart
  expressApp.post('/api/cart', authMiddleware, async (req: any, res) => {
    try {
      const { modId } = req.body;
      const userId = req.user?.id;
      
      if (!modId || isNaN(modId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid mod ID'
        });
      }
      
      console.log(`[CART] Adding mod ${modId} to cart for user ${userId}`);
      
      // Check if mod exists
      const modResult = await pool.query('SELECT * FROM mods WHERE id = $1', [modId]);
      if (modResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Mod not found'
        });
      }
      
      // Check if already in cart
      const cartCheck = await pool.query(
        'SELECT * FROM cart_items WHERE user_id = $1 AND mod_id = $2',
        [userId, modId]
      );
      
      if (cartCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Item already in cart'
        });
      }
      
      // Check if already purchased
      const purchaseCheck = await pool.query(
        'SELECT * FROM purchases WHERE user_id = $1 AND mod_id = $2',
        [userId, modId]
      );
      
      if (purchaseCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'You already own this mod'
        });
      }
      
      // Add to cart
      const result = await pool.query(
        'INSERT INTO cart_items (user_id, mod_id, added_at) VALUES ($1, $2, $3) RETURNING *',
        [userId, modId, new Date()]
      );
      
      res.status(201).json({
        success: true,
        item: {
          ...result.rows[0],
          mod: modResult.rows[0]
        }
      });
      
    } catch (error: any) {
      console.error('[CART] Error adding to cart:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add item to cart'
      });
    }
  });
  
  // Remove from cart
  expressApp.delete('/api/cart/:modId', authMiddleware, async (req: any, res) => {
    try {
      const modId = parseInt(req.params.modId);
      const userId = req.user?.id;
      
      if (isNaN(modId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid mod ID'
        });
      }
      
      console.log(`[CART] Removing mod ${modId} from cart for user ${userId}`);
      
      await pool.query(
        'DELETE FROM cart_items WHERE user_id = $1 AND mod_id = $2',
        [userId, modId]
      );
      
      res.json({
        success: true,
        message: 'Item removed from cart'
      });
      
    } catch (error: any) {
      console.error('[CART] Error removing from cart:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove item from cart'
      });
    }
  });
  
  // Clear cart
  expressApp.delete('/api/cart', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      console.log(`[CART] Clearing cart for user ${userId}`);
      
      await pool.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
      
      res.json({
        success: true,
        message: 'Cart cleared'
      });
      
    } catch (error: any) {
      console.error('[CART] Error clearing cart:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clear cart'
      });
    }
  });
  
  // ADMIN ENDPOINTS (protected)
  
  // Get admin settings
  expressApp.get('/api/admin/settings', adminMiddleware, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      console.log(`[ADMIN] Settings request from user ${userId}`);
      
      const result = await pool.query('SELECT * FROM site_settings');
      const settings: Record<string, string> = {};
      
      for (const setting of result.rows) {
        settings[setting.key] = setting.value || '';
      }
      
      res.json({
        success: true,
        settings: {
          siteName: settings.siteName || "JSD Mods",
          maintenanceMode: settings.maintenanceMode === "true",
          discordEnabled: !!(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET),
          stripeEnabled: !!process.env.STRIPE_SECRET_KEY,
          ...settings
        }
      });
      
    } catch (error: any) {
      console.error('[ADMIN] Error fetching settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch settings'
      });
    }
  });
  
  // Get admin users
  expressApp.get('/api/admin/users', adminMiddleware, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      console.log(`[ADMIN] Users request from user ${userId}`);
      
      const result = await pool.query('SELECT id, username, email, is_admin, is_premium, is_banned, created_at, last_login FROM users ORDER BY username');
      
      res.json({
        success: true,
        users: result.rows
      });
      
    } catch (error: any) {
      console.error('[ADMIN] Error fetching users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users'
      });
    }
  });
  
  // Get admin stats
  expressApp.get('/api/admin/stats', adminMiddleware, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      console.log(`[ADMIN] Stats request from user ${userId}`);
      
      const [usersResult, modsResult, purchasesResult] = await Promise.all([
        pool.query('SELECT COUNT(*) FROM users'),
        pool.query('SELECT COUNT(*) FROM mods'),
        pool.query('SELECT COUNT(*) FROM purchases')
      ]);
      
      res.json({
        success: true,
        stats: {
          totalUsers: parseInt(usersResult.rows[0].count),
          totalMods: parseInt(modsResult.rows[0].count),
          totalPurchases: parseInt(purchasesResult.rows[0].count)
        }
      });
      
    } catch (error: any) {
      console.error('[ADMIN] Error fetching stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch statistics'
      });
    }
  });
  
  // Error handling
  expressApp.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[ERROR] Unhandled error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  });
  
  // 404 handler
  expressApp.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      message: 'Endpoint not found'
    });
  });
  
  app = expressApp;
  return expressApp;
}

// Vercel serverless handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const expressApp = createApp();
    return expressApp(req as any, res as any);
  } catch (error: any) {
    console.error('[HANDLER] Critical error:', error);
    return res.status(500).json({
      success: false,
      message: 'Service temporarily unavailable',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}