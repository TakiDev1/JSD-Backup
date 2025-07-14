import { type VercelRequest, VercelResponse } from '@vercel/node';
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Pool } from '@neondatabase/serverless';

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

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Database connection
const pool = new Pool({ connectionString: DATABASE_URL });

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

async function createUser(username: string, email: string, hashedPassword: string) {
  const result = await pool.query(
    'INSERT INTO users (username, email, password, is_admin, is_premium, is_banned, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [username, email, hashedPassword, false, false, false, new Date()]
  );
  return result.rows[0];
}

async function updateUserLogin(id: number) {
  await pool.query(
    'UPDATE users SET last_login = $1, login_count = COALESCE(login_count, 0) + 1 WHERE id = $2',
    [new Date(), id]
  );
}

// Express app setup
let app: express.Application | null = null;

function createApp() {
  if (app) return app;
  
  const expressApp = express();
  
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
      console.log('[DEBUG] Auth debug endpoint hit');
      const { username } = req.body;
      
      if (!username) {
        return res.json({
          success: true,
          debug: 'No username provided',
          timestamp: new Date().toISOString()
        });
      }
      
      console.log(`[DEBUG] Testing auth for username: ${username}`);
      
      // Test database connection
      const result = await pool.query('SELECT id, username, is_admin, is_premium, is_banned, password FROM users WHERE username = $1', [username]);
      console.log(`[DEBUG] Database query result:`, result.rows.length > 0 ? 'User found' : 'User not found');
      
      if (result.rows.length === 0) {
        return res.json({
          success: true,
          debug: `User '${username}' not found in database`,
          availableUsers: ['JSD', 'Von', 'Developer', 'Camoz']
        });
      }
      
      const user = result.rows[0];
      console.log(`[DEBUG] User data:`, { id: user.id, username: user.username, is_admin: user.is_admin, hasPassword: !!user.password });
      
      // Test password comparison (if provided)
      const { password } = req.body;
      if (password && user.password) {
        console.log(`[DEBUG] Testing password for user: ${username}`);
        const isValid = await comparePasswords(password, user.password);
        console.log(`[DEBUG] Password valid:`, isValid);
        
        if (isValid) {
          // Test JWT generation
          try {
            const token = generateToken(user);
            console.log(`[DEBUG] JWT token generated successfully`);
            
            return res.json({
              success: true,
              debug: 'Authentication test successful',
              user: {
                id: user.id,
                username: user.username,
                isAdmin: user.is_admin,
                isPremium: user.is_premium
              },
              tokenGenerated: true
            });
          } catch (jwtError) {
            console.error('[DEBUG] JWT generation error:', jwtError);
            return res.json({
              success: false,
              debug: 'JWT generation failed',
              error: jwtError.message
            });
          }
        }
      }
      
      res.json({
        success: true,
        debug: 'User found but password not tested',
        user: {
          id: user.id,
          username: user.username,
          isAdmin: user.is_admin,
          isPremium: user.is_premium,
          hasPassword: !!user.password
        }
      });
      
    } catch (error: any) {
      console.error('[DEBUG] Auth debug error:', error);
      res.json({
        success: false,
        debug: 'Authentication debug failed',
        error: error.message,
        stack: error.stack
      });
    }
  });
  
  // AUTH ENDPOINTS
  
  // Login
  expressApp.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username and password are required'
        });
      }
      
      console.log(`[AUTH] Login attempt for: ${username}`);
      
      // Get user from database
      const user = await getUserByUsername(username);
      
      if (!user) {
        console.log(`[AUTH] User not found: ${username}`);
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
      
      if (user.is_banned) {
        console.log(`[AUTH] User is banned: ${username}`);
        return res.status(401).json({
          success: false,
          message: 'Account is banned'
        });
      }
      
      // Check password
      const isValidPassword = await comparePasswords(password, user.password);
      
      if (!isValidPassword) {
        console.log(`[AUTH] Invalid password for: ${username}`);
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
      
      // Update login info
      await updateUserLogin(user.id);
      
      // Generate token
      const token = generateToken(user);
      
      console.log(`[AUTH] Login successful for: ${username}`);
      
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
      console.error('[AUTH] Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Authentication service error'
      });
    }
  });
  
  // Register
  expressApp.post('/api/auth/register', async (req, res) => {
    try {
      const { username, email, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username and password are required'
        });
      }
      
      console.log(`[AUTH] Registration attempt for: ${username}`);
      
      // Check if user exists
      const existingUser = await getUserByUsername(username);
      
      if (existingUser) {
        console.log(`[AUTH] Username already exists: ${username}`);
        return res.status(400).json({
          success: false,
          message: 'Username already exists'
        });
      }
      
      // Hash password
      const hashedPassword = await hashPassword(password);
      
      // Create user
      const newUser = await createUser(username, email, hashedPassword);
      
      // Generate token
      const token = generateToken(newUser);
      
      console.log(`[AUTH] Registration successful for: ${username}`);
      
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
      console.error('[AUTH] Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration service error'
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
  
  // Discord auth status
  expressApp.get('/api/auth/discord-status', (req, res) => {
    console.log('[DISCORD] Status check');
    const available = !!(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET);
    res.json({
      success: true,
      available
    });
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