import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as DiscordStrategy } from 'passport-discord';
import session from 'express-session';
import { Express } from 'express';
import crypto from 'crypto';
import { promisify } from 'util';
import { storage } from './storage';
import connectPg from 'connect-pg-simple';
import { pool } from './db';
import { User } from '@shared/schema';

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      isAdmin?: boolean;
      is_admin?: boolean;
    }
  }
}

// Password hashing with scrypt
const scryptAsync = promisify(crypto.scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${derivedKey.toString('hex')}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  try {
    const [hashedPassword, salt] = stored.split('.');
    if (!hashedPassword || !salt) {
      return false;
    }
    const derivedKey = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return crypto.timingSafeEqual(
      Buffer.from(hashedPassword, 'hex'),
      derivedKey
    );
  } catch (error) {
    console.error("Password comparison error:", error);
    return false;
  }
}

// Discord OAuth scopes
const DISCORD_SCOPES = ['identify', 'email'];

// PostgreSQL session store
const PostgresStore = connectPg(session);

export function setupAuth(app: Express) {
  // Setup session with enhanced security and debugging
  const sessionSecret = process.env.SESSION_SECRET || crypto.randomBytes(20).toString('hex');
  console.log("Setting up session middleware with secret hash:", crypto.createHash('sha256').update(sessionSecret).digest('hex').substring(0, 8));
  
  app.use(
    session({
      cookie: { 
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days for longer sessions
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,   // Prevent client-side JS from reading
        sameSite: 'lax'   // Improve CSRF protection
      },
      store: new PostgresStore({
        pool: pool,
        createTableIfMissing: true,
        tableName: 'session'
      }),
      secret: sessionSecret,
      resave: true,      // Save session on each request
      rolling: true,     // Reset expiration countdown on every response
      saveUninitialized: true, // Create session for all users
      name: 'jsd_session' // Custom name for better security
    })
  );

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Authentication debugging middleware
  app.use((req, res, next) => {
    console.log("Auth check - Session ID:", req.sessionID);
    console.log("Auth check - isAuthenticated():", req.isAuthenticated());
    console.log("Auth check - Session data:", req.session);
    
    if (req.isAuthenticated()) {
      console.log("Auth check - User authenticated:", { 
        id: req.user?.id, 
        username: req.user?.username 
      });
    } else {
      console.log("Auth check - User not authenticated");
    }
    
    next();
  });

  // Serialize/deserialize user
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      // Convert null to undefined for TypeScript compatibility
      if (user) {
        const convertedUser = {
          ...user,
          isAdmin: user.isAdmin ?? undefined,
          isPremium: user.isPremium ?? undefined,
          email: user.email ?? undefined,
          discordId: user.discordId ?? undefined,
          discordUsername: user.discordUsername ?? undefined,
          discordAvatar: user.discordAvatar ?? undefined,
          stripeCustomerId: user.stripeCustomerId ?? undefined,
          stripeSubscriptionId: user.stripeSubscriptionId ?? undefined,
          premiumExpiresAt: user.premiumExpiresAt ?? undefined,
          lastLogin: user.lastLogin ?? undefined,
          isBanned: user.isBanned ?? undefined
        };
        done(null, convertedUser);
      } else {
        done(null, false);
      }
    } catch (err) {
      done(err, false);
    }
  });

  // Setup local authentication strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }
        
        // Skip password check for users without a password (Discord users)
        if (!user.password) {
          return done(null, false, { message: 'Password login not available for this account.' });
        }
        
        // Verify password
        const isValid = await comparePasswords(password, user.password);
        
        if (!isValid) {
          return done(null, false, { message: 'Incorrect password.' });
        }
        
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  // Setup Discord strategy if credentials are available
  if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
    console.log("Initializing Discord authentication strategy");
    passport.use(
      new DiscordStrategy(
        {
          clientID: process.env.DISCORD_CLIENT_ID,
          clientSecret: process.env.DISCORD_CLIENT_SECRET,
          callbackURL: process.env.DISCORD_CALLBACK_URL || 
                       (process.env.REPLIT_DOMAINS ? 
                        `https://${process.env.REPLIT_DOMAINS.split(',')[0]}/api/auth/discord/callback` : 
                        'http://localhost:5000/api/auth/discord/callback'),
          passReqToCallback: true,
          scope: DISCORD_SCOPES
        },
        async (req, accessToken, refreshToken, profile, done) => {
          try {
            console.log("Discord auth - profile:", { 
              id: profile.id,
              username: profile.username,
              email: profile.email
            });
            
            // Check if user exists
            let user = await storage.getUserByDiscordId(profile.id);
            
            if (user) {
              // Check if this Discord account should be an admin
              const shouldBeAdmin = ['jsd', 'von', 'developer'].includes(profile.username.toLowerCase());
              
              // Update existing user and grant admin access if needed
              user = await storage.updateUser(user.id, {
                discordUsername: profile.username,
                discordAvatar: profile.avatar,
                email: profile.email,
                isAdmin: shouldBeAdmin ? true : user.isAdmin, // Don't remove existing admin privileges
                lastLogin: new Date()
              });
            } else {
              // Check if this is an admin Discord account
              const isAdmin = ['jsd', 'von', 'developer'].includes(profile.username.toLowerCase());
              
              // Create new user with admin status if appropriate
              user = await storage.createUser({
                username: profile.username,
                discordId: profile.id,
                discordUsername: profile.username,
                discordAvatar: profile.avatar,
                email: profile.email,
                isAdmin: isAdmin, // Grant admin access to specific Discord users
                lastLogin: new Date()
              });
            }
            
            return done(null, user);
          } catch (err) {
            return done(err);
          }
        }
      )
    );
  }

  // Authentication middleware
  return {
    isAuthenticated: (req: any, res: any, next: any) => {
      console.log("Authentication check - Path:", req.path, "Method:", req.method);
      console.log("Authentication check - User:", req.user ? { id: req.user.id, username: req.user.username } : "Not authenticated");
      console.log("Authentication check - isAuthenticated():", req.isAuthenticated());
      
      if (req.isAuthenticated()) {
        console.log("Authentication check - PASSED");
        return next();
      }
      
      console.log("Authentication check - FAILED");
      res.status(401).json({ message: 'Unauthorized' });
    },
    
    isAdmin: (req: any, res: any, next: any) => {
      // Debug logging
      console.log("Auth check - user:", req.user ? { 
        id: req.user.id, 
        username: req.user.username, 
        isAdmin: req.user.isAdmin, 
        is_admin: req.user.is_admin 
      } : 'No user');
      
      if (req.isAuthenticated() && (req.user.isAdmin || req.user.is_admin)) {
        return next();
      }
      res.status(403).json({ message: 'Forbidden' });
    }
  };
}
