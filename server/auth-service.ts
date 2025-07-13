import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { storage } from './storage';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface AuthUser {
  id: number;
  username: string;
  email?: string;
  isAdmin: boolean;
  isPremium: boolean;
  isBanned?: boolean;
  discordId?: string;
  discordUsername?: string;
  discordAvatar?: string;
}

export interface JWTPayload {
  userId: number;
  username: string;
  isAdmin: boolean;
  isPremium: boolean;
  iat?: number;
  exp?: number;
}

export class AuthService {
  // Hash password with bcrypt
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // Compare password with hash
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  // Generate JWT token
  private static generateToken(user: AuthUser): string {
    const payload = {
      userId: user.id,
      username: user.username,
      isAdmin: user.isAdmin || false,
      iat: Math.floor(Date.now() / 1000)
    };
    
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: '24h'
    });
  }

  // Verify JWT token
  static verifyToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: 'jsd-mods',
        audience: 'jsd-mods-users'
      }) as JWTPayload;
      
      return decoded;
    } catch (error) {
      console.error('JWT verification failed:', error);
      return null;
    }
  }

  // Extract token from request headers
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
    
    return parts[1];
  }

  // Get user from token
  static async getUserFromToken(token: string): Promise<AuthUser | null> {
    const payload = this.verifyToken(token);
    if (!payload) return null;

    try {
      const user = await storage.getUser(payload.userId);
      if (!user) return null;

      // Check if user is banned
      if (user.isBanned) return null;

      return {
        id: user.id,
        username: user.username,
        email: user.email || undefined,
        isAdmin: user.isAdmin || false,
        isPremium: user.isPremium || false,
        isBanned: user.isBanned || false,
        discordId: user.discordId || undefined,
        discordUsername: user.discordUsername || undefined,
        discordAvatar: user.discordAvatar || undefined
      };
    } catch (error) {
      console.error('Error fetching user from token:', error);
      return null;
    }
  }

  // Authenticate user with username/password
  static async authenticate(username: string, password: string): Promise<{ user: AuthUser; token: string } | null> {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user) return null;

      // Check if user is banned
      if (user.isBanned) return null;

      // Verify password
      if (!user.password) return null;
      
      const isValidPassword = await this.comparePassword(password, user.password);
      if (!isValidPassword) return null;

      // Update last login
      await storage.updateUser(user.id, { lastLogin: new Date() });

      const authUser: AuthUser = {
        id: user.id,
        username: user.username,
        email: user.email || undefined,
        isAdmin: user.isAdmin || false,
        isPremium: user.isPremium || false,
        isBanned: user.isBanned || false,
        discordId: user.discordId || undefined,
        discordUsername: user.discordUsername || undefined,
        discordAvatar: user.discordAvatar || undefined
      };

      const token = this.generateToken(authUser);

      return { user: authUser, token };
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }

  // Register new user
  static async register(username: string, email: string, password: string): Promise<{ user: AuthUser; token: string } | null> {
    try {
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) return null;

      // Hash password
      const hashedPassword = await this.hashPassword(password);

      // Create user
      const newUser = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        isAdmin: false,
        isPremium: false,
        lastLogin: new Date()
      });

      const authUser: AuthUser = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email || undefined,
        isAdmin: newUser.isAdmin || false,
        isPremium: newUser.isPremium || false,
        isBanned: newUser.isBanned || false
      };

      const token = this.generateToken(authUser);

      return { user: authUser, token };
    } catch (error) {
      console.error('Registration error:', error);
      return null;
    }
  }

  // Discord authentication
  static async authenticateDiscord(profile: any): Promise<{ user: AuthUser; token: string } | null> {
    try {
      let user = await storage.getUserByDiscordId(profile.id);

      if (user) {
        // Update existing user
        const shouldBeAdmin = ['jsd', 'von', 'developer', 'camoz'].includes(profile.username.toLowerCase());
        
        user = await storage.updateUser(user.id, {
          discordUsername: profile.username,
          discordAvatar: profile.avatar,
          email: profile.email,
          isAdmin: shouldBeAdmin ? true : user.isAdmin,
          lastLogin: new Date()
        });
      } else {
        // Create new user
        const isAdmin = ['jsd', 'von', 'developer', 'camoz'].includes(profile.username.toLowerCase());
        
        user = await storage.createUser({
          username: profile.username,
          discordId: profile.id,
          discordUsername: profile.username,
          discordAvatar: profile.avatar,
          email: profile.email,
          isAdmin: isAdmin,
          lastLogin: new Date()
        });
      }

      if (!user || user.isBanned) return null;

      const authUser: AuthUser = {
        id: user.id,
        username: user.username,
        email: user.email || undefined,
        isAdmin: user.isAdmin || false,
        isPremium: user.isPremium || false,
        isBanned: user.isBanned || false,
        discordId: user.discordId || undefined,
        discordUsername: user.discordUsername || undefined,
        discordAvatar: user.discordAvatar || undefined
      };

      const token = this.generateToken(authUser);

      return { user: authUser, token };
    } catch (error) {
      console.error('Discord authentication error:', error);
      return null;
    }
  }

  // Authenticate admin user with username/password
  static async authenticateAdmin(username: string, password: string): Promise<{ user: AuthUser; token: string } | null> {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user) return null;

      // Check if user is banned
      if (user.isBanned) return null;

      // Check if user is admin
      if (!user.isAdmin) return null;

      // Verify password
      if (!user.password) return null;
      
      const isValidPassword = await this.comparePassword(password, user.password);
      if (!isValidPassword) return null;

      // Update last login
      await storage.updateUser(user.id, { lastLogin: new Date() });

      const authUser: AuthUser = {
        id: user.id,
        username: user.username,
        email: user.email || undefined,
        isAdmin: user.isAdmin || false,
        isPremium: user.isPremium || false,
        isBanned: user.isBanned || false,
        discordId: user.discordId || undefined,
        discordUsername: user.discordUsername || undefined,
        discordAvatar: user.discordAvatar || undefined
      };

      const token = this.generateToken(authUser);

      return { user: authUser, token };
    } catch (error) {
      console.error('Admin authentication error:', error);
      return null;
    }
  }

  // Middleware for protecting routes
  static async authMiddleware(req: any, res: any, next: any) {
    try {
      const token = AuthService.extractTokenFromHeader(req.headers.authorization);
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const user = await AuthService.getUserFromToken(token);
      if (!user) {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(500).json({ message: 'Authentication error' });
    }
  }

  // Admin middleware
  static async adminMiddleware(req: any, res: any, next: any) {
    try {
      const token = AuthService.extractTokenFromHeader(req.headers.authorization);
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const user = await AuthService.getUserFromToken(token);
      if (!user) {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }

      if (!user.isAdmin) {
        return res.status(403).json({ message: 'Admin access required' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Admin middleware error:', error);
      res.status(500).json({ message: 'Authentication error' });
    }
  }

  // Refresh token
  static async refreshToken(oldToken: string): Promise<{ user: AuthUser; token: string } | null> {
    try {
      const user = await this.getUserFromToken(oldToken);
      if (!user) return null;

      const newToken = this.generateToken(user);
      return { user, token: newToken };
    } catch (error) {
      console.error('Token refresh error:', error);
      return null;
    }
  }
}

// Rate limiting for auth endpoints
export class RateLimiter {
  private static attempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  private static readonly MAX_ATTEMPTS = 5;
  private static readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutes

  static isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return false;
    }

    // Reset if window has passed
    if (now - record.lastAttempt > this.WINDOW_MS) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return false;
    }

    // Increment attempts
    record.count++;
    record.lastAttempt = now;

    return record.count > this.MAX_ATTEMPTS;
  }

  static resetAttempts(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

export { JWT_SECRET, JWT_EXPIRES_IN };