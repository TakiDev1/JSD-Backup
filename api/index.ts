import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes";
import { seedDatabase } from "../server/seed";
import { pool } from "../server/db";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import 'dotenv/config';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
let isInitialized = false;

async function initializeApp() {
  if (isInitialized) return app;
  
  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Request logging
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  try {
    // Initialize database
    const client = await pool.connect();
    console.log("Database connection established.");
    client.release();
    
    // Seed database
    await seedDatabase();
  } catch (error) {
    console.error("Error connecting to database:", error);
  }
  
  // Register API routes
  await registerRoutes(app);

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  // Serve static files from dist/public
  const staticPath = path.resolve(__dirname, "..", "dist", "public");
  if (fs.existsSync(staticPath)) {
    app.use(express.static(staticPath, {
      setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
          res.setHeader('Content-Type', 'text/css');
        } else if (path.endsWith('.js')) {
          res.setHeader('Content-Type', 'application/javascript');
        }
      }
    }));
  }

  // Fallback to serve index.html for client-side routing
  app.use("*", (_req, res) => {
    const indexPath = path.resolve(staticPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ error: "Page not found" });
    }
  });
  
  isInitialized = true;
  return app;
}

// Vercel serverless function export
export default async function handler(req: Request, res: Response) {
  const expressApp = await initializeApp();
  return expressApp(req, res);
}