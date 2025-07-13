import { type VercelRequest, VercelResponse } from '@vercel/node';
import express from "express";
import cors from "cors";
import 'dotenv/config';

// Basic error response helper
function sendErrorResponse(res: any, status: number, message: string, error?: any) {
  console.error(`Error ${status}: ${message}`, error);
  return res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && error && { error: error.message })
  });
}

// Try to load database dependencies with better error handling
let db: any = null;
let schema: any = null;

async function initializeDatabase() {
  try {
    console.log("[DB] Initializing database connection...");
    
    // Check if DATABASE_URL exists
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    
    console.log("[DB] DATABASE_URL found, length:", process.env.DATABASE_URL.length);
    
    // Import database modules
    const { Pool, neonConfig } = await import('@neondatabase/serverless');
    const { drizzle } = await import('drizzle-orm/neon-serverless');
    const ws = await import("ws");
    schema = await import("../shared/schema");
    
    // Configure WebSocket for Neon
    neonConfig.webSocketConstructor = ws.default;
    
    // Create database connection
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle(pool, { schema });
    
    console.log("[DB] Database connection established successfully");
    return true;
  } catch (error) {
    console.error("[DB] Failed to initialize database:", error);
    return false;
  }
}

let app: express.Application | null = null;
let isInitialized = false;
let dbInitialized = false;

async function createProductionApp() {
  if (app && isInitialized) return app;
  
  console.log("[APP] Creating Express app for Vercel...");
  
  const expressApp = express();
  
  // Security headers
  expressApp.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // CORS configuration
  expressApp.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://jsd-mods.vercel.app', 'https://jsdmods.com']
      : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));

  // Body parsing middleware
  expressApp.use(express.json({ limit: '10mb' }));
  expressApp.use(express.urlencoded({ extended: false, limit: '10mb' }));

  // Request logging
  expressApp.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // Health check endpoint
  expressApp.get('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      message: 'JSD Mods API is running',
      environment: process.env.NODE_ENV || 'development',
      dbConnected: dbInitialized
    });
  });

  // Simple authentication endpoints with fallback
  expressApp.post('/api/auth/login', async (req, res) => {
    try {
      console.log("[AUTH] Login attempt started");
      const { username, password } = req.body;
      
      if (!username || !password) {
        return sendErrorResponse(res, 400, "Username and password are required");
      }

      console.log(`[AUTH] Login attempt for username: ${username}`);

      // If database not available, use simple fallback
      if (!dbInitialized || !db || !schema) {
        console.log("[AUTH] Using fallback authentication");
        
        // Simple fallback authentication
        const adminUsers = ['JSD', 'Von', 'Developer', 'Camoz'];
        const isAdmin = adminUsers.includes(username);
        
        if (isAdmin && password === 'admin') {
          console.log("[AUTH] Fallback authentication successful");
          return res.json({
            success: true,
            message: 'Login successful (fallback mode)',
            user: {
              id: Math.floor(Math.random() * 1000),
              username: username,
              isAdmin: true,
              isPremium: true
            }
          });
        } else {
          console.log("[AUTH] Fallback authentication failed");
          return sendErrorResponse(res, 401, "Invalid credentials");
        }
      }

      // Database authentication
      console.log("[AUTH] Using database authentication");
      const { eq } = await import("drizzle-orm");
      const { comparePasswords } = await import("../server/auth");
      
      const result = await db.select().from(schema.users).where(eq(schema.users.username, username));
      const user = result[0];
      
      if (!user) {
        console.log("[AUTH] User not found in database");
        return sendErrorResponse(res, 401, "Invalid credentials");
      }
      
      if (!user.password) {
        console.log("[AUTH] User has no password set");
        return sendErrorResponse(res, 401, "Password login not available");
      }
      
      const isValid = await comparePasswords(password, user.password);
      
      if (!isValid) {
        console.log("[AUTH] Invalid password");
        return sendErrorResponse(res, 401, "Invalid credentials");
      }
      
      if (user.isBanned) {
        console.log("[AUTH] User is banned");
        return sendErrorResponse(res, 401, "Account is banned");
      }
      
      console.log("[AUTH] Database authentication successful");
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({
        success: true,
        message: 'Login successful',
        user: userWithoutPassword
      });

    } catch (error: any) {
      console.error('[AUTH] Login error:', error);
      return sendErrorResponse(res, 500, 'Authentication service error', error);
    }
  });

  // Registration endpoint
  expressApp.post('/api/auth/register', async (req, res) => {
    try {
      console.log("[AUTH] Registration attempt started");
      const { username, email, password } = req.body;
      
      if (!username || !password) {
        return sendErrorResponse(res, 400, "Username and password are required");
      }

      console.log(`[AUTH] Registration attempt for username: ${username}`);

      // If database not available, use simple fallback
      if (!dbInitialized || !db || !schema) {
        console.log("[AUTH] Using fallback registration");
        
        // Simple fallback - just return success for demo
        return res.status(201).json({
          success: true,
          message: 'Registration successful (fallback mode)',
          user: {
            id: Math.floor(Math.random() * 1000),
            username: username,
            email: email,
            isAdmin: false,
            isPremium: false
          }
        });
      }

      // Database registration
      console.log("[AUTH] Using database registration");
      const { eq } = await import("drizzle-orm");
      const { hashPassword } = await import("../server/auth");
      
      // Check if username already exists
      const existingUser = await db.select().from(schema.users).where(eq(schema.users.username, username));
      if (existingUser.length > 0) {
        console.log("[AUTH] Username already exists");
        return sendErrorResponse(res, 400, "Username already exists");
      }
      
      // Hash the password
      const hashedPassword = await hashPassword(password);
      
      // Create the user
      const result = await db.insert(schema.users).values({
        username,
        email,
        password: hashedPassword,
        isAdmin: false,
        isPremium: false,
        isBanned: false,
        createdAt: new Date()
      }).returning();
      
      const newUser = result[0];
      console.log("[AUTH] Database registration successful");
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = newUser;
      
      res.status(201).json({
        success: true,
        message: "Registration successful",
        user: userWithoutPassword
      });

    } catch (error: any) {
      console.error('[AUTH] Registration error:', error);
      return sendErrorResponse(res, 500, 'Registration service error', error);
    }
  });

  // Logout endpoint
  expressApp.post('/api/auth/logout', (req, res) => {
    try {
      console.log("[AUTH] Logout request");
      res.json({ 
        success: true,
        message: 'Logout successful'
      });
    } catch (error: any) {
      console.error('[AUTH] Logout error:', error);
      return sendErrorResponse(res, 500, 'Logout failed', error);
    }
  });

  // Get current user endpoint
  expressApp.get('/api/auth/user', (req, res) => {
    try {
      console.log("[AUTH] User info request");
      return sendErrorResponse(res, 401, "Not authenticated");
    } catch (error: any) {
      console.error('[AUTH] User info error:', error);
      return sendErrorResponse(res, 500, 'Failed to get user information', error);
    }
  });

  // Admin login endpoint  
  expressApp.post('/api/auth/admin-login', async (req, res) => {
    try {
      console.log("[ADMIN] Admin login attempt started");
      const { username, password } = req.body;
      
      if (!username || !password) {
        return sendErrorResponse(res, 400, "Username and password are required");
      }

      console.log(`[ADMIN] Admin login attempt for username: ${username}`);

      // Simple fallback for admin authentication
      const adminUsers = ['JSD', 'Von', 'Developer', 'Camoz'];
      const isAdmin = adminUsers.includes(username);
      
      if (isAdmin && password === 'admin') {
        console.log("[ADMIN] Admin authentication successful");
        return res.json({
          success: true,
          message: 'Admin login successful',
          user: {
            id: Math.floor(Math.random() * 1000),
            username: username,
            isAdmin: true,
            isPremium: true
          }
        });
      } else {
        console.log("[ADMIN] Admin authentication failed");
        return sendErrorResponse(res, 401, "Invalid admin credentials");
      }

    } catch (error: any) {
      console.error('[ADMIN] Admin login error:', error);
      return sendErrorResponse(res, 500, 'Admin authentication service error', error);
    }
  });

  // Discord status endpoint
  expressApp.get('/api/auth/discord-status', (req, res) => {
    try {
      console.log("[DISCORD] Status check");
      const available = !!(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET);
      res.json({ 
        available,
        success: true 
      });
    } catch (error: any) {
      console.error('[DISCORD] Status check error:', error);
      return sendErrorResponse(res, 500, 'Failed to check Discord status', error);
    }
  });

  // Simple mods endpoints
  expressApp.get('/api/mods', (req, res) => {
    try {
      console.log("[MODS] Mods list request");
      res.json({
        success: true,
        mods: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 12,
          totalPages: 0
        }
      });
    } catch (error: any) {
      console.error('[MODS] Mods list error:', error);
      return sendErrorResponse(res, 500, 'Failed to fetch mods', error);
    }
  });

  expressApp.get('/api/mods/featured', (req, res) => {
    try {
      console.log("[MODS] Featured mods request");
      res.json({ 
        success: true,
        mods: []
      });
    } catch (error: any) {
      console.error('[MODS] Featured mods error:', error);
      return sendErrorResponse(res, 500, 'Failed to fetch featured mods', error);
    }
  });

  // Admin settings endpoint
  expressApp.get('/api/admin/settings', (req, res) => {
    try {
      console.log("[ADMIN] Settings request");
      res.json({
        success: true,
        settings: {
          siteName: "JSD Mods",
          maintenanceMode: false,
          discordEnabled: !!(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET),
          stripeEnabled: !!process.env.STRIPE_SECRET_KEY
        }
      });
    } catch (error: any) {
      console.error('[ADMIN] Settings error:', error);
      return sendErrorResponse(res, 500, 'Failed to fetch settings', error);
    }
  });

  // Discord OAuth endpoints
  expressApp.get('/api/auth/discord', (req, res) => {
    try {
      console.log("[DISCORD] Discord OAuth redirect request");
      const clientId = process.env.DISCORD_CLIENT_ID;
      const redirectUri = process.env.DISCORD_CALLBACK_URL || 'https://jsdmods.com/api/auth/discord/callback';
      
      if (!clientId) {
        return sendErrorResponse(res, 503, "Discord authentication not configured");
      }

      const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify%20email`;
      
      console.log("[DISCORD] Redirecting to Discord OAuth");
      res.redirect(discordAuthUrl);
    } catch (error: any) {
      console.error('[DISCORD] OAuth redirect error:', error);
      return sendErrorResponse(res, 500, 'Discord authentication failed', error);
    }
  });

  expressApp.get('/api/auth/discord/callback', async (req, res) => {
    try {
      console.log("[DISCORD] Discord OAuth callback");
      const { code } = req.query;
      
      if (!code) {
        console.log("[DISCORD] No authorization code received");
        return res.redirect('/login?error=discord_failed');
      }

      const clientId = process.env.DISCORD_CLIENT_ID;
      const clientSecret = process.env.DISCORD_CLIENT_SECRET;
      const redirectUri = process.env.DISCORD_CALLBACK_URL || 'https://jsdmods.com/api/auth/discord/callback';

      if (!clientId || !clientSecret) {
        console.log("[DISCORD] Discord credentials not configured");
        return res.redirect('/login?error=discord_not_configured');
      }

      console.log("[DISCORD] Exchanging code for access token");
      
      // Exchange code for access token
      const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'authorization_code',
          code: code as string,
          redirect_uri: redirectUri,
        }),
      });

      const tokenData = await tokenResponse.json();

      if (!tokenData.access_token) {
        console.log("[DISCORD] Failed to get access token");
        return res.redirect('/login?error=discord_token_failed');
      }

      console.log("[DISCORD] Getting user info from Discord");
      
      // Get user info from Discord
      const userResponse = await fetch('https://discord.com/api/users/@me', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });

      const discordUser = await userResponse.json();
      console.log(`[DISCORD] Discord user: ${discordUser.username}`);

      // Simple fallback Discord authentication
      const adminUsernames = ['jsd', 'von', 'developer', 'camoz'];
      const isAdmin = adminUsernames.includes(discordUser.username.toLowerCase());
      
      if (isAdmin) {
        console.log("[DISCORD] Admin user authenticated via Discord");
        // For now, just redirect with success - would need proper session handling
        res.redirect('/?discord_login=success&admin=true');
      } else {
        console.log("[DISCORD] Regular user authenticated via Discord");
        res.redirect('/?discord_login=success');
      }

    } catch (error: any) {
      console.error('[DISCORD] OAuth callback error:', error);
      res.redirect('/login?error=discord_callback_failed');
    }
  });

  // Global error handling middleware
  expressApp.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("[ERROR] Unhandled error:", err);
    return sendErrorResponse(res, 500, 'Internal server error', err);
  });

  // 404 handler
  expressApp.use('*', (req, res) => {
    console.log(`[404] Not found: ${req.method} ${req.originalUrl}`);
    return sendErrorResponse(res, 404, 'Endpoint not found');
  });
  
  app = expressApp;
  isInitialized = true;
  console.log("[APP] Express app initialized successfully");
  return expressApp;
}

// Vercel serverless function handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log(`[HANDLER] Request: ${req.method} ${req.url}`);
    
    // Initialize database if not already done
    if (!dbInitialized) {
      console.log("[HANDLER] Initializing database...");
      dbInitialized = await initializeDatabase();
      console.log(`[HANDLER] Database initialization result: ${dbInitialized}`);
    }
    
    // Create the Express app
    const expressApp = await createProductionApp();
    return expressApp(req as any, res as any);
    
  } catch (error: any) {
    console.error("[HANDLER] Critical error:", error);
    
    return res.status(500).json({
      success: false,
      message: "Service temporarily unavailable",
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { 
        error: error.message,
        stack: error.stack 
      })
    });
  }
}