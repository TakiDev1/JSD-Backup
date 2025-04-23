import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as DiscordStrategy } from 'passport-discord';
import session from 'express-session';
import MemoryStore from 'memorystore';
import { Express } from 'express';
import crypto from 'crypto';
import { promisify } from 'util';
import { storage } from './storage';

// Password hashing with scrypt
const scryptAsync = promisify(crypto.scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${derivedKey.toString('hex')}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashedPassword, salt] = stored.split('.');
  const derivedKey = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return crypto.timingSafeEqual(
    Buffer.from(hashedPassword, 'hex'),
    derivedKey
  );
}

// Discord OAuth scopes
const DISCORD_SCOPES = ['identify', 'email'];

// Memory store for sessions
const SessionStore = MemoryStore(session);

export function setupAuth(app: Express) {
  // Setup session
  app.use(
    session({
      cookie: { maxAge: 86400000 }, // 24 hours
      store: new SessionStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      }),
      secret: process.env.SESSION_SECRET || crypto.randomBytes(20).toString('hex'),
      resave: false,
      saveUninitialized: false
    })
  );

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Serialize/deserialize user
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user || false);
    } catch (err) {
      done(err, false);
    }
  });

  // Setup Discord strategy
  passport.use(
    new DiscordStrategy(
      {
        clientID: process.env.DISCORD_CLIENT_ID || '',
        clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
        callbackURL: process.env.DISCORD_CALLBACK_URL || 
                     (process.env.REPLIT_DOMAINS ? 
                      `https://${process.env.REPLIT_DOMAINS.split(',')[0]}/api/auth/discord/callback` : 
                      'http://localhost:5000/api/auth/discord/callback'),
        scope: DISCORD_SCOPES
      },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Check if user exists
            let user = await storage.getUserByDiscordId(profile.id);
            
            if (user) {
              // Update existing user
              user = await storage.updateUser(user.id, {
                discordUsername: profile.username,
                discordAvatar: profile.avatar,
                email: profile.email,
                lastLogin: new Date()
              });
            } else {
              // Create new user
              user = await storage.createUser({
                username: profile.username,
                discordId: profile.id,
                discordUsername: profile.username,
                discordAvatar: profile.avatar,
                email: profile.email,
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
      if (req.isAuthenticated()) {
        return next();
      }
      res.status(401).json({ message: 'Unauthorized' });
    },
    
    isAdmin: (req: any, res: any, next: any) => {
      if (req.isAuthenticated() && req.user.isAdmin) {
        return next();
      }
      res.status(403).json({ message: 'Forbidden' });
    }
  };
}
