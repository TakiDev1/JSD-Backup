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

let isInitialized = false;

async function initializeApp() {
  if (isInitialized) return;
  
  try {
    // Check connection to database 
    const client = await pool.connect();
    console.log("Database connection established.");
    client.release();
    
    // Seed database with initial data
    await seedDatabase();
  } catch (error) {
    console.error("Error connecting to database:", error);
  }
  
  await registerRoutes(app);

  // Catch-all error handler for uncaught errors
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    console.error('[GLOBAL ERROR HANDLER]', err);
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).type('application/json').json({ message, success: false });
  });

  // 404 handler for unmatched routes
  app.use('*', (req, res) => {
    res.status(404).type('application/json').json({
      message: "Endpoint not found",
      success: false,
      path: req.originalUrl,
      method: req.method
    });
  });

  // For Vercel deployment, always serve static files
  serveStatic(app);
  
  isInitialized = true;
}

// For Vercel serverless deployment
export default async function handler(req: Request, res: Response) {
  await initializeApp();
  return app(req, res);
}

// For local development
if (process.env.NODE_ENV !== 'production') {
  (async () => {
    await initializeApp();
    
    // For development, setup Vite
    if (app.get("env") === "development") {
      const { createServer } = await import('http');
      const server = createServer(app);
      await setupVite(app, server);
    }

    const port = process.env.PORT || 5000;
    app.listen(port, "0.0.0.0", () => {
      log(`serving on port ${port}`);
      console.log(`✅ Server started successfully`);
      console.log(`🔗 Local URL: http://localhost:${port}`);
      console.log(`🔗 Discord auth: http://localhost:${port}/api/auth/discord`);
    });
  })();
} else {
  // For production, also start the server if not running in serverless mode
  if (process.env.VERCEL !== '1') {
    (async () => {
      await initializeApp();
      
      const port = process.env.PORT || 5000;
      app.listen(port, "0.0.0.0", () => {
        log(`Production server serving on port ${port}`);
        console.log(`✅ Production server started successfully`);
        console.log(`🔗 Discord auth: https://jsdmods.com/api/auth/discord`);
      });
    })();
  }
}
