# JSD Mods Marketplace

## Overview

JSD Mods Marketplace is a full-stack web application designed specifically for selling BeamNG.drive mods. The platform features a modern React frontend with Express.js backend, PostgreSQL database with Drizzle ORM, and integrated payment processing via Stripe.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state, React Context for local state
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS v4 with dark theme
- **Build Tool**: Vite with custom configuration for monorepo structure

### Backend Architecture
- **Runtime**: Node.js 20 with Express.js
- **Authentication**: Passport.js with local and Discord OAuth strategies
- **Session Management**: PostgreSQL-backed sessions with connect-pg-simple
- **File Uploads**: Multer for handling mod files and images
- **Payment Processing**: Stripe for subscriptions and one-time purchases

### Database Design
- **Primary Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` for type-safe database operations
- **Migration System**: Drizzle Kit for schema management
- **Connection**: Neon serverless PostgreSQL with connection pooling

## Key Components

### Authentication System
- **Multi-provider**: Local authentication with username/password and Discord OAuth
- **Session-based**: Secure session management with PostgreSQL storage
- **Role-based Access**: Admin and premium user roles with middleware protection
- **Password Security**: Scrypt-based password hashing with salt

### E-commerce Features
- **Shopping Cart**: Session-persistent cart with real-time updates
- **Payment Processing**: Stripe integration for subscriptions and one-time purchases
- **Subscription Management**: Premium tiers with automatic renewal
- **Digital Downloads**: Secure mod file delivery system

### Admin Panel
- **User Management**: Create, edit, ban users with role assignment
- **Mod Management**: Upload, edit, delete mods with versioning
- **Site Settings**: Maintenance mode, payment configuration, Discord integration
- **Analytics Dashboard**: Sales statistics and user metrics

### Mod System
- **Categories**: Specialized for BeamNG mods (vehicles, sports cars, drift cars, etc.)
- **File Management**: Secure upload and storage of mod files
- **Versioning**: Support for multiple mod versions with release notes
- **Featured Content**: Ability to highlight premium mods

## Data Flow

1. **User Authentication**: Users authenticate via Discord OAuth or local credentials
2. **Mod Browsing**: Public mod catalog with search and filtering capabilities
3. **Shopping Cart**: Authenticated users can add mods to cart with persistence
4. **Payment Processing**: Stripe handles payment for individual mods or subscriptions
5. **Digital Delivery**: Purchased mods become available in user's "Mod Locker"
6. **Admin Operations**: Admins manage content, users, and site settings through dedicated interface

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **stripe**: Payment processing and subscription management
- **passport**: Authentication framework with Discord strategy
- **multer**: File upload handling for mods and images
- **drizzle-orm**: Type-safe database queries and migrations

### Frontend Dependencies
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/react-***: Accessible UI component primitives
- **framer-motion**: Animation library (imported but usage limited)
- **wouter**: Lightweight client-side routing

### Development Dependencies
- **tsx**: TypeScript execution for development
- **esbuild**: Fast bundling for production builds
- **tailwindcss**: Utility-first CSS framework

## Deployment Strategy

### Replit Configuration
- **Environment**: Node.js 20, Web, PostgreSQL 16 modules
- **Build Process**: Vite builds frontend, esbuild bundles backend
- **Production**: Autoscale deployment target with port 80 external mapping
- **Development**: Hot reload with tsx and Vite dev server on port 5000

### Database Setup
- **Schema Management**: Drizzle migrations in `/migrations` directory
- **Environment Variables**: `DATABASE_URL` required for PostgreSQL connection
- **Connection Pooling**: Neon serverless with WebSocket support

### File Storage
- **Local Storage**: Uploaded files stored in `/uploads` directory
- **Static Serving**: Express serves uploaded files as static content
- **File Organization**: Separate folders for images and mod files

## Recent Changes

### July 3, 2025
- Successfully completed comprehensive role-based access control system
- Deployed full role management interface with CRUD operations for roles, permissions, and user assignments
- Added role management navigation to admin dashboard with Shield icon quick action
- Integrated role management route at /admin/roles with proper authentication and permission checking
- Database initialization completed with 28 permissions across 6 categories (users, mods, analytics, content, system, roles)
- Created 5 default roles: super_admin (28 permissions), admin (14 permissions), moderator (6 permissions), premium_user (3 permissions), user (3 permissions)
- All existing admin users automatically assigned super_admin role for seamless transition
- Role management system fully operational with permission-based access control throughout application

### July 1, 2025
- Completed fully functional admin panel quick actions system with working navigation
- Created comprehensive notifications center with email template management and notification sending
- Added backend API endpoints for user management (PATCH /api/admin/users/:id) and settings updates
- Implemented working legal terms and privacy policy management with real-time updates to site settings
- Fixed all TypeScript compilation issues and ensured clean application startup
- Added notification history tracking with mock data for admin insights
- Created complete admin settings API (GET/POST /api/admin/settings) for site configuration
- Enhanced quick actions to include: Manage Mods, Manage Users, Notifications Center, and Settings
- All admin dashboard components now properly connect to real database endpoints
- Legal document management system fully operational with form persistence and validation

### June 28, 2025
- Created advanced cart page with sophisticated upselling and product recommendations
- Implemented smart deals that appear contextually based on cart contents and spending thresholds  
- Added refreshing sales banners with time-limited deals that create urgency but continue indefinitely
- Built animated checkout progress stepper with gamification elements including points system
- Integrated Stripe payment form with proper PaymentElement for secure card processing
- Added floating deal notifications that appear throughout the browsing and cart experience
- Created sticky bottom banners with rotating offers and animated countdown timers
- Enhanced checkout with real Stripe integration using PaymentIntent API
- Fixed cart variable declaration error that was causing runtime crashes
- Added sophisticated CSS animations for sales banners, notifications, and deal cards
- Implemented proper Stripe Elements styling with theme matching the site design
- Created bundle suggestions, spending incentives, and premium membership upsells
- Added achievement unlocks and progress tracking during checkout process
- Built notification system with multiple deal types (flash sales, bundles, limited time offers)
- Enhanced user experience with contextual upselling that doesn't feel intrusive
- Optimized notification frequency to reduce spam - urgent popups only show on weekends
- Repositioned floating notifications to top-right to avoid interference with navigation
- Reduced notification frequency across all pages for better user experience
- Made bottom banner persistent while making other notifications more subtle and less frequent

### June 26, 2025
- Completed comprehensive redesign of admin panel and profile dashboards with modern aesthetic
- Admin dashboard features glass morphism cards, gradient backgrounds, and animated statistics
- Profile dashboard includes tabbed interface with overview, purchases, subscription, and settings
- Implemented Framer Motion animations throughout both dashboards for smooth interactions
- Added modern stat cards with hover effects and gradient icons
- Created responsive layouts optimized for desktop and mobile viewing
- Integrated real-time data fetching and interactive quick actions
- Enhanced user experience with intuitive navigation and visual feedback
- Updated color scheme to use consistent purple-to-pink gradient throughout admin and profile dashboards
- Removed multiple color variations in favor of cohesive brand-consistent design matching home page
- Applied purple, green, black, and white color scheme to admin panel inspired by featured products design
- Used alternating purple and green gradients for stat cards and action buttons with black backgrounds
- Successfully implemented Discord OAuth authentication with automatic admin privileges for specific usernames
- Removed old feature showcase section and enhanced home page with crazy interactive animations
- Added smooth scroll transitions, floating elements, gradient text animations, and advanced CSS animations
- Created consistent purple/green/black/white color scheme across all home page sections
- Enhanced all buttons with shimmer effects, hover animations, and glass morphism styling
- Implemented animated background gradients and pulsing color orbs throughout page sections
- Created advanced scroll animation system with progress bars, floating CTAs, and magnetic elements
- Added spiral, bounce, and parallax scroll effects with intersection observer triggers
- Consolidated testimonials to match categories color scheme (green/purple theme)
- Implemented dramatic scroll-triggered animations with 3D transforms and staggered reveals

### June 25, 2025
- Successfully restored PostgreSQL database from complete backup file (complete_database_backup_20250625_123400.sql)
- Restored 16 users including 5 admin accounts with proper authentication
- Restored 4 mods, 3 purchases, 36 reviews, 31 forum threads, and 144 forum replies
- Restored all site settings, subscription plans, and admin activity logs
- Database sequences properly updated to match backup state
- Application running with full historical data intact
- Implemented dynamic island-inspired header with transparent design and smooth scroll animations
- Header transforms from full-width transparent bar to compact rounded pill when scrolling
- Added adaptive content switching and spring-based animations with backdrop blur effects

### June 23, 2025
- Fixed ModCard component runtime error with isInCart function
- Resolved cart context initialization and timing issues
- Implemented defensive programming for cart state handling
- Ensured proper error handling for unauthenticated users
- Application now running without runtime errors

### June 17, 2025
- Completed mod update notification system using SendGrid email service
- Added automatic email notifications when admins upload new mod versions
- Created admin notification management interface at /admin/notifications
- Implemented manual notification sending with mod selection and version tracking
- Added notification link to admin dashboard quick actions for easy access
- Email notifications include mod title, version, changelog, and download links
- Added changelog and file size input fields to admin mod create/edit forms
- Updated backend to properly handle version creation with changelog and file size metadata
- Fixed mod version system to automatically update mod lockers when admins edit mods

### June 14, 2025
- Fixed duplicate content in admin dashboard - removed redundant stat cards, kept only bottom layout with colorful icons
- Improved database-driven subscription system with PostgreSQL persistence
- Updated session management to use PostgreSQL for 30-day persistence
- Working on cart functionality implementation - fixing add to cart and cart operations

## Changelog

- June 14, 2025. Initial setup and cart functionality improvements

## User Preferences

Preferred communication style: Simple, everyday language.