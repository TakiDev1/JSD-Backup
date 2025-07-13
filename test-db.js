import { config } from 'dotenv';
import { Pool } from '@neondatabase/serverless';

// Load environment variables
config();

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Test basic connection
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Database connection successful!');
    console.log('Current time:', result.rows[0].current_time);
    
    // Test if users table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    console.log('✅ Users table exists:', tableCheck.rows[0].exists);
    
    // Count users
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    console.log('✅ Total users in database:', userCount.rows[0].count);
    
    // List admin users
    const adminUsers = await pool.query('SELECT id, username, "isAdmin" FROM users WHERE "isAdmin" = true');
    console.log('✅ Admin users found:', adminUsers.rows);
    
    await pool.end();
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    process.exit(1);
  }
}

testDatabase();