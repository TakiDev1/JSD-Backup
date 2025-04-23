import { resolve } from 'path';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '@shared/schema';

// Initialize SQLite database
const sqlite = new Database(process.env.DATABASE_PATH || ':memory:');
export const db = drizzle(sqlite, { schema });

// Enable foreign keys
sqlite.pragma('foreign_keys = ON');

// Initialize database tables if they don't exist
export function initializeDatabase() {
  // Users table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT,
      discord_id TEXT UNIQUE,
      discord_username TEXT,
      discord_avatar TEXT,
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      is_admin INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      last_login INTEGER
    );
  `);

  // Mods table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS mods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      discount_price REAL,
      thumbnail TEXT NOT NULL,
      category TEXT NOT NULL,
      tags TEXT DEFAULT '[]',
      featured INTEGER DEFAULT 0,
      download_count INTEGER DEFAULT 0,
      average_rating REAL DEFAULT 0,
      is_subscription_only INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  // Mod versions table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS mod_versions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mod_id INTEGER NOT NULL,
      version TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      changelog TEXT,
      is_latest INTEGER DEFAULT 1,
      release_date INTEGER NOT NULL,
      FOREIGN KEY (mod_id) REFERENCES mods (id) ON DELETE CASCADE
    );
  `);

  // Purchases table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      mod_id INTEGER NOT NULL,
      transaction_id TEXT NOT NULL,
      price REAL NOT NULL,
      purchase_date INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (mod_id) REFERENCES mods (id) ON DELETE CASCADE
    );
  `);

  // Reviews table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      mod_id INTEGER NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (mod_id) REFERENCES mods (id) ON DELETE CASCADE
    );
  `);

  // Forum categories table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS forum_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      order_num INTEGER DEFAULT 0
    );
  `);

  // Forum threads table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS forum_threads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      is_pinned INTEGER DEFAULT 0,
      is_locked INTEGER DEFAULT 0,
      view_count INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (category_id) REFERENCES forum_categories (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
  `);

  // Forum replies table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS forum_replies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      thread_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (thread_id) REFERENCES forum_threads (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
  `);

  // Cart items table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      mod_id INTEGER NOT NULL,
      added_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (mod_id) REFERENCES mods (id) ON DELETE CASCADE
    );
  `);
}

// Initialize the database on server start
initializeDatabase();
