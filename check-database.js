import { config } from 'dotenv';
import { Pool } from '@neondatabase/serverless';

// Load environment variables
config();

async function checkAndSetupDatabase() {
  console.log('Checking Neon database status...');
  
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    // Check existing tables
    const result = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('📋 Existing tables:');
    const existingTables = result.rows.map(row => row.table_name);
    existingTables.forEach(table => {
      console.log(`  ✅ ${table}`);
    });
    
    // Expected tables
    const expectedTables = [
      'users', 'site_settings', 'mods', 'mod_versions', 'purchases', 
      'cart_items', 'admin_activity_log', 'reviews', 'review_helpful_votes',
      'mod_downloads', 'mod_images', 'notifications', 'mod_requirements',
      'subscription_plans', 'subscription_benefits', 'roles', 'permissions',
      'role_permissions', 'user_roles', 'support_tickets'
    ];
    
    const missingTables = expectedTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length > 0) {
      console.log('\n❌ Missing tables:');
      missingTables.forEach(table => {
        console.log(`  - ${table}`);
      });
    } else {
      console.log('\n✅ All required tables exist!');
    }
    
    // Test basic database operations
    console.log('\n🔍 Testing database operations...');
    
    // Test user count
    const userCount = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`  Users: ${userCount.rows[0].count}`);
    
    // Test mod count
    const modCount = await pool.query('SELECT COUNT(*) as count FROM mods');
    console.log(`  Mods: ${modCount.rows[0].count}`);
    
    // Test site settings
    const settingsCount = await pool.query('SELECT COUNT(*) as count FROM site_settings');
    console.log(`  Site settings: ${settingsCount.rows[0].count}`);
    
    console.log('\n✅ Database is ready for use!');
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

checkAndSetupDatabase();