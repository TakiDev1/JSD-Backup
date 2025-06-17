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