import { type VercelRequest, VercelResponse } from '@vercel/node';
import { AuthService, RateLimiter } from "../server/auth-service";
import { storage } from "../server/storage";
import { createPaymentIntent } from "../server/stripe";
import express from "express";
import cors from "cors";
import 'dotenv/config';

let app: express.Application | null = null;
let isInitialized = false;

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

// Helper function to get client IP
function getClientIP(req: any): string {
  return req.headers['x-forwarded-for']?.split(',')[0] || 
         req.headers['x-real-ip'] || 
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress || 
         'unknown';
}

async function createProductionApp() {
  if (app && isInitialized) return app;
  
  console.log("Creating production-ready Express app for Vercel...");
  
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
      message: 'JSD Mods API is running (Production)',
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Authentication endpoints
  expressApp.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      console.log(`[DEBUG] /api/auth/login endpoint hit for username: ${username}`);
      const clientIP = getClientIP(req);
      if (!username || !password) {
        return res.status(400).type('application/json').json({ 
          message: "Username and password are required",
          success: false 
        });
      }

      // Rate limiting
      const rateLimitId = `login:${clientIP}`;
      if (RateLimiter.isRateLimited(rateLimitId)) {
        return res.status(429).json({ 
          message: "Too many login attempts. Please try again later.",
          success: false 
        });
      }

      // Authenticate user
      const result = await AuthService.authenticate(username, password);
      
      if (!result) {
        return res.status(401).json({ 
          message: "Invalid username or password",
          success: false 
        });
      }

      // Reset rate limit on successful login
      RateLimiter.resetAttempts(rateLimitId);

      res.json({
        message: 'Login successful',
        success: true,
        user: result.user,
        token: result.token
      });

    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).type('application/json').json({ 
        message: 'Authentication service temporarily unavailable',
        success: false 
      });
    }
  });

  // User registration route
  expressApp.post("/api/auth/register", async (req, res) => {
    try {
      const { username, email, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const result = await AuthService.register(username, email, password);
      
      if (!result) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      res.status(201).json({
        message: "Registration successful",
        token: result.token,
        user: result.user
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  expressApp.get('/api/auth/user', async (req, res) => {
    try {
      const token = AuthService.extractTokenFromHeader(req.headers.authorization);
      
      if (!token) {
        return res.status(401).json({ 
          message: "Not authenticated",
          success: false 
        });
      }

      const user = await AuthService.getUserFromToken(token);
      
      if (!user) {
        return res.status(401).json({ 
          message: "Invalid or expired token",
          success: false 
        });
      }

      res.json({
        success: true,
        user: user
      });

    } catch (error: any) {
      console.error('Get user error:', error);
      res.status(500).json({ 
        message: 'Authentication service temporarily unavailable',
        success: false 
      });
    }
  });

  expressApp.post('/api/auth/logout', async (req, res) => {
    try {
      // In JWT-based auth, logout is handled client-side by removing the token
      res.json({ 
        message: 'Logout successful',
        success: true 
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      res.status(500).json({ 
        message: 'Logout failed',
        success: false 
      });
    }
  });

  expressApp.post('/api/auth/refresh', async (req, res) => {
    try {
      const token = AuthService.extractTokenFromHeader(req.headers.authorization);
      
      if (!token) {
        return res.status(401).json({ 
          message: "No token provided",
          success: false 
        });
      }

      const result = await AuthService.refreshToken(token);
      
      if (!result) {
        return res.status(401).json({ 
          message: "Invalid or expired token",
          success: false 
        });
      }

      res.json({
        message: 'Token refreshed successfully',
        success: true,
        user: result.user,
        token: result.token
      });

    } catch (error: any) {
      console.error('Token refresh error:', error);
      res.status(500).json({ 
        message: 'Token refresh failed',
        success: false 
      });
    }
  });

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
      res.status(500).type('application/json').json({ 
        message: "Failed to check Discord status",
        success: false 
      });
    }
  });

  // Mods endpoints
  expressApp.get('/api/mods', async (req, res) => {
    try {
      const { category, search, featured, limit = 12, page = 1, sortBy = 'newest' } = req.query;
      
      const mods = await storage.getMods({
        category: category as string,
        searchTerm: search as string,
        featured: featured === "true",
        limit: parseInt(limit as string),
        offset: (parseInt(page as string) - 1) * parseInt(limit as string)
      });
      
      const total = await storage.getModsCount({
        category: category as string,
        searchTerm: search as string,
        featured: featured === "true"
      });
      
      res.json({
        success: true,
        mods,
        pagination: {
          total,
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          totalPages: Math.ceil(total / parseInt(limit as string))
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

  expressApp.get('/api/mods/featured', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
      
      const mods = await storage.getMods({
        featured: true,
        limit: limit
      });
      
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

  expressApp.get('/api/mods/:id', async (req, res) => {
    try {
      const mod = await storage.getMod(parseInt(req.params.id));
      
      if (!mod) {
        return res.status(404).json({ 
          message: "Mod not found",
          success: false 
        });
      }
      
      const latestVersion = await storage.getLatestModVersion(mod.id);
      
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

  // Protected cart endpoints
  expressApp.get('/api/cart', AuthService.authMiddleware, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const cartItems = await storage.getCartItems(userId);
      
      // Get mod details for each cart item
      const itemsWithMods = await Promise.all(
        cartItems.map(async (item) => {
          const mod = await storage.getMod(item.modId);
          return {
            ...item,
            mod
          };
        })
      );
      
      res.json({
        success: true,
        items: itemsWithMods
      });
    } catch (error: any) {
      console.error("Cart fetch error:", error);
      res.status(500).json({ 
        message: "Failed to retrieve cart items",
        success: false 
      });
    }
  });

  expressApp.post('/api/cart', AuthService.authMiddleware, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { modId } = req.body;
      
      if (!modId || isNaN(modId)) {
        return res.status(400).json({ 
          message: "Invalid mod ID",
          success: false 
        });
      }
      
      const mod = await storage.getMod(modId);
      if (!mod) {
        return res.status(404).json({ 
          message: "Mod not found",
          success: false 
        });
      }
      
      // Check if already in cart
      const existingItems = await storage.getCartItems(userId);
      if (existingItems.some(item => item.modId === modId)) {
        return res.status(400).json({ 
          message: "Item already in cart",
          success: false 
        });
      }
      
      // Check if already purchased
      const purchase = await storage.getModPurchase(userId, modId);
      if (purchase) {
        return res.status(400).json({ 
          message: "You already own this mod",
          success: false 
        });
      }
      
      const cartItem = await storage.addToCart({
        userId,
        modId,
        addedAt: new Date()
      });
      
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

  expressApp.delete('/api/cart/:modId', AuthService.authMiddleware, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const modId = parseInt(req.params.modId);
      
      await storage.removeFromCart(userId, modId);
      
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

  expressApp.delete('/api/cart', AuthService.authMiddleware, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      await storage.clearCart(userId);
      
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

  // Admin endpoints
  expressApp.get('/api/admin/settings', AuthService.adminMiddleware, async (req, res) => {
    try {
      // For now, return basic settings - this would be from database in production
      const settings = {
        siteName: "JSD Mods",
        maintenanceMode: false,
        discordEnabled: !!(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET),
        stripeEnabled: !!process.env.STRIPE_SECRET_KEY
      };
      
      res.json({
        success: true,
        settings
      });
    } catch (error: any) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ 
        message: "Failed to fetch settings",
        success: false 
      });
    }
  });

  expressApp.get('/api/admin/users', AuthService.adminMiddleware, async (req, res) => {
    try {
      // Get all users - in production this would have pagination
      const users = await storage.getAllUsers();
      res.json({
        success: true,
        users: users.map(user => ({
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

  expressApp.get('/api/admin/stats', AuthService.adminMiddleware, async (req, res) => {
    try {
      // Get basic statistics
      const stats = {
        totalUsers: await storage.getUserCount(),
        totalMods: await storage.getModsCount({}),
        totalPurchases: await storage.getPurchaseCount()
      };
      
      // Add deals statistics
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

  // Payment endpoints
  expressApp.post('/api/create-payment-intent', AuthService.authMiddleware, async (req, res) => {
    try {
      const { amount } = req.body;
      const userId = (req as any).user.id;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ 
          message: "Invalid amount",
          success: false 
        });
      }
      
      const paymentIntent = await createPaymentIntent(amount, { userId: userId.toString() });
      
      res.json({ 
        success: true,
        clientSecret: paymentIntent.clientSecret 
      });
    } catch (error: any) {
      console.error("Payment intent error:", error);
      res.status(500).json({ 
        message: "Failed to create payment",
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
      if (RateLimiter.isRateLimited(rateLimitId)) {
        return res.status(429).json({ 
          message: "Too many admin login attempts. Please try again later.",
          success: false 
        });
      }

      // Authenticate admin user
      const result = await AuthService.authenticateAdmin(username, password);
      
      if (!result) {
        return res.status(401).json({ 
          message: "Invalid admin credentials",
          success: false 
        });
      }

      // Reset rate limit on successful login
      RateLimiter.resetAttempts(rateLimitId);

      res.json({
        message: 'Admin login successful',
        success: true,
        user: result.user,
        token: result.token
      });

    } catch (error: any) {
      console.error('Admin login error:', error);
      res.status(500).json({ 
        message: 'Admin authentication service temporarily unavailable',
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
  console.log("Production Express app initialized successfully");
  return expressApp;
}

// Vercel serverless function handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
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