import { type VercelRequest, VercelResponse } from '@vercel/node';
import express from "express";
import { pool } from "../server/db";
import { storage } from "../server/storage";
import 'dotenv/config';

let app: express.Application | null = null;
let isInitialized = false;

// Simple in-memory cache to avoid repeated initialization
const initCache = {
  dbConnected: false,
  routesRegistered: false
};

async function createMinimalApp() {
  if (app && isInitialized) return app;
  
  console.log("Creating minimal Express app for Vercel...");
  
  const expressApp = express();
  
  // Basic middleware
  expressApp.use(express.json({ limit: '10mb' }));
  expressApp.use(express.urlencoded({ extended: false, limit: '10mb' }));

  // CORS
  expressApp.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // Database connection test
  if (!initCache.dbConnected) {
    try {
      console.log("Testing database connection...");
      const client = await pool.connect();
      console.log("Database connected successfully");
      client.release();
      initCache.dbConnected = true;
    } catch (error) {
      console.error("Database connection failed:", error);
    }
  }

  // Essential API routes only
  if (!initCache.routesRegistered) {
    // Health check
    expressApp.get('/health', (req, res) => {
      res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        message: 'JSD Mods API is running on Vercel',
        dbConnected: initCache.dbConnected
      });
    });

    // Basic mods endpoint
    expressApp.get('/api/mods', async (req, res) => {
      try {
        const { limit = 12, featured, category } = req.query;
        
        const mods = await storage.getMods({
          category: category as string,
          featured: featured === "true",
          limit: parseInt(limit as string)
        });
        
        res.json({ mods });
      } catch (error: any) {
        console.error("Error fetching mods:", error);
        res.status(500).json({ message: "Failed to fetch mods" });
      }
    });

    // Individual mod endpoint
    expressApp.get('/api/mods/:id', async (req, res) => {
      try {
        const mod = await storage.getMod(parseInt(req.params.id));
        
        if (!mod) {
          return res.status(404).json({ message: "Mod not found" });
        }
        
        res.json(mod);
      } catch (error: any) {
        console.error("Error fetching mod:", error);
        res.status(500).json({ message: "Failed to fetch mod" });
      }
    });

    // Auth check endpoint
    expressApp.get('/api/auth/user', (req, res) => {
      res.status(401).json({ message: "Authentication not available in minimal mode" });
    });

    // Cart endpoints (simplified)
    expressApp.get('/api/cart', (req, res) => {
      res.json([]);
    });

    expressApp.post('/api/cart', (req, res) => {
      res.status(501).json({ message: "Cart functionality not available in minimal mode" });
    });

    initCache.routesRegistered = true;
    console.log("Essential routes registered");
  }

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
      method: req.method,
      available_endpoints: ['/health', '/api/mods', '/api/mods/:id']
    });
  });
  
  app = expressApp;
  isInitialized = true;
  console.log("Minimal Express app created successfully");
  return expressApp;
}

// Vercel serverless function export
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    
    // Create the minimal Express app
    const expressApp = await createMinimalApp();
    
    // Handle the request with Express
    return expressApp(req as any, res as any);
    
  } catch (error) {
    console.error("Handler error:", error);
    
    // Return error response
    return res.status(500).json({
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    });
  }
}