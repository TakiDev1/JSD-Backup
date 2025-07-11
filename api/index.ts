import { type VercelRequest, VercelResponse } from '@vercel/node';
import express from "express";
import { registerRoutes } from "../server/routes";
import { seedDatabase } from "../server/seed";
import { pool } from "../server/db";
import 'dotenv/config';

let app: express.Application | null = null;
let isInitialized = false;

async function initializeApp() {
  if (isInitialized && app) return app;
  
  console.log("Initializing Express app for Vercel...");
  
  // Create Express app
  const expressApp = express();
  
  // Basic middleware
  expressApp.use(express.json({ limit: '50mb' }));
  expressApp.use(express.urlencoded({ extended: false, limit: '50mb' }));

  // CORS middleware for Vercel
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

  // Request logging
  expressApp.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  try {
    // Initialize database connection
    console.log("Connecting to database...");
    const client = await pool.connect();
    console.log("Database connection established.");
    client.release();
    
    // Seed database (only if needed)
    console.log("Seeding database...");
    await seedDatabase();
    console.log("Database seeding completed.");
  } catch (error) {
    console.error("Database initialization error:", error);
    // Don't throw - allow app to continue without database
  }
  
  try {
    // Register API routes
    console.log("Registering routes...");
    await registerRoutes(expressApp);
    console.log("Routes registered successfully.");
  } catch (error) {
    console.error("Route registration error:", error);
    throw error; // This is critical, so throw
  }

  // Health check endpoint
  expressApp.get('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      message: 'JSD Mods API is running on Vercel'
    });
  });

  // Error handling middleware
  expressApp.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Express error:", err);
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ 
      error: message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  });

  // 404 handler for unmatched routes
  expressApp.use('*', (req, res) => {
    console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ 
      error: "Route not found",
      path: req.originalUrl,
      method: req.method
    });
  });
  
  app = expressApp;
  isInitialized = true;
  console.log("Express app initialization completed.");
  return expressApp;
}

// Vercel serverless function export
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log(`Handling request: ${req.method} ${req.url}`);
    
    // Initialize the Express app
    const expressApp = await initializeApp();
    
    // Handle the request with Express
    return expressApp(req as any, res as any);
    
  } catch (error) {
    console.error("Handler error:", error);
    
    // Return error response
    res.status(500).json({
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    });
  }
}