import { type Request, Response } from "express";
import { registerRoutes } from "../server/routes";
import { pool } from "../server/db";
import { seedDatabase } from "../server/seed";
import 'dotenv/config';

let initialized = false;

const initialize = async () => {
  if (initialized) return;
  
  try {
    const client = await pool.connect();
    console.log("Database connection established.");
    client.release();
    
    // Seed database with initial data
    await seedDatabase();
    initialized = true;
  } catch (error) {
    console.error("Error connecting to database:", error);
  }
};

// For Vercel serverless deployment
export default async (req: Request, res: Response) => {
  try {
    // Initialize database connection
    await initialize();
    
    // Create a minimal Express-like handler
    const mockApp = {
      use: () => {},
      get: () => {},
      post: () => {},
      put: () => {},
      delete: () => {},
      patch: () => {},
      all: () => {},
      listen: () => {},
      set: () => {},
      locals: {}
    };
    
    // Register routes
    await registerRoutes(mockApp as any);
    
    // For now, return a simple response to test deployment
    res.status(200).json({ 
      message: "BeamNG Mod Shop API is running on Vercel",
      timestamp: new Date().toISOString(),
      path: req.url 
    });
    
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ 
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};