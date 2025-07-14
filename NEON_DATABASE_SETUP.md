# Setting Up Your Neon Database for JSD Mod Marketplace

## Prerequisites
1. A Neon account (sign up at https://neon.tech)
2. Node.js and npm installed
3. Your project environment variables configured

## Step 1: Create a New Neon Database

1. Log into your Neon dashboard
2. Click "Create Project"
3. Choose a name for your project (e.g., "jsd-mod-marketplace")
4. Select your preferred region
5. Click "Create Project"

## Step 2: Get Your Database Connection String

1. In your Neon dashboard, go to your project
2. Click on "Connection Details"
3. Copy the connection string (it looks like: `postgresql://user:password@host/database?sslmode=require`)
4. Save this for your `.env` file

## Step 3: Update Your Environment Variables

Create or update your `.env` file with:

```env
DATABASE_URL=your_neon_connection_string_here
```

## Step 4: Install Required Dependencies

Make sure you have the necessary packages installed:

```bash
npm install drizzle-orm drizzle-kit postgres
npm install -D @types/pg
```

## Step 5: Run the Database Setup Script

### Option A: Using psql (Recommended)
1. Install PostgreSQL client tools if you haven't already
2. Run the setup script:
```bash
psql "your_neon_connection_string_here" -f setup-neon-database.sql
```

### Option B: Using a Database Client
1. Open your preferred PostgreSQL client (DBeaver, pgAdmin, etc.)
2. Connect using your Neon connection string
3. Execute the contents of `setup-neon-database.sql`

### Option C: Using Node.js Script
Create a setup script and run it:
```bash
node -e "
const { Pool } = require('pg');
const fs = require('fs');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const sql = fs.readFileSync('setup-neon-database.sql', 'utf8');
pool.query(sql).then(() => {
  console('Database setup complete!');
  process.exit(0);
}).catch(console.error);
"
```

## Step 6: Generate and Run Drizzle Migrations

After setting up the base tables, sync your Drizzle schema:

```bash
# Generate migration files
npx drizzle-kit generate

# Apply migrations to your database
npx drizzle-kit migrate
```

## Step 7: Verify Your Setup

Check that all tables were created successfully:

```sql
-- Run this query to see all your tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see these tables:
- admin_activity_log
- cart_items
- mod_downloads
- mod_images
- mod_requirements
- mod_versions
- mods
- notifications
- permissions
- purchases
- review_helpful_votes
- reviews
- role_permissions
- roles
- site_settings
- subscription_benefits
- subscription_plans
- support_tickets
- user_roles
- users

## Step 8: Create Your First Admin User

Use the provided script to create an admin user:

```bash
npm run script:add-admin
```

Or manually insert an admin user:

```sql
-- Insert a test admin user (replace with your details)
INSERT INTO users (username, email, password, is_admin) 
VALUES ('admin', 'admin@example.com', 'hashed_password_here', true);

-- Assign admin role
INSERT INTO user_roles (user_id, role_id, assigned_by) 
VALUES (1, 1, 1);
```

## Database Schema Overview

Your database includes:

### Core Tables:
- **users**: User accounts with authentication, profile data, and analytics
- **mods**: Product catalog with pricing, descriptions, and metadata
- **purchases**: Transaction records with Stripe integration
- **reviews**: Product reviews with ratings and helpful votes

### Supporting Tables:
- **mod_versions**: Version history for mods
- **mod_images**: Additional product images
- **cart_items**: Shopping cart functionality
- **notifications**: User notification system

### Admin & Security:
- **roles/permissions**: Role-based access control
- **admin_activity_log**: Audit trail for admin actions
- **support_tickets**: Customer support system

### Business Features:
- **subscription_plans**: Subscription tiers and pricing
- **subscription_benefits**: Benefits for subscribers
- **site_settings**: Application configuration

## Next Steps

1. Test your database connection in your application
2. Run your application and verify everything works
3. Set up your Stripe webhook endpoints
4. Configure your authentication system
5. Test the admin panel functionality

## Troubleshooting

- If you get connection errors, check your DATABASE_URL format
- Make sure your Neon database allows connections from your IP
- Verify SSL mode is set correctly in your connection string
- Check that all foreign key constraints are properly set up

## Backup and Maintenance

- Neon provides automatic backups
- Consider setting up regular data exports for critical data
- Monitor your database usage in the Neon dashboard
- Set up alerts for connection limits and storage usage