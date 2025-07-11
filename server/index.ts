import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedDatabase } from "./seed";
import { pool } from "./db";
import 'dotenv/config';

const app = express();

// Debug middleware to log all incoming requests
app.use((req, res, next) => {
  console.log(`[DEBUG] ${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Log raw body for debugging
  let rawBody = '';
  req.on('data', chunk => {
    rawBody += chunk.toString();
  });
  
  req.on('end', () => {
    if (rawBody) {
      console.log(`[DEBUG] Raw request body: ${rawBody}`);
    }
    
    // Capture outgoing response
    const originalSend = res.send;
    res.send = function(body) {
      console.log(`[DEBUG] Response for ${req.method} ${req.url}: ${body ? body.toString().substring(0, 200) : 'empty'}`);
      return originalSend.call(this, body);
    };
  });
  
  next();
});

// Standard middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Check connection to database 
  try {
    const client = await pool.connect();
    console.log("Database connection established.");
    client.release();
    
    // Seed database with initial data
    await seedDatabase();
  } catch (error) {
    console.error("Error connecting to database:", error);
  }
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 3000; // Changed port from 5000 to 3000
  server.listen({
    port,
    host: "127.0.0.1", // Keeping host as 127.0.0.1
  }, () => {
    log(`serving on port ${port}`);
  });
})();
