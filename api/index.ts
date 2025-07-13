import { type VercelRequest, VercelResponse } from '@vercel/node';
import express from "express";
import cors from "cors";
import 'dotenv/config';

// Direct database imports for Vercel serverless
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema";
import { eq, and, count, sql, desc, asc, like, or } from "drizzle-orm";
import passport from "passport";
import session from "express-session";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

// Database connection
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

// Authentication helpers
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function comparePasswords(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Simple rate limiter for serverless
const rateLimiter = {
  attempts: new Map(),
  isRateLimited(id: string) {
    const attempts = this.attempts.get(id) || 0;
    return attempts > 5;
  },
  resetAttempts(id: string) {
    this.attempts.delete(id);
  },
  addAttempt(id: string) {
    const attempts = this.attempts.get(id) || 0;
    this.attempts.set(id, attempts + 1);
  }
};

// Helper function to get client IP
function getClientIP(req: any): string {
  return req.headers['x-forwarded-for']?.split(',')[0] || 
         req.headers['x-real-ip'] || 
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress || 
         'unknown';
}

let app: express.Application | null = null;
let isInitialized = false;

async function createProductionApp() {
  if (app && isInitialized) return app;
  
  console.log("Creating production-ready Express app for Vercel with PostgreSQL...");
  
  const expressApp = express();
  
  // Security headers
  expressApp.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // CORS configuration
  expressApp.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://jsd-mods.vercel.app', 'https://jsdmods.com']
      : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));

  // Body parsing middleware
  expressApp.use(express.json({ limit: '10mb' }));
  expressApp.use(express.urlencoded({ extended: false, limit: '10mb' }));

  // Session configuration for serverless
  expressApp.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-here',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Initialize Passport
  expressApp.use(passport.initialize());
  expressApp.use(passport.session());

  // Passport serialization
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const result = await db.select().from(schema.users).where(eq(schema.users.id, id));
      const user = result[0];
      if (user) {
        done(null, {
          id: user.id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin,
          isPremium: user.isPremium,
          isBanned: user.isBanned,
          discordId: user.discordId,
          discordUsername: user.discordUsername,
          discordAvatar: user.discordAvatar
        });
      } else {
        done(null, false);
      }
    } catch (err) {
      done(err, false);
    }
  });

  // Local strategy
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const result = await db.select().from(schema.users).where(eq(schema.users.username, username));
      const user = result[0];
      
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      
      if (!user.password) {
        return done(null, false, { message: 'Password login not available for this account.' });
      }
      
      const isValid = await comparePasswords(password, user.password);
      
      if (!isValid) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      
      if (user.isBanned) {
        return done(null, false, { message: 'Account is banned.' });
      }
      
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  // Request logging
  expressApp.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - IP: ${getClientIP(req)}`);
    next();
  });

  // Health check endpoint
  expressApp.get('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      message: 'JSD Mods API is running (Production with PostgreSQL)',
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Authentication middleware
  const isAuthenticated = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: 'Unauthorized', success: false });
  };

  const isAdmin = (req: any, res: any, next: any) => {
    if (req.isAuthenticated() && req.user?.isAdmin) {
      return next();
    }
    res.status(403).json({ message: 'Admin access required', success: false });
  };

  // Authentication endpoints
  expressApp.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      console.log(`[DEBUG] /api/auth/login endpoint hit for username: ${username}`);
      const clientIP = getClientIP(req);
      
      if (!username || !password) {
        return res.status(400).json({ 
          message: "Username and password are required",
          success: false 
        });
      }

      // Rate limiting
      const rateLimitId = `login:${clientIP}`;
      if (rateLimiter.isRateLimited(rateLimitId)) {
        return res.status(429).json({ 
          message: "Too many login attempts. Please try again later.",
          success: false 
        });
      }

      // Authenticate using Passport
      passport.authenticate('local', (err: any, user: any, info: any) => {
        if (err) {
          console.error('Login error:', err);
          return res.status(500).json({ 
            message: 'Authentication error',
            success: false 
          });
        }
        
        if (!user) {
          rateLimiter.addAttempt(rateLimitId);
          return res.status(401).json({ 
            message: info?.message || "Invalid username or password",
            success: false 
          });
        }

        req.login(user, (loginErr: any) => {
          if (loginErr) {
            console.error('Login session error:', loginErr);
            return res.status(500).json({ 
              message: 'Login failed',
              success: false 
            });
          }

          // Reset rate limit on successful login
          rateLimiter.resetAttempts(rateLimitId);

          // Update last login
          db.update(schema.users)
            .set({ 
              lastLogin: new Date(),
              loginCount: sql`${schema.users.loginCount} + 1`
            })
            .where(eq(schema.users.id, user.id))
            .catch(err => console.error('Failed to update login info:', err));

          // Return user without password
          const { password: _, ...userWithoutPassword } = user;
          
          res.json({
            message: 'Login successful',
            success: true,
            user: userWithoutPassword
          });
        });
      })(req, res);

    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ 
        message: 'Authentication service error',
        success: false 
      });
    }
  });

  // User registration route
  expressApp.post("/api/auth/register", async (req, res) => {
    try {
      const { username, email, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ 
          message: "Username and password are required",
          success: false 
        });
      }
      
      // Check if username already exists
      const existingUser = await db.select().from(schema.users).where(eq(schema.users.username, username));
      if (existingUser.length > 0) {
        return res.status(400).json({ 
          message: "Username already exists",
          success: false 
        });
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
      
      // Login the user
      req.login(newUser, (err: any) => {
        if (err) {
          console.error('Registration login error:', err);
          return res.status(500).json({ 
            message: "Registration successful but login failed",
            success: false 
          });
        }
        
        // Return user without password
        const { password: _, ...userWithoutPassword } = newUser;
        
        res.status(201).json({
          message: "Registration successful",
          success: true,
          user: userWithoutPassword
        });
      });
      
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(500).json({ 
        message: "Registration failed",
        success: false 
      });
    }
  });

  // Get current user
  expressApp.get('/api/auth/user', (req, res) => {
    try {
      if (req.isAuthenticated() && req.user) {
        const user = { ...req.user };
        // Don't send sensitive information to the client
        delete (user as any).password;
        res.json({
          success: true,
          user: user
        });
      } else {
        res.status(401).json({ 
          message: "Not authenticated",
          success: false 
        });
      }
    } catch (error: any) {
      console.error('Get user error:', error);
      res.status(500).json({ 
        message: 'Failed to get user information',
        success: false 
      });
    }
  });

  // Logout
  expressApp.post('/api/auth/logout', (req, res) => {
    try {
      req.logout((err: any) => {
        if (err) {
          console.error('Logout error:', err);
          return res.status(500).json({ 
            message: 'Logout failed',
            success: false 
          });
        }
        res.json({ 
          message: 'Logout successful',
          success: true 
        });
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      res.status(500).json({ 
        message: 'Logout failed',
        success: false 
      });
    }
  });

  // Admin login endpoint
  expressApp.post('/api/auth/admin-login', async (req, res) => {
    try {
      const { username, password } = req.body;
      const clientIP = getClientIP(req);
      
      if (!username || !password) {
        return res.status(400).json({ 
          message: "Username and password are required",
          success: false 
        });
      }

      // Rate limiting for admin login
      const rateLimitId = `admin-login:${clientIP}`;
      if (rateLimiter.isRateLimited(rateLimitId)) {
        return res.status(429).json({ 
          message: "Too many admin login attempts. Please try again later.",
          success: false 
        });
      }

      // Find admin user
      const result = await db.select().from(schema.users).where(eq(schema.users.username, username));
      const user = result[0];
      
      if (!user) {
        rateLimiter.addAttempt(rateLimitId);
        return res.status(401).json({ 
          message: "Invalid admin credentials",
          success: false 
        });
      }
      
      if (!user.isAdmin) {
        rateLimiter.addAttempt(rateLimitId);
        return res.status(401).json({ 
          message: "Admin access required",
          success: false 
        });
      }
      
      if (!user.password) {
        rateLimiter.addAttempt(rateLimitId);
        return res.status(401).json({ 
          message: "Password login not available",
          success: false 
        });
      }
      
      const isValid = await comparePasswords(password, user.password);
      
      if (!isValid) {
        rateLimiter.addAttempt(rateLimitId);
        return res.status(401).json({ 
          message: "Invalid admin credentials",
          success: false 
        });
      }

      // Login the admin user
      req.login(user, (err: any) => {
        if (err) {
          console.error('Admin login error:', err);
          return res.status(500).json({ 
            message: "Admin login failed",
            success: false 
          });
        }

        // Reset rate limit on successful login
        rateLimiter.resetAttempts(rateLimitId);

        // Update last login
        db.update(schema.users)
          .set({ 
            lastLogin: new Date(),
            loginCount: sql`${schema.users.loginCount} + 1`
          })
          .where(eq(schema.users.id, user.id))
          .catch(err => console.error('Failed to update admin login info:', err));

        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        
        res.json({
          message: 'Admin login successful',
          success: true,
          user: userWithoutPassword
        });
      });

    } catch (error: any) {
      console.error('Admin login error:', error);
      res.status(500).json({ 
        message: 'Admin authentication service error',
        success: false 
      });
    }
  });

  // Discord status check
  expressApp.get('/api/auth/discord-status', async (req, res) => {
    try {
      console.log("[DEBUG] /api/auth/discord-status endpoint hit");
      const available = !!(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET);
      res.json({ 
        available,
        success: true 
      });
    } catch (error: any) {
      console.error('Discord status error:', error);
      res.status(500).json({ 
        message: "Failed to check Discord status",
        success: false 
      });
    }
  });

  // Mods endpoints
  expressApp.get('/api/mods', async (req, res) => {
    try {
      const { category, search, featured, limit = 12, page = 1, sortBy = 'newest' } = req.query;
      
      const pageSize = parseInt(limit as string);
      const currentPage = parseInt(page as string);
      const offset = (currentPage - 1) * pageSize;
      
      // Build query conditions
      const conditions: any[] = [];
      
      if (category) {
        conditions.push(eq(schema.mods.category, category as string));
      }
      
      if (search) {
        conditions.push(
          or(
            like(schema.mods.title, `%${search}%`),
            like(schema.mods.description, `%${search}%`)
          )
        );
      }
      
      if (featured === "true") {
        conditions.push(eq(schema.mods.isFeatured, true));
      }
      
      // Build the base query
      let baseQuery = db.select().from(schema.mods);
      
      // Apply conditions if any
      if (conditions.length > 0) {
        baseQuery = baseQuery.where(and(...conditions)) as any;
      }
      
      // Apply sorting and pagination
      let finalQuery;
      if (sortBy === 'oldest') {
        finalQuery = baseQuery.orderBy(asc(schema.mods.createdAt)).limit(pageSize).offset(offset);
      } else if (sortBy === 'popular') {
        finalQuery = baseQuery.orderBy(desc(schema.mods.downloadCount)).limit(pageSize).offset(offset);
      } else {
        // Default to newest
        finalQuery = baseQuery.orderBy(desc(schema.mods.createdAt)).limit(pageSize).offset(offset);
      }
      
      const mods = await finalQuery;
      
      // Get total count separately
      let countBaseQuery = db.select({ count: count() }).from(schema.mods);
      if (conditions.length > 0) {
        countBaseQuery = countBaseQuery.where(and(...conditions)) as any;
      }
      
      const [totalResult] = await countBaseQuery;
      const total = totalResult?.count || 0;
      
      res.json({
        success: true,
        mods,
        pagination: {
          total,
          page: currentPage,
          limit: pageSize,
          totalPages: Math.ceil(total / pageSize)
        }
      });
    } catch (error: any) {
      console.error("Error fetching mods:", error);
      res.status(500).json({ 
        message: "Failed to fetch mods",
        success: false 
      });
    }
  });

  // Featured mods
  expressApp.get('/api/mods/featured', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
      
      const mods = await db.select()
        .from(schema.mods)
        .where(eq(schema.mods.isFeatured, true))
        .limit(limit);
      
      res.json({ 
        success: true,
        mods 
      });
    } catch (error: any) {
      console.error("Error fetching featured mods:", error);
      res.status(500).json({ 
        message: "Failed to fetch featured mods",
        success: false 
      });
    }
  });

  // Get single mod
  expressApp.get('/api/mods/:id', async (req, res) => {
    try {
      const modId = parseInt(req.params.id);
      
      const result = await db.select().from(schema.mods).where(eq(schema.mods.id, modId));
      const mod = result[0];
      
      if (!mod) {
        return res.status(404).json({ 
          message: "Mod not found",
          success: false 
        });
      }
      
      // Get latest version
      const versionResult = await db.select()
        .from(schema.modVersions)
        .where(and(
          eq(schema.modVersions.modId, modId),
          eq(schema.modVersions.isLatest, true)
        ))
        .limit(1);
      
      const latestVersion = versionResult[0];
      
      res.json({
        success: true,
        mod: {
          ...mod,
          latestVersion,
          reviews: []
        }
      });
    } catch (error: any) {
      console.error("Error fetching mod:", error);
      res.status(500).json({ 
        message: "Failed to fetch mod",
        success: false 
      });
    }
  });

  // Cart endpoints
  expressApp.get('/api/cart', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      // Get cart items with mod details
      const cartItemsResult = await db.select({
        id: schema.cartItems.id,
        userId: schema.cartItems.userId,
        modId: schema.cartItems.modId,
        addedAt: schema.cartItems.addedAt,
        mod: {
          id: schema.mods.id,
          title: schema.mods.title,
          description: schema.mods.description,
          price: schema.mods.price,
          discountPrice: schema.mods.discountPrice,
          previewImageUrl: schema.mods.previewImageUrl,
          category: schema.mods.category,
          tags: schema.mods.tags,
          features: schema.mods.features,
          isSubscriptionOnly: schema.mods.isSubscriptionOnly,
        }
      })
      .from(schema.cartItems)
      .leftJoin(schema.mods, eq(schema.cartItems.modId, schema.mods.id))
      .where(eq(schema.cartItems.userId, userId));
      
      res.json({
        success: true,
        items: cartItemsResult
      });
    } catch (error: any) {
      console.error("Cart fetch error:", error);
      res.status(500).json({ 
        message: "Failed to retrieve cart items",
        success: false 
      });
    }
  });

  expressApp.post('/api/cart', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { modId } = req.body;
      
      if (!modId || isNaN(modId)) {
        return res.status(400).json({ 
          message: "Invalid mod ID",
          success: false 
        });
      }
      
      // Check if mod exists
      const modResult = await db.select().from(schema.mods).where(eq(schema.mods.id, modId));
      const mod = modResult[0];
      
      if (!mod) {
        return res.status(404).json({ 
          message: "Mod not found",
          success: false 
        });
      }
      
      // Check if already in cart
      const existingCartItem = await db.select()
        .from(schema.cartItems)
        .where(and(
          eq(schema.cartItems.userId, userId),
          eq(schema.cartItems.modId, modId)
        ));
      
      if (existingCartItem.length > 0) {
        return res.status(400).json({
          message: "Item already in cart",
          success: false
        });
      }
      
      // Check if already purchased
      const purchase = await db.select()
        .from(schema.purchases)
        .where(and(
          eq(schema.purchases.userId, userId),
          eq(schema.purchases.modId, modId)
        ));
      
      if (purchase.length > 0) {
        return res.status(400).json({ 
          message: "You already own this mod",
          success: false 
        });
      }
      
      // Add to cart
      const [cartItem] = await db.insert(schema.cartItems)
        .values({
          userId,
          modId,
          addedAt: new Date()
        })
        .returning();
      
      res.status(201).json({
        success: true,
        item: {
          ...cartItem,
          mod
        }
      });
    } catch (error: any) {
      console.error("Add to cart error:", error);
      res.status(500).json({ 
        message: "Failed to add item to cart",
        success: false 
      });
    }
  });

  expressApp.delete('/api/cart/:modId', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const modId = parseInt(req.params.modId);
      
      if (isNaN(modId)) {
        return res.status(400).json({ 
          message: "Invalid mod ID",
          success: false 
        });
      }
      
      await db.delete(schema.cartItems)
        .where(and(
          eq(schema.cartItems.userId, userId),
          eq(schema.cartItems.modId, modId)
        ));
      
      res.json({ 
        success: true,
        message: "Item removed from cart"
      });
    } catch (error: any) {
      console.error("Remove from cart error:", error);
      res.status(500).json({ 
        message: "Failed to remove item from cart",
        success: false 
      });
    }
  });

  expressApp.delete('/api/cart', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      await db.delete(schema.cartItems)
        .where(eq(schema.cartItems.userId, userId));
      
      res.json({ 
        success: true,
        message: "Cart cleared"
      });
    } catch (error: any) {
      console.error("Clear cart error:", error);
      res.status(500).json({ 
        message: "Failed to clear cart",
        success: false 
      });
    }
  });

  // Admin endpoints
  expressApp.get('/api/admin/settings', isAdmin, async (req, res) => {
    try {
      // Get settings from database
      const settings = await db.select().from(schema.siteSettings);
      const settingsObj: Record<string, string> = {};
      
      for (const setting of settings) {
        settingsObj[setting.key] = setting.value || '';
      }
      
      res.json({
        success: true,
        settings: {
          siteName: settingsObj.siteName || "JSD Mods",
          maintenanceMode: settingsObj.maintenanceMode === "true",
          discordEnabled: !!(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET),
          stripeEnabled: !!process.env.STRIPE_SECRET_KEY,
          ...settingsObj
        }
      });
    } catch (error: any) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ 
        message: "Failed to fetch settings",
        success: false 
      });
    }
  });

  expressApp.get('/api/admin/users', isAdmin, async (req, res) => {
    try {
      const users = await db.select().from(schema.users).orderBy(schema.users.username);
      
      res.json({
        success: true,
        users: users.map((user: any) => ({
          ...user,
          password: undefined // Never send passwords
        }))
      });
    } catch (error: any) {
      console.error("Error fetching users:", error);
      res.status(500).json({ 
        message: "Failed to fetch users",
        success: false 
      });
    }
  });

  expressApp.get('/api/admin/stats', isAdmin, async (req, res) => {
    try {
      // Get basic statistics
      const [usersResult] = await db.select({ count: count() }).from(schema.users);
      const [modsResult] = await db.select({ count: count() }).from(schema.mods);
      const [purchasesResult] = await db.select({ count: count() }).from(schema.purchases);
      
      const stats = {
        totalUsers: usersResult?.count || 0,
        totalMods: modsResult?.count || 0,
        totalPurchases: purchasesResult?.count || 0
      };
      
      // Add deals statistics (using in-memory deals for now)
      const dealStats = {
        totalDeals: activeDeals.length,
        activeDeals: activeDeals.filter(d => d.isActive).length,
        totalUsage: activeDeals.reduce((sum, deal) => sum + deal.usageCount, 0)
      };
      
      res.json({
        success: true,
        stats: {
          ...stats,
          deals: dealStats
        }
      });
    } catch (error: any) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ 
        message: "Failed to fetch statistics",
        success: false 
      });
    }
  });

  // Deals endpoints
  expressApp.get('/api/deals', (req, res) => {
    try {
      const activeOnly = req.query.active === 'true';
      const deals = activeOnly ? activeDeals.filter(deal => deal.isActive) : activeDeals;
      
      res.json({
        success: true,
        deals: deals.map(deal => ({
          ...deal,
          usageCount: deal.usageCount > 0 ? deal.usageCount : undefined
        }))
      });
    } catch (error: any) {
      console.error("Error fetching deals:", error);
      res.status(500).json({ 
        message: "Failed to fetch deals",
        success: false 
      });
    }
  });

  // Global error handling middleware
  expressApp.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ 
      message: "Internal server error",
      success: false,
      ...(process.env.NODE_ENV === 'development' && { error: err.message })
    });
  });

  // 404 handler
  expressApp.use('*', (req, res) => {
    res.status(404).json({ 
      message: "Endpoint not found",
      success: false,
      path: req.originalUrl,
      method: req.method
    });
  });
  
  app = expressApp;
  isInitialized = true;
  console.log("Production Express app initialized successfully with PostgreSQL");
  return expressApp;
}

// Weekend sales and promotional deals management
interface Deal {
  id: string;
  title: string;
  description: string;
  discount: number;
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  usageCount: number;
  maxUsage?: number;
  type: 'flash' | 'bundle' | 'premium' | 'limited' | 'seasonal';
  createdAt: Date;
  updatedAt: Date;
}

// In-memory storage for deals (in production, this would be in database)
const activeDeals: Deal[] = [
  {
    id: 'weekend-flash-sale',
    title: '⚡ Weekend Flash Sale',
    description: '40% off all premium mods - Limited time only!',
    discount: 40,
    isActive: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
    usageCount: 127,
    maxUsage: 500,
    type: 'flash',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'mega-monday',
    title: '💫 Mega Monday',
    description: 'Buy 2 get 1 FREE on all vehicle mods',
    discount: 33,
    isActive: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    usageCount: 89,
    type: 'bundle',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Vercel serverless function handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Create the Express app with direct PostgreSQL integration
    const expressApp = await createProductionApp();
    return expressApp(req as any, res as any);
    
  } catch (error) {
    console.error("Critical handler error:", error);
    
    return res.status(500).json({
      message: "Service temporarily unavailable",
      success: false,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { 
        error: error instanceof Error ? error.message : "Unknown error" 
      })
    });
  }
}