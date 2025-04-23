import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure the WebSocket for Neon
neonConfig.webSocketConstructor = ws;

// Ensure the database URL is available
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL environment variable is not set. Please make sure the database is properly configured."
  );
}

// Create a PostgreSQL connection pool
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Initialize Drizzle ORM with the connection and schema
export const db = drizzle(pool, { schema });

// Log successful database connection
console.log("Database connection established.");