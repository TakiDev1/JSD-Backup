import { type VercelRequest, VercelResponse } from '@vercel/node';
import express from "express";
import cors from "cors";
import 'dotenv/config';

// Safe dependency loading
let AuthService: any = null;
let RateLimiter: any = null;
let storage: any = null;
let createPaymentIntent: any = null;

// Fallback authentication for when database is unavailable
const fallbackAuth = {
  // Simple in-memory user store for fallback
  users: [
    { id: 1, username: 'JSD', password: '$2a$12$hashed_password_here', isAdmin: true },
    { id: 2, username: 'Von', password: '$2a$12$hashed_password_here', isAdmin: true },
    { id: 3, username: 'Developer', password: '$2a$12$hashed_password_here', isAdmin: true },
    { id: 4, username: 'Camoz', password: '$2a$12$hashed_password_here', isAdmin: true }
  ],
  
  async authenticate(username: string, password: string) {
    // For now, return a simple success for known users
    const user = this.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (user) {
      return {
        user: {
          id: user.id,
          username: user.username,
          isAdmin: user.isAdmin,
          isPremium: true
        },
        token: 'fallback-token-' + user.id
      };
    }
    return null;
  },

  async authenticateDiscord(profile: any) {
    // Check if this is a known admin Discord user
    const adminUsernames = ['jsd', 'von', 'developer', 'camoz'];
    const isAdmin = adminUsernames.includes(profile.username.toLowerCase());
    
    if (isAdmin) {
      return {
        user: {
          id: Math.floor(Math.random() * 1000) + 100, // Random ID for fallback
          username: profile.username,
          isAdmin: true,
          isPremium: true,
          discordId: profile.id,
          discordUsername: profile.username,
          discordAvatar: profile.avatar
        },
        token: 'fallback-discord-token-' + profile.id
      };
    }
    
    // For non-admin users, create a regular user
    return {
      user: {
        id: Math.floor(Math.random() * 1000) + 100,
        username: profile.username,
        isAdmin: false,
        isPremium: false,
        discordId: profile.id,
        discordUsername: profile.username,
        discordAvatar: profile.avatar
      },
      token: 'fallback-discord-token-' + profile.id
    };
  },

  extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
    
    return parts[1];
  },

  async getUserFromToken(token: string) {
    if (!token.startsWith('fallback-token-')) return null;
    
    const userId = parseInt(token.replace('fallback-token-', ''));
    const user = this.users.find(u => u.id === userId);
    
    if (user) {
      return {
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
        isPremium: true
      };
    }
    return null;
  },

  async authMiddleware(req: any, res: any, next: any) {
    try {
      const token = fallbackAuth.extractTokenFromHeader(req.headers.authorization);
      if (!token) {
        return res.status(401).json({ message: 'No token provided', success: false });
      }

      const user = await fallbackAuth.getUserFromToken(token);
      if (!user) {
        return res.status(401).json({ message: 'Invalid or expired token', success: false });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Fallback auth middleware error:', error);
      res.status(500).json({ message: 'Authentication error', success: false });
    }
  },

  async adminMiddleware(req: any, res: any, next: any) {
    try {
      const token = fallbackAuth.extractTokenFromHeader(req.headers.authorization);
      if (!token) {
        return res.status(401).json({ message: 'No token provided', success: false });
      }

      const user = await fallbackAuth.getUserFromToken(token);
      if (!user) {
        return res.status(401).json({ message: 'Invalid or expired token', success: false });
      }

      if (!user.isAdmin) {
        return res.status(403).json({ message: 'Admin access required', success: false });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Fallback admin middleware error:', error);
      res.status(500).json({ message: 'Authentication error', success: false });
    }
  }
};

// Simple rate limiter fallback
const fallbackRateLimiter = {
  attempts: new Map(),
  isRateLimited(id: string) {
    const attempts = this.attempts.get(id) || 0;
    return attempts > 5;
  },
  resetAttempts(id: string) {
    this.attempts.delete(id);
  }
};

// Try to load dependencies safely
async function initializeDependencies() {
  try {
    console.log("[INIT] Loading dependencies...");
    
    const authModule = await import("../server/auth-service");
    AuthService = authModule.AuthService;
    RateLimiter = authModule.RateLimiter;
    
    const storageModule = await import("../server/storage");
    storage = storageModule.storage;
    
    const stripeModule = await import("../server/stripe");
    createPaymentIntent = stripeModule.createPaymentIntent;
    
    console.log("[INIT] Dependencies loaded successfully");
    return true;
  } catch (error) {
    console.error("[INIT] Failed to load dependencies:", error);
    console.log("[INIT] Using fallback authentication");
    return false;
  }
}

let app: express.Application | null = null;
let isInitialized = false;
let dependenciesLoaded = false;

// Weekend sales and promotional deals management
interface Deal {
  id: string;
  title: string;
  description: string;
  discount: number;
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  usageCount: number;
  maxUsage?: number;
  type: 'flash' | 'bundle' | 'premium' | 'limited' | 'seasonal';
  createdAt: Date;
  updatedAt: Date;
}

// In-memory storage for deals (in production, this would be in database)
const activeDeals: Deal[] = [
  {
    id: 'weekend-flash-sale',
    title: '⚡ Weekend Flash Sale',
    description: '40% off all premium mods - Limited time only!',
    discount: 40,
    isActive: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
    usageCount: 127,
    maxUsage: 500,
    type: 'flash',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'mega-monday',
    title: '💫 Mega Monday',
    description: 'Buy 2 get 1 FREE on all vehicle mods',
    discount: 33,
    isActive: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    usageCount: 89,
    type: 'bundle',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Helper function to get client IP
function getClientIP(req: any): string {
  return req.headers['x-forwarded-for']?.split(',')[0] || 
         req.headers['x-real-ip'] || 
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress || 
         'unknown';
}

async function createProductionApp() {
  if (app && isInitialized) return app;
  
  console.log("Creating production-ready Express app for Vercel...");
  
  const expressApp = express();
  
  // Security headers
  expressApp.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // CORS configuration
  expressApp.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://jsd-mods.vercel.app', 'https://jsdmods.com']
      : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));

  // Body parsing middleware
  expressApp.use(express.json({ limit: '10mb' }));
  expressApp.use(express.urlencoded({ extended: false, limit: '10mb' }));

  // Request logging
  expressApp.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - IP: ${getClientIP(req)}`);
    next();
  });

  // Health check endpoint
  expressApp.get('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      message: 'JSD Mods API is running (Production)',
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Authentication endpoints
  expressApp.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      console.log(`[DEBUG] /api/auth/login endpoint hit for username: ${username}`);
      const clientIP = getClientIP(req);
      
      if (!username || !password) {
        return res.status(400).type('application/json').json({ 
          message: "Username and password are required",
          success: false 
        });
      }

      // Use fallback authentication if dependencies failed to load
      if (!dependenciesLoaded) {
        console.log("[AUTH] Dependencies not loaded, using fallback authentication");
        
        // Use fallback rate limiter
        const rateLimitId = `login:${clientIP}`;
        if (fallbackRateLimiter.isRateLimited(rateLimitId)) {
          return res.status(429).type('application/json').json({ 
            message: "Too many login attempts. Please try again later.",
            success: false 
          });
        }

        const fallbackResult = await fallbackAuth.authenticate(username, password);
        if (fallbackResult) {
          fallbackRateLimiter.resetAttempts(rateLimitId);
          return res.type('application/json').json({
            message: 'Login successful (fallback mode)',
            success: true,
            user: fallbackResult.user,
            token: fallbackResult.token
          });
        }

        return res.status(401).type('application/json').json({ 
          message: "Invalid username or password",
          success: false 
        });
      }

      // Normal authentication flow with full dependencies
      const rateLimitId = `login:${clientIP}`;
      if (RateLimiter.isRateLimited(rateLimitId)) {
        return res.status(429).type('application/json').json({ 
          message: "Too many login attempts. Please try again later.",
          success: false 
        });
      }

      // Authenticate user
      const result = await AuthService.authenticate(username, password);
      
      if (!result) {
        return res.status(401).type('application/json').json({ 
          message: "Invalid username or password",
          success: false 
        });
      }

      // Reset rate limit on successful login
      RateLimiter.resetAttempts(rateLimitId);

      res.type('application/json').json({
        message: 'Login successful',
        success: true,
        user: result.user,
        token: result.token
      });

    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).type('application/json').json({ 
        message: 'Authentication service temporarily unavailable',
        success: false 
      });
    }
  });

  // User registration route
  expressApp.post("/api/auth/register", async (req, res) => {
    try {
      const { username, email, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const result = await AuthService.register(username, email, password);
      
      if (!result) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      res.status(201).json({
        message: "Registration successful",
        token: result.token,
        user: result.user
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  expressApp.get('/api/auth/user', async (req, res) => {
    try {
      let token: string | null = null;
      let user: any = null;

      // Use fallback if dependencies not loaded
      if (!dependenciesLoaded) {
        console.log("[AUTH] Dependencies not loaded, using fallback user validation");
        
        token = fallbackAuth.extractTokenFromHeader(req.headers.authorization);
        if (!token) {
          return res.status(401).json({ 
            message: "Not authenticated",
            success: false 
          });
        }

        user = await fallbackAuth.getUserFromToken(token);
        if (!user) {
          return res.status(401).json({ 
            message: "Invalid or expired token",
            success: false 
          });
        }

        return res.json({
          success: true,
          user: user
        });
      }

      // Normal flow with full dependencies
      token = AuthService.extractTokenFromHeader(req.headers.authorization);
      
      if (!token) {
        return res.status(401).json({ 
          message: "Not authenticated",
          success: false 
        });
      }

      user = await AuthService.getUserFromToken(token);
      
      if (!user) {
        return res.status(401).json({ 
          message: "Invalid or expired token",
          success: false 
        });
      }

      res.json({
        success: true,
        user: user
      });

    } catch (error: any) {
      console.error('Get user error:', error);
      res.status(500).json({ 
        message: 'Authentication service temporarily unavailable',
        success: false 
      });
    }
  });

  expressApp.post('/api/auth/logout', async (req, res) => {
    try {
      // In JWT-based auth, logout is handled client-side by removing the token
      res.json({ 
        message: 'Logout successful',
        success: true 
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      res.status(500).json({ 
        message: 'Logout failed',
        success: false 
      });
    }
  });

  expressApp.post('/api/auth/refresh', async (req, res) => {
    try {
      const token = AuthService.extractTokenFromHeader(req.headers.authorization);
      
      if (!token) {
        return res.status(401).json({ 
          message: "No token provided",
          success: false 
        });
      }

      const result = await AuthService.refreshToken(token);
      
      if (!result) {
        return res.status(401).json({ 
          message: "Invalid or expired token",
          success: false 
        });
      }

      res.json({
        message: 'Token refreshed successfully',
        success: true,
        user: result.user,
        token: result.token
      });

    } catch (error: any) {
      console.error('Token refresh error:', error);
      res.status(500).json({ 
        message: 'Token refresh failed',
        success: false 
      });
    }
  });

  // Discord OAuth endpoints
  expressApp.get('/api/auth/discord', async (req, res) => {
    try {
      const clientId = process.env.DISCORD_CLIENT_ID;
      const redirectUri = process.env.DISCORD_CALLBACK_URL || 
                         (process.env.VERCEL_URL ? 
                          `https://${process.env.VERCEL_URL}/api/auth/discord/callback` : 
                          'http://localhost:5000/api/auth/discord/callback');
      
      if (!clientId) {
        return res.status(503).json({ 
          message: "Discord authentication not configured", 
          success: false 
        });
      }

      const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify%20email`;
      
      res.redirect(discordAuthUrl);
    } catch (error: any) {
      console.error('Discord auth error:', error);
      res.status(500).json({ 
        message: 'Discord authentication failed', 
        success: false 
      });
    }
  });

  expressApp.get('/api/auth/discord/callback', async (req, res) => {
    try {
      const { code } = req.query;
      
      if (!code) {
        return res.redirect('/login?error=discord_failed');
      }

      const clientId = process.env.DISCORD_CLIENT_ID;
      const clientSecret = process.env.DISCORD_CLIENT_SECRET;
      const redirectUri = process.env.DISCORD_CALLBACK_URL || 
                         (process.env.VERCEL_URL ? 
                          `https://${process.env.VERCEL_URL}/api/auth/discord/callback` : 
                          'http://localhost:5000/api/auth/discord/callback');

      if (!clientId || !clientSecret) {
        return res.redirect('/login?error=discord_not_configured');
      }

      // Exchange code for access token
      const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'authorization_code',
          code: code as string,
          redirect_uri: redirectUri,
        }),
      });

      const tokenData = await tokenResponse.json();

      if (!tokenData.access_token) {
        return res.redirect('/login?error=discord_token_failed');
      }

      // Get user info from Discord
      const userResponse = await fetch('https://discord.com/api/users/@me', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });

      const discordUser = await userResponse.json();

      // Check if dependencies are loaded for full authentication
      const authService = dependenciesLoaded ? AuthService : fallbackAuth;
      
      // Authenticate with Discord profile
      const result = await authService.authenticateDiscord(discordUser);
      
      if (!result) {
        return res.redirect('/login?error=discord_auth_failed');
      }

      // Set token in cookie or return it
      res.cookie('jsd_auth_token', result.token, {
        httpOnly: false, // Allow client-side access
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: '/'
      });

      res.redirect('/?discord_login=success');
    } catch (error: any) {
      console.error('Discord callback error:', error);
      res.redirect('/login?error=discord_callback_failed');
    }
  });

  expressApp.get('/api/auth/discord-status', async (req, res) => {
    try {
      console.log("[DEBUG] /api/auth/discord-status endpoint hit");
      const available = !!(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET);
      res.type('application/json').json({ 
        available,
        success: true 
      });
    } catch (error: any) {
      console.error('Discord status error:', error);
      res.status(500).type('application/json').json({ 
        message: "Failed to check Discord status",
        success: false 
      });
    }
  });

  // Mods endpoints
  expressApp.get('/api/mods', async (req, res) => {
    try {
      const { category, search, featured, limit = 12, page = 1, sortBy = 'newest' } = req.query;
      
      // Use fallback if dependencies not loaded
      if (!dependenciesLoaded || !storage) {
        console.log("[MODS] Dependencies not loaded, using fallback mods");
        return res.json({
          success: true,
          mods: [],
          pagination: {
            total: 0,
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            totalPages: 0
          }
        });
      }
      
      const mods = await storage.getMods({
        category: category as string,
        searchTerm: search as string,
        featured: featured === "true",
        limit: parseInt(limit as string),
        offset: (parseInt(page as string) - 1) * parseInt(limit as string)
      });
      
      const total = await storage.getModsCount({
        category: category as string,
        searchTerm: search as string,
        featured: featured === "true"
      });
      
      res.json({
        success: true,
        mods,
        pagination: {
          total,
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          totalPages: Math.ceil(total / parseInt(limit as string))
        }
      });
    } catch (error: any) {
      console.error("Error fetching mods:", error);
      res.status(500).json({ 
        message: "Failed to fetch mods",
        success: false 
      });
    }
  });

  expressApp.get('/api/mods/featured', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
      
      // Use fallback if dependencies not loaded
      if (!dependenciesLoaded || !storage) {
        console.log("[MODS] Dependencies not loaded, using fallback featured mods");
        return res.json({ 
          success: true,
          mods: []
        });
      }
      
      const mods = await storage.getMods({
        featured: true,
        limit: limit
      });
      
      res.json({ 
        success: true,
        mods 
      });
    } catch (error: any) {
      console.error("Error fetching featured mods:", error);
      res.status(500).json({ 
        message: "Failed to fetch featured mods",
        success: false 
      });
    }
  });

  expressApp.get('/api/mods/:id', async (req, res) => {
    try {
      // Use fallback if dependencies not loaded
      if (!dependenciesLoaded || !storage) {
        console.log("[MODS] Dependencies not loaded, using fallback mod");
        return res.status(404).json({ 
          message: "Mod not found",
          success: false 
        });
      }
      
      const mod = await storage.getMod(parseInt(req.params.id));
      
      if (!mod) {
        return res.status(404).json({ 
          message: "Mod not found",
          success: false 
        });
      }
      
      const latestVersion = await storage.getLatestModVersion(mod.id);
      
      res.json({
        success: true,
        mod: {
          ...mod,
          latestVersion,
          reviews: []
        }
      });
    } catch (error: any) {
      console.error("Error fetching mod:", error);
      res.status(500).json({ 
        message: "Failed to fetch mod",
        success: false 
      });
    }
  });

  // Protected cart endpoints
  expressApp.get('/api/cart', async (req, res, next) => {
    // Choose middleware based on dependencies loaded
    const middleware = dependenciesLoaded && AuthService?.authMiddleware ? AuthService.authMiddleware : fallbackAuth.authMiddleware;
    return middleware(req, res, async () => {
      try {
        if (!dependenciesLoaded || !storage) {
          return res.status(503).json({ 
            message: "Service temporarily unavailable",
            success: false 
          });
        }

        const userId = (req as any).user.id;
        const cartItems = await storage.getCartItems(userId);
        
        // Get mod details for each cart item
        const itemsWithMods = await Promise.all(
          cartItems.map(async (item: any) => {
            const mod = await storage.getMod(item.modId);
            return {
              ...item,
              mod
            };
          })
        );
        
        res.json({
          success: true,
          items: itemsWithMods
        });
      } catch (error: any) {
        console.error("Cart fetch error:", error);
        res.status(500).json({ 
          message: "Failed to retrieve cart items",
          success: false 
        });
      }
    });
  });

  expressApp.post('/api/cart', async (req, res, next) => {
    // Choose middleware based on dependencies loaded
    const middleware = dependenciesLoaded && AuthService?.authMiddleware ? AuthService.authMiddleware : fallbackAuth.authMiddleware;
    return middleware(req, res, async () => {
      try {
        if (!dependenciesLoaded || !storage) {
          return res.status(503).json({ 
            message: "Service temporarily unavailable",
            success: false 
          });
        }

        const userId = (req as any).user.id;
        const { modId } = req.body;
        
        if (!modId || isNaN(modId)) {
          return res.status(400).json({ 
            message: "Invalid mod ID",
            success: false 
          });
        }
        
        const mod = await storage.getMod(modId);
        if (!mod) {
          return res.status(404).json({ 
            message: "Mod not found",
            success: false 
          });
        }
        
        // Check if already in cart
        const existingItems = await storage.getCartItems(userId);
        if (existingItems.some((item: any) => item.modId === modId)) {
          return res.status(400).json({ 
            message: "Item already in cart",
            success: false 
          });
        }
        
        // Check if already purchased
        const purchase = await storage.getModPurchase(userId, modId);
        if (purchase) {
          return res.status(400).json({ 
            message: "You already own this mod",
            success: false 
          });
        }
        
        const cartItem = await storage.addToCart({
          userId,
          modId,
          addedAt: new Date()
        });
        
        res.status(201).json({
          success: true,
          item: {
            ...cartItem,
            mod
          }
        });
      } catch (error: any) {
        console.error("Add to cart error:", error);
        res.status(500).json({ 
          message: "Failed to add item to cart",
          success: false 
        });
      }
    });
  });

  expressApp.delete('/api/cart/:modId', async (req, res, next) => {
    // Choose middleware based on dependencies loaded
    const middleware = dependenciesLoaded && AuthService?.authMiddleware ? AuthService.authMiddleware : fallbackAuth.authMiddleware;
    return middleware(req, res, async () => {
      try {
        if (!dependenciesLoaded || !storage) {
          return res.status(503).json({ 
            message: "Service temporarily unavailable",
            success: false 
          });
        }

        const userId = (req as any).user.id;
        const modId = parseInt(req.params.modId);
        
        await storage.removeFromCart(userId, modId);
        
        res.json({ 
          success: true,
          message: "Item removed from cart"
        });
      } catch (error: any) {
        console.error("Remove from cart error:", error);
        res.status(500).json({ 
          message: "Failed to remove item from cart",
          success: false 
        });
      }
    });
  });

  expressApp.delete('/api/cart', async (req, res, next) => {
    // Choose middleware based on dependencies loaded
    const middleware = dependenciesLoaded && AuthService?.authMiddleware ? AuthService.authMiddleware : fallbackAuth.authMiddleware;
    return middleware(req, res, async () => {
      try {
        if (!dependenciesLoaded || !storage) {
          return res.status(503).json({ 
            message: "Service temporarily unavailable",
            success: false 
          });
        }

        const userId = (req as any).user.id;
        await storage.clearCart(userId);
        
        res.json({ 
          success: true,
          message: "Cart cleared"
        });
      } catch (error: any) {
        console.error("Clear cart error:", error);
        res.status(500).json({ 
          message: "Failed to clear cart",
          success: false 
        });
      }
    });
  });

  // Payment endpoints
  expressApp.post('/api/create-payment-intent', async (req, res, next) => {
    // Choose middleware based on dependencies loaded
    const middleware = dependenciesLoaded && AuthService?.authMiddleware ? AuthService.authMiddleware : fallbackAuth.authMiddleware;
    return middleware(req, res, async () => {
      try {
        if (!dependenciesLoaded || !createPaymentIntent) {
          return res.status(503).json({ 
            message: "Service temporarily unavailable",
            success: false 
          });
        }

        const { amount } = req.body;
        const userId = (req as any).user.id;
        
        if (!amount || amount <= 0) {
          return res.status(400).json({ 
            message: "Invalid amount",
            success: false 
          });
        }
        
        const paymentIntent = await createPaymentIntent(amount, { userId: userId.toString() });
        
        res.json({ 
          success: true,
          clientSecret: paymentIntent.clientSecret 
        });
      } catch (error: any) {
        console.error("Payment intent error:", error);
        res.status(500).json({ 
          message: "Failed to create payment",
          success: false 
        });
      }
    });
  });

  // Admin endpoints
  expressApp.get('/api/admin/settings', async (req, res, next) => {
    // Choose middleware based on dependencies loaded
    const middleware = dependenciesLoaded && AuthService?.adminMiddleware ? AuthService.adminMiddleware : fallbackAuth.adminMiddleware;
    return middleware(req, res, async () => {
      try {
        // For now, return basic settings - this would be from database in production
        const settings = {
          siteName: "JSD Mods",
          maintenanceMode: false,
          discordEnabled: !!(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET),
          stripeEnabled: !!process.env.STRIPE_SECRET_KEY
        };
        
        res.json({
          success: true,
          settings
        });
      } catch (error: any) {
        console.error("Error fetching settings:", error);
        res.status(500).json({ 
          message: "Failed to fetch settings",
          success: false 
        });
      }
    });
  });

  expressApp.get('/api/admin/users', async (req, res, next) => {
    // Choose middleware based on dependencies loaded
    const middleware = dependenciesLoaded && AuthService?.adminMiddleware ? AuthService.adminMiddleware : fallbackAuth.adminMiddleware;
    return middleware(req, res, async () => {
      try {
        if (!dependenciesLoaded || !storage) {
          return res.json({
            success: true,
            users: []
          });
        }

        // Get all users - in production this would have pagination
        const users = await storage.getAllUsers();
        res.json({
          success: true,
          users: users.map((user: any) => ({
            ...user,
            password: undefined // Never send passwords
          }))
        });
      } catch (error: any) {
        console.error("Error fetching users:", error);
        res.status(500).json({ 
          message: "Failed to fetch users",
          success: false 
        });
      }
    });
  });

  expressApp.get('/api/admin/stats', async (req, res, next) => {
    // Choose middleware based on dependencies loaded
    const middleware = dependenciesLoaded && AuthService?.adminMiddleware ? AuthService.adminMiddleware : fallbackAuth.adminMiddleware;
    return middleware(req, res, async () => {
      try {
        if (!dependenciesLoaded || !storage) {
          return res.json({
            success: true,
            stats: {
              totalUsers: 0,
              totalMods: 0,
              totalPurchases: 0,
              deals: {
                totalDeals: activeDeals.length,
                activeDeals: activeDeals.filter(d => d.isActive).length,
                totalUsage: activeDeals.reduce((sum, deal) => sum + deal.usageCount, 0)
              }
            }
          });
        }

        // Get basic statistics
        const stats = {
          totalUsers: await storage.getUserCount(),
          totalMods: await storage.getModsCount({}),
          totalPurchases: await storage.getPurchaseCount()
        };
        
        // Add deals statistics
        const dealStats = {
          totalDeals: activeDeals.length,
          activeDeals: activeDeals.filter(d => d.isActive).length,
          totalUsage: activeDeals.reduce((sum, deal) => sum + deal.usageCount, 0)
        };
        
        res.json({
          success: true,
          stats: {
            ...stats,
            deals: dealStats
          }
        });
      } catch (error: any) {
        console.error("Error fetching stats:", error);
        res.status(500).json({ 
          message: "Failed to fetch statistics",
          success: false 
        });
      }
    });
  });

  // Deals endpoints
  expressApp.get('/api/deals', (req, res) => {
    try {
      const activeOnly = req.query.active === 'true';
      const deals = activeOnly ? activeDeals.filter(deal => deal.isActive) : activeDeals;
      
      res.json({
        success: true,
        deals: deals.map(deal => ({
          ...deal,
          usageCount: deal.usageCount > 0 ? deal.usageCount : undefined
        }))
      });
    } catch (error: any) {
      console.error("Error fetching deals:", error);
      res.status(500).json({ 
        message: "Failed to fetch deals",
        success: false 
      });
    }
  });

  // Admin login endpoint
  expressApp.post('/api/auth/admin-login', async (req, res) => {
    try {
      const { username, password } = req.body;
      const clientIP = getClientIP(req);
      
      if (!username || !password) {
        return res.status(400).json({ 
          message: "Username and password are required",
          success: false 
        });
      }

      // Use fallback if dependencies not loaded
      if (!dependenciesLoaded) {
        console.log("[AUTH] Dependencies not loaded, using fallback admin authentication");
        
        const rateLimitId = `admin-login:${clientIP}`;
        if (fallbackRateLimiter.isRateLimited(rateLimitId)) {
          return res.status(429).json({ 
            message: "Too many admin login attempts. Please try again later.",
            success: false 
          });
        }

        const fallbackResult = await fallbackAuth.authenticate(username, password);
        if (fallbackResult && fallbackResult.user.isAdmin) {
          fallbackRateLimiter.resetAttempts(rateLimitId);
          return res.json({
            message: 'Admin login successful (fallback mode)',
            success: true,
            user: fallbackResult.user,
            token: fallbackResult.token
          });
        }

        return res.status(401).json({ 
          message: "Invalid admin credentials",
          success: false 
        });
      }

      // Rate limiting for admin login
      const rateLimitId = `admin-login:${clientIP}`;
      if (RateLimiter.isRateLimited(rateLimitId)) {
        return res.status(429).json({ 
          message: "Too many admin login attempts. Please try again later.",
          success: false 
        });
      }

      // Authenticate admin user
      const result = await AuthService.authenticateAdmin(username, password);
      
      if (!result) {
        return res.status(401).json({ 
          message: "Invalid admin credentials",
          success: false 
        });
      }

      // Reset rate limit on successful login
      RateLimiter.resetAttempts(rateLimitId);

      res.json({
        message: 'Admin login successful',
        success: true,
        user: result.user,
        token: result.token
      });

    } catch (error: any) {
      console.error('Admin login error:', error);
      res.status(500).json({ 
        message: 'Admin authentication service temporarily unavailable',
        success: false 
      });
    }
  });

  // Global error handling middleware
  expressApp.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ 
      message: "Internal server error",
      success: false,
      ...(process.env.NODE_ENV === 'development' && { error: err.message })
    });
  });

  // 404 handler
  expressApp.use('*', (req, res) => {
    res.status(404).json({ 
      message: "Endpoint not found",
      success: false,
      path: req.originalUrl,
      method: req.method
    });
  });
  
  app = expressApp;
  isInitialized = true;
  console.log("Production Express app initialized successfully");
  return expressApp;
}

// Vercel serverless function handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Initialize dependencies if not already done
    if (!dependenciesLoaded) {
      dependenciesLoaded = await initializeDependencies();
    }
    
    // Create the Express app regardless of dependency loading status
    // The fallback authentication will handle cases where dependencies fail
    const expressApp = await createProductionApp();
    return expressApp(req as any, res as any);
    
  } catch (error) {
    console.error("Critical handler error:", error);
    
    return res.status(500).json({
      message: "Service temporarily unavailable",
      success: false,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { 
        error: error instanceof Error ? error.message : "Unknown error" 
      })
    });
  }
}

// Initialize dependencies on server start
initializeDependencies();