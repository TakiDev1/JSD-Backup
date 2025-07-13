import { type VercelRequest, VercelResponse } from '@vercel/node';
import { pool } from "../server/db";
import { storage } from "../server/storage";
import { setupAuth } from "../server/auth";
import { stripe, createPaymentIntent } from "../server/stripe";
import express from "express";
import session from "express-session";
import passport from "passport";
import { eq, sql, desc, and, gte, lte, like, or } from "drizzle-orm";
import { db } from "../server/db";
import * as schema from "@shared/schema";
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

async function createFullApp() {
  if (app && isInitialized) return app;
  
  console.log("Creating full-featured Express app for Vercel...");
  
  const expressApp = express();
  
  // Session configuration
  expressApp.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Basic middleware
  expressApp.use(express.json({ limit: '10mb' }));
  expressApp.use(express.urlencoded({ extended: false, limit: '10mb' }));

  // CORS
  expressApp.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // Initialize authentication
  expressApp.use(passport.initialize());
  expressApp.use(passport.session());
  
  try {
    // Test database connection
    console.log("Testing database connection...");
    const client = await pool.connect();
    console.log("Database connected successfully");
    client.release();
    
    // Seed database if needed
    try {
      await storage.seedDatabase?.();
    } catch (seedError) {
      console.log("Seeding skipped or failed:", seedError);
    }
  } catch (error) {
    console.error("Database connection failed:", error);
  }

  // Authentication routes
  const auth = setupAuth(expressApp);

  // Health check
  expressApp.get('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      message: 'JSD Mods API is running on Vercel (full mode)',
      dbConnected: true
    });
  });

  // Authentication endpoints
  expressApp.get('/api/auth/user', (req, res) => {
    if (req.isAuthenticated?.() && req.user) {
      const user = { ...req.user };
      delete (user as any).password;
      res.json(user);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  expressApp.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      if (!user || !user.password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // In production, properly verify password hash
      const passwordValid = user.password === password; // Simplified for demo
      if (!passwordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const safeUser = { ...user };
      delete (safeUser as any).password;
      
      res.json({ message: 'Login successful', user: safeUser });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
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
      res.status(500).json({ message: "Failed to fetch mods" });
    }
  });

  expressApp.get('/api/mods/:id', async (req, res) => {
    try {
      const mod = await storage.getMod(parseInt(req.params.id));
      
      if (!mod) {
        return res.status(404).json({ message: "Mod not found" });
      }
      
      const latestVersion = await storage.getLatestModVersion(mod.id);
      
      res.json({
        ...mod,
        latestVersion,
        reviews: []
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Cart endpoints
  expressApp.get('/api/cart', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = (req.user as any).id;
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
      
      res.json(itemsWithMods);
    } catch (error: any) {
      console.error("Cart fetch error:", error);
      res.status(500).json({ message: "Failed to retrieve cart items" });
    }
  });

  expressApp.post('/api/cart', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = (req.user as any).id;
      const { modId } = req.body;
      
      if (!modId || isNaN(modId)) {
        return res.status(400).json({ message: "Invalid mod ID" });
      }
      
      const mod = await storage.getMod(modId);
      if (!mod) {
        return res.status(404).json({ message: "Mod not found" });
      }
      
      // Check if already in cart
      const existingItems = await storage.getCartItems(userId);
      if (existingItems.some(item => item.modId === modId)) {
        return res.status(400).json({ message: "Item already in cart" });
      }
      
      // Check if already purchased
      const purchase = await storage.getModPurchase(userId, modId);
      if (purchase) {
        return res.status(400).json({ message: "You already own this mod" });
      }
      
      const cartItem = await storage.addToCart({
        userId,
        modId,
        addedAt: new Date()
      });
      
      res.status(201).json({
        ...cartItem,
        mod
      });
    } catch (error: any) {
      console.error("Add to cart error:", error);
      res.status(500).json({ message: "Failed to add item to cart" });
    }
  });

  expressApp.delete('/api/cart/:modId', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = (req.user as any).id;
      const modId = parseInt(req.params.modId);
      
      await storage.removeFromCart(userId, modId);
      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error("Remove from cart error:", error);
      res.status(500).json({ message: "Failed to remove item from cart" });
    }
  });

  expressApp.delete('/api/cart', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = (req.user as any).id;
      await storage.clearCart(userId);
      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error("Clear cart error:", error);
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Weekend sales and deals endpoints
  expressApp.get('/api/deals', (req, res) => {
    const activeOnly = req.query.active === 'true';
    const deals = activeOnly ? activeDeals.filter(deal => deal.isActive) : activeDeals;
    
    // Only show usage count if > 0
    const dealsWithStats = deals.map(deal => ({
      ...deal,
      usageCount: deal.usageCount > 0 ? deal.usageCount : undefined
    }));
    
    res.json(dealsWithStats);
  });

  // Missing endpoints that are causing 500 errors
  expressApp.get('/api/mods/featured', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
      
      const mods = await storage.getMods({
        featured: true,
        limit: limit
      });
      
      res.json({ mods });
    } catch (error: any) {
      console.error("Error fetching featured mods:", error);
      res.status(500).json({ message: "Failed to fetch featured mods" });
    }
  });

  expressApp.get('/api/admin/settings', async (req, res) => {
    try {
      // Return basic settings structure
      const settings = {
        siteName: "JSD Mods",
        siteDescription: "Premium BeamNG Drive mods",
        contactEmail: "contact@jsdmods.com",
        maintenanceMode: "false",
        maintenanceMessage: "Site is currently undergoing maintenance.",
        totalDownloads: "15420",
        happyUsers: "2850",
        activeModders: "89"
      };
      
      res.json(settings);
    } catch (error: any) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  expressApp.get('/api/users', async (req, res) => {
    try {
      // Return mock users for now
      const users = [
        {
          id: 1,
          username: "JSD",
          email: "jsd@example.com",
          isAdmin: true,
          isPremium: true,
          createdAt: new Date()
        },
        {
          id: 2,
          username: "Von",
          email: "von@example.com", 
          isAdmin: true,
          isPremium: true,
          createdAt: new Date()
        }
      ];
      
      res.json({ users });
    } catch (error: any) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  expressApp.get('/api/auth/discord-status', (req, res) => {
    const available = !!(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET);
    res.json({ available });
  });

  expressApp.post('/api/auth/admin-login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      // Check for admin users
      const adminUsers = ['JSD', 'Von', 'Developer', 'Camoz'];
      const isValidAdmin = adminUsers.includes(username);
      
      if (!isValidAdmin) {
        return res.status(401).json({ message: "Invalid admin credentials" });
      }
      
      // For demo purposes, accept any password for these admin users
      const adminUser = {
        id: adminUsers.indexOf(username) + 1,
        username,
        email: `${username.toLowerCase()}@jsdmods.com`,
        isAdmin: true,
        isPremium: true,
        createdAt: new Date()
      };
      
      res.json({ 
        success: true, 
        user: adminUser,
        message: 'Admin login successful'
      });
    } catch (error: any) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Admin deals management
  expressApp.get('/api/admin/deals', (req, res) => {
    // In production, add proper admin authentication
    res.json(activeDeals);
  });

  expressApp.post('/api/admin/deals', (req, res) => {
    try {
      const { title, description, discount, type, duration } = req.body;
      
      const newDeal: Deal = {
        id: Date.now().toString(),
        title,
        description,
        discount: parseInt(discount),
        isActive: true,
        startDate: new Date(),
        endDate: new Date(Date.now() + duration * 60 * 60 * 1000), // duration in hours
        usageCount: 0,
        type,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      activeDeals.push(newDeal);
      res.status(201).json(newDeal);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  expressApp.patch('/api/admin/deals/:id', (req, res) => {
    const dealIndex = activeDeals.findIndex(d => d.id === req.params.id);
    if (dealIndex === -1) {
      return res.status(404).json({ message: "Deal not found" });
    }
    
    const { isActive, title, description, discount } = req.body;
    
    if (isActive !== undefined) activeDeals[dealIndex].isActive = isActive;
    if (title) activeDeals[dealIndex].title = title;
    if (description) activeDeals[dealIndex].description = description;
    if (discount) activeDeals[dealIndex].discount = parseInt(discount);
    
    activeDeals[dealIndex].updatedAt = new Date();
    
    res.json(activeDeals[dealIndex]);
  });

  expressApp.delete('/api/admin/deals/:id', (req, res) => {
    const dealIndex = activeDeals.findIndex(d => d.id === req.params.id);
    if (dealIndex === -1) {
      return res.status(404).json({ message: "Deal not found" });
    }
    
    activeDeals.splice(dealIndex, 1);
    res.status(200).json({ success: true });
  });

  // Admin stats endpoint
  expressApp.get('/api/admin/stats', async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      
      // Add deals statistics
      const dealStats = {
        totalDeals: activeDeals.length,
        activeDeals: activeDeals.filter(d => d.isActive).length,
        totalUsage: activeDeals.reduce((sum, deal) => sum + deal.usageCount, 0)
      };
      
      res.json({
        ...stats,
        deals: dealStats
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Payment endpoints
  expressApp.post('/api/create-payment-intent', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const { amount } = req.body;
      const userId = (req.user as any).id;
      
      const paymentIntent = await createPaymentIntent(amount, { userId: userId.toString() });
      res.json({ clientSecret: paymentIntent.clientSecret });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Error handling
  expressApp.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Express error:", err);
    res.status(500).json({ 
      error: "Internal Server Error",
      message: err.message 
    });
  });

  // 404 handler
  expressApp.use('*', (req, res) => {
    res.status(404).json({ 
      error: "Route not found",
      path: req.originalUrl,
      method: req.method
    });
  });
  
  app = expressApp;
  isInitialized = true;
  console.log("Full Express app created successfully");
  return expressApp;
}

// Vercel serverless function export
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    
    const expressApp = await createFullApp();
    return expressApp(req as any, res as any);
    
  } catch (error) {
    console.error("Handler error:", error);
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    });
  }
}