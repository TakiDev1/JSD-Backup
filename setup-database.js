import { config } from 'dotenv';
import { Pool } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

// Load environment variables
config();

async function setupDatabase() {
  console.log('Setting up Neon database...');
  
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    // Read the SQL setup file
    const sqlContent = fs.readFileSync(path.join(process.cwd(), 'setup-neon-database.sql'), 'utf8');
    
    // Execute the SQL
    console.log('Executing database setup script...');
    await pool.query(sqlContent);
    
    console.log('✅ Database setup completed successfully!');
    
    // Verify tables were created
    const result = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('📋 Created tables:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();