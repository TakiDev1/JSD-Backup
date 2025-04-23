import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { setupAuth, hashPassword, comparePasswords } from "./auth";
import { stripe, createPaymentIntent, getOrCreateSubscription, handleWebhookEvent } from "./stripe";
import { z } from "zod";
import {
  insertModSchema,
  insertModVersionSchema,
  insertReviewSchema,
  insertForumThreadSchema,
  insertForumReplySchema
} from "@shared/schema";
import passport from "passport";

// Setup file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.resolve(process.cwd(), "uploads");
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 1024 * 1024 * 500 // 500MB
  }
});

// Setup API routes
export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  const auth = setupAuth(app);

  // Auth routes
  app.get("/api/auth/discord", passport.authenticate("discord"));
  
  app.get(
    "/api/auth/discord/callback",
    passport.authenticate("discord", {
      failureRedirect: "/login-failed"
    }),
    (req, res) => {
      res.redirect("/");
    }
  );
  
  app.get("/api/auth/user", (req, res) => {
    if (req.isAuthenticated()) {
      const user = { ...req.user };
      // Don't send sensitive information to the client
      delete (user as any).password;
      res.json(user);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });
  
  // Admin login route
  app.post("/api/auth/admin-login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      // Find admin user
      const user = await storage.getUserByUsername(username);
      
      if (!user || !user.isAdmin) {
        return res.status(401).json({ message: "Invalid admin credentials" });
      }
      
      // Verify password - only if the user has a password set
      if (user.password) {
        const passwordValid = await comparePasswords(password, user.password);
        
        if (!passwordValid) {
          return res.status(401).json({ message: "Invalid admin credentials" });
        }
      } else {
        // If the admin user doesn't have a password yet (initial login), set it
        const hashedPassword = await hashPassword(password);
        await storage.updateUser(user.id, { password: hashedPassword });
      }
      
      // Login the user
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login error" });
        }
        
        // Log this login
        storage.logAdminActivity({
          userId: user.id,
          action: "Admin Login",
          details: `Admin login for ${username}`,
          ipAddress: req.ip
        });
        
        // Don't send password back to client
        const userWithoutPassword = { ...user };
        delete userWithoutPassword.password;
        
        res.json({ success: true, user: userWithoutPassword });
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ success: true });
    });
  });

  // Mods routes
  app.get("/api/mods", async (req, res) => {
    try {
      const { category, search, featured, subscription, limit, page } = req.query;
      const pageSize = limit ? parseInt(limit as string) : 12;
      const currentPage = page ? parseInt(page as string) : 1;
      const offset = (currentPage - 1) * pageSize;
      
      const mods = await storage.getMods({
        category: category as string,
        searchTerm: search as string,
        featured: featured === "true",
        subscriptionOnly: subscription === "true",
        limit: pageSize,
        offset
      });
      
      const total = await storage.getModsCount({
        category: category as string,
        searchTerm: search as string,
        featured: featured === "true",
        subscriptionOnly: subscription === "true"
      });
      
      res.json({
        mods,
        pagination: {
          total,
          pageSize,
          currentPage,
          totalPages: Math.ceil(total / pageSize)
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/mods/:id", async (req, res) => {
    try {
      const mod = await storage.getMod(parseInt(req.params.id));
      
      if (!mod) {
        return res.status(404).json({ message: "Mod not found" });
      }
      
      // Get latest version
      const latestVersion = await storage.getLatestModVersion(mod.id);
      
      // Get reviews
      const reviews = await storage.getReviewsByMod(mod.id);
      
      res.json({
        ...mod,
        latestVersion,
        reviews
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Admin mod routes
  app.post("/api/mods", auth.isAdmin, async (req, res) => {
    try {
      const validatedData = insertModSchema.parse(req.body);
      const mod = await storage.createMod(validatedData);
      res.status(201).json(mod);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  app.put("/api/mods/:id", auth.isAdmin, async (req, res) => {
    try {
      const validatedData = insertModSchema.partial().parse(req.body);
      const mod = await storage.updateMod(parseInt(req.params.id), validatedData);
      
      if (!mod) {
        return res.status(404).json({ message: "Mod not found" });
      }
      
      res.json(mod);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  app.delete("/api/mods/:id", auth.isAdmin, async (req, res) => {
    try {
      const success = await storage.deleteMod(parseInt(req.params.id));
      
      if (!success) {
        return res.status(404).json({ message: "Mod not found" });
      }
      
      res.json({ success });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Mod versions routes
  app.get("/api/mods/:id/versions", async (req, res) => {
    try {
      const versions = await storage.getModVersions(parseInt(req.params.id));
      res.json(versions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/mods/:id/versions", auth.isAdmin, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const modId = parseInt(req.params.id);
      const mod = await storage.getMod(modId);
      
      if (!mod) {
        return res.status(404).json({ message: "Mod not found" });
      }
      
      const fileStats = fs.statSync(req.file.path);
      
      const versionData = {
        modId,
        version: req.body.version,
        filePath: req.file.path,
        fileSize: fileStats.size,
        changelog: req.body.changelog,
        isLatest: true
      };
      
      const validatedData = insertModVersionSchema.parse(versionData);
      const version = await storage.createModVersion(validatedData);
      
      res.status(201).json(version);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Download route
  app.get("/api/mods/:id/download", auth.isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const modId = parseInt(req.params.id);
      
      // Check if user has purchased the mod or has a subscription
      const purchase = await storage.getModPurchase(userId, modId);
      const user = await storage.getUser(userId);
      const mod = await storage.getMod(modId);
      
      if (!mod) {
        return res.status(404).json({ message: "Mod not found" });
      }
      
      // Allow download if user has purchased the mod or has a subscription for subscription-only mods
      if (!purchase && (!user?.stripeSubscriptionId || !mod.isSubscriptionOnly)) {
        return res.status(403).json({ message: "You need to purchase this mod first" });
      }
      
      // Get the latest version
      const version = await storage.getLatestModVersion(modId);
      
      if (!version) {
        return res.status(404).json({ message: "No version available for download" });
      }
      
      // Serve the file
      res.download(version.filePath);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Reviews routes
  app.post("/api/mods/:id/reviews", auth.isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const modId = parseInt(req.params.id);
      
      // Check if user has already reviewed this mod
      const existingReview = await storage.getUserReview(userId, modId);
      
      if (existingReview) {
        return res.status(400).json({ message: "You have already reviewed this mod" });
      }
      
      // Validate review data
      const reviewData = {
        userId,
        modId,
        rating: req.body.rating,
        comment: req.body.comment
      };
      
      const validatedData = insertReviewSchema.parse(reviewData);
      const review = await storage.createReview(validatedData);
      
      res.status(201).json(review);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  app.put("/api/reviews/:id", auth.isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const reviewId = parseInt(req.params.id);
      
      // Get the review
      const review = await storage.getUserReview(userId, req.body.modId);
      
      if (!review || review.id !== reviewId) {
        return res.status(404).json({ message: "Review not found or not yours" });
      }
      
      // Update the review
      const reviewData = {
        rating: req.body.rating,
        comment: req.body.comment
      };
      
      const validatedData = insertReviewSchema.partial().parse(reviewData);
      const updatedReview = await storage.updateReview(reviewId, validatedData);
      
      res.json(updatedReview);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Cart routes
  app.get("/api/cart", auth.isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const cartItems = await storage.getCartItems(userId);
      
      // Get mod details for each cart item
      const cart = await Promise.all(
        cartItems.map(async (item) => {
          const mod = await storage.getMod(item.modId);
          return {
            ...item,
            mod
          };
        })
      );
      
      res.json(cart);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/cart", auth.isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const modId = req.body.modId;
      
      const mod = await storage.getMod(modId);
      
      if (!mod) {
        return res.status(404).json({ message: "Mod not found" });
      }
      
      // Check if already purchased
      const purchase = await storage.getModPurchase(userId, modId);
      
      if (purchase) {
        return res.status(400).json({ message: "You already own this mod" });
      }
      
      const cartItem = await storage.addToCart({ userId, modId });
      res.status(201).json(cartItem);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  app.delete("/api/cart/:modId", auth.isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const modId = parseInt(req.params.modId);
      
      const success = await storage.removeFromCart(userId, modId);
      
      if (!success) {
        return res.status(404).json({ message: "Item not found in cart" });
      }
      
      res.json({ success });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.delete("/api/cart", auth.isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const success = await storage.clearCart(userId);
      res.json({ success });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Payment routes
  app.post("/api/create-payment-intent", auth.isAuthenticated, async (req, res) => {
    try {
      const { amount } = req.body;
      const userId = (req.user as any).id;
      
      const paymentIntent = await createPaymentIntent(amount, { userId: userId.toString() });
      res.json({ clientSecret: paymentIntent.clientSecret });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/get-or-create-subscription", auth.isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      
      if (!user.email) {
        return res.status(400).json({ message: "User email required for subscription" });
      }
      
      const subscription = await getOrCreateSubscription(
        user.id,
        user.email,
        user.username
      );
      
      res.json(subscription);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/webhook", async (req, res) => {
    const sig = req.headers["stripe-signature"] as string;
    
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return res.status(400).json({ message: "Webhook secret not configured" });
    }
    
    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      
      const result = await handleWebhookEvent(event);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Process purchase after successful payment
  app.post("/api/purchase/complete", auth.isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { transactionId } = req.body;
      
      // Get cart items
      const cartItems = await storage.getCartItems(userId);
      
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      
      // Create purchases for each cart item
      const purchases = await Promise.all(
        cartItems.map(async (item) => {
          const mod = await storage.getMod(item.modId);
          
          if (!mod) {
            throw new Error(`Mod with ID ${item.modId} not found`);
          }
          
          const price = mod.discountPrice || mod.price;
          
          return storage.createPurchase({
            userId,
            modId: item.modId,
            transactionId,
            price
          });
        })
      );
      
      // Clear the cart
      await storage.clearCart(userId);
      
      res.status(201).json({ purchases });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // User's mod locker route
  app.get("/api/mod-locker", auth.isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const user = await storage.getUser(userId);
      
      // Get user's purchases
      const purchases = await storage.getPurchasesByUser(userId);
      
      // Get purchased mods with latest version information
      const purchasedMods = await Promise.all(
        purchases.map(async (purchase) => {
          const mod = await storage.getMod(purchase.modId);
          const latestVersion = await storage.getLatestModVersion(purchase.modId);
          
          return {
            purchase,
            mod,
            latestVersion
          };
        })
      );
      
      // If user has subscription, also include subscription-only mods
      let subscriptionMods = [];
      
      if (user?.stripeSubscriptionId) {
        const subMods = await storage.getMods({ subscriptionOnly: true });
        
        subscriptionMods = await Promise.all(
          subMods.map(async (mod) => {
            const latestVersion = await storage.getLatestModVersion(mod.id);
            
            return {
              mod,
              latestVersion,
              subscription: true
            };
          })
        );
      }
      
      res.json({
        purchasedMods,
        subscriptionMods,
        hasSubscription: !!user?.stripeSubscriptionId
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Forum routes
  app.get("/api/forum/categories", async (req, res) => {
    try {
      const categories = await storage.getForumCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/forum/categories/:id/threads", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const threads = await storage.getForumThreads(categoryId);
      res.json(threads);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/forum/threads/:id", async (req, res) => {
    try {
      const threadId = parseInt(req.params.id);
      const thread = await storage.getForumThread(threadId);
      
      if (!thread) {
        return res.status(404).json({ message: "Thread not found" });
      }
      
      const replies = await storage.getForumReplies(threadId);
      
      res.json({ thread, replies });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/forum/categories/:id/threads", auth.isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const categoryId = parseInt(req.params.id);
      
      const threadData = {
        categoryId,
        userId,
        title: req.body.title,
        content: req.body.content
      };
      
      const validatedData = insertForumThreadSchema.parse(threadData);
      const thread = await storage.createForumThread(validatedData);
      
      res.status(201).json(thread);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  app.post("/api/forum/threads/:id/replies", auth.isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const threadId = parseInt(req.params.id);
      
      // Check if thread exists
      const thread = await storage.getForumThread(threadId);
      
      if (!thread) {
        return res.status(404).json({ message: "Thread not found" });
      }
      
      // Check if thread is locked
      if (thread.isLocked) {
        return res.status(403).json({ message: "Thread is locked" });
      }
      
      const replyData = {
        threadId,
        userId,
        content: req.body.content
      };
      
      const validatedData = insertForumReplySchema.parse(replyData);
      const reply = await storage.createForumReply(validatedData);
      
      res.status(201).json(reply);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Admin routes
  app.get("/api/admin/stats", auth.isAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/admin/activity", auth.isAdmin, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const activity = await storage.getAdminActivity(limit);
      res.json(activity);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/admin/activity", auth.isAdmin, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { action, details } = req.body;
      
      const logEntry = await storage.logAdminActivity({
        userId,
        action,
        details,
        ipAddress: req.ip
      });
      
      res.status(201).json(logEntry);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  app.get("/api/admin/users", auth.isAdmin, async (req, res) => {
    try {
      // Implement user listing logic
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/admin/users", auth.isAdmin, async (req, res) => {
    try {
      const { username, email, isAdmin, isPremium } = req.body;
      
      const user = await storage.createUser({
        username,
        email,
        isAdmin: isAdmin || false,
        isPremium: isPremium || false
      });
      
      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  app.put("/api/admin/users/:id", auth.isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updateData = req.body;
      
      const user = await storage.updateUser(userId, updateData);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  app.post("/api/admin/users/:id/ban", auth.isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { banned } = req.body;
      
      const user = await storage.banUser(userId, banned);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Log admin activity
      await storage.logAdminActivity({
        userId: (req.user as any).id,
        action: banned ? "Ban User" : "Unban User",
        details: `User ID: ${userId}, Username: ${user.username}`,
        ipAddress: req.ip
      });
      
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  app.get("/api/admin/settings", auth.isAdmin, async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/admin/settings", auth.isAdmin, async (req, res) => {
    try {
      const { key, value } = req.body;
      
      const setting = await storage.setSiteSetting(key, value);
      
      // Log admin activity
      await storage.logAdminActivity({
        userId: (req.user as any).id,
        action: "Update Site Setting",
        details: `Key: ${key}, Value: ${value}`,
        ipAddress: req.ip
      });
      
      res.status(201).json(setting);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Initialize site settings and admin users if not present
  (async () => {
    try {
      // Create default site settings
      const existingSettings = await storage.getSiteSettings();
      
      if (Object.keys(existingSettings).length === 0) {
        // Site stats
        await storage.setSiteSetting('totalDownloads', '0');
        await storage.setSiteSetting('happyUsers', '1000');
        await storage.setSiteSetting('modsCreated', '0');
        await storage.setSiteSetting('maintenanceMode', 'false');
        await storage.setSiteSetting('siteTitle', 'JSD BeamNG Drive Mods');
        await storage.setSiteSetting('siteDescription', 'Premium BeamNG Drive mods by JSD');
        
        // Create default admin users
        const jsdExists = await storage.getUserByUsername('JSD');
        if (!jsdExists) {
          await storage.createUser({
            username: 'JSD',
            email: 'jsd@example.com',
            isAdmin: true,
            isPremium: true,
          });
        }
        
        const vonExists = await storage.getUserByUsername('Von');
        if (!vonExists) {
          await storage.createUser({
            username: 'Von',
            email: 'von@example.com',
            isAdmin: true,
            isPremium: true,
          });
        }
        
        const devExists = await storage.getUserByUsername('Developer');
        if (!devExists) {
          await storage.createUser({
            username: 'Developer',
            email: 'dev@example.com',
            isAdmin: true,
            isPremium: true,
          });
        }
        
        console.log('Initial site settings and admin users created');
      }
    } catch (error) {
      console.error('Failed to initialize site settings:', error);
    }
  })();

  const httpServer = createServer(app);
  return httpServer;
}
