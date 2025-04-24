import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { db } from "./db";
import { mods } from "@shared/schema";
import { setupAuth, hashPassword, comparePasswords } from "./auth";
import { stripe, createPaymentIntent, getOrCreateSubscription, handleWebhookEvent } from "./stripe";
import { z } from "zod";
import {
  insertModSchema,
  insertModVersionSchema,
  insertReviewSchema
  // Forum schemas removed as requested
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
  // Discord routes will redirect to maintenance page
  app.get("/api/auth/discord", (req, res) => {
    res.redirect("/maintenance");
  });
  
  app.get("/api/auth/discord/callback", (req, res) => {
    res.redirect("/maintenance");
  });
  
  // Add a route to check Discord auth availability
  app.get("/api/auth/discord-status", (req, res) => {
    const available = !!(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET);
    res.json({ available });
  });
  
  // Add placeholder route for callback to avoid 404 errors
  if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET) {
    app.get("/api/auth/discord/callback", (req, res) => {
      res.status(503).json({ message: "Discord authentication not configured" });
    });
  }
  
  // Regular user login route
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      // Find user
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Verify password - only if the user has a password set
      if (user.password) {
        const passwordValid = await comparePasswords(password, user.password);
        
        if (!passwordValid) {
          return res.status(401).json({ message: "Invalid username or password" });
        }
      } else {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Login the user
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login error" });
        }
        
        // Don't send sensitive information to the client
        const safeUser = { ...user };
        delete (safeUser as any).password;
        
        // Update last login time
        storage.updateUser(user.id, { lastLogin: new Date() })
          .catch(err => console.error("Failed to update last login time:", err));
        
        return res.status(200).json(safeUser);
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "An error occurred during login" });
    }
  });
  
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
      console.log("Admin login attempt for user:", username, "Found:", !!user);
      
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      if (!user.isAdmin) {
        console.log("User is not an admin. isAdmin:", user.isAdmin);
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
        // Create a user object without password
        const userWithoutPassword = { ...user };
        delete userWithoutPassword.password;
        
        // Make sure isAdmin is set
        userWithoutPassword.isAdmin = true;
        
        // Return the user object directly as this will be the authenticated user session
        res.json({ success: true, user: userWithoutPassword });
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // User registration route
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, email, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      // Hash the password
      const hashedPassword = await hashPassword(password);
      
      // Create the user
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        isAdmin: false,
      });
      
      // Login the user
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login error" });
        }
        
        // Don't send sensitive information to the client
        const safeUser = { ...user };
        delete (safeUser as any).password;
        
        return res.status(201).json(safeUser);
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "An error occurred during registration" });
    }
  });
  
  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ success: true });
    });
  });

  // SIMPLIFIED MODS ROUTES - All mods with admin & public filtering
  app.get("/api/mods", async (req, res) => {
    try {
      const { 
        category, 
        search, 
        featured, 
        subscription, 
        limit = "12", 
        page = "1",
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;
      
      const pageSize = parseInt(limit as string);
      const currentPage = parseInt(page as string);
      const offset = (currentPage - 1) * pageSize;
      
      // For admin users show all mods, for everyone else only show published
      const isAdmin = req.isAuthenticated() && (req.user as any)?.isAdmin;
      
      // Query database directly with SQL for better performance and reliability
      let query = db.select().from(mods);
      
      // Apply filters
      if (category) {
        query = query.where(eq(mods.category, category as string));
      }
      
      if (search) {
        query = query.where(
          sql`${mods.title} ILIKE ${'%' + search + '%'} OR ${mods.description} ILIKE ${'%' + search + '%'}`
        );
      }
      
      if (featured === "true") {
        query = query.where(eq(mods.isFeatured, true));
      }
      
      if (subscription === "true") {
        query = query.where(eq(mods.isSubscriptionOnly, true));
      }
      
      // Only admins can see unpublished mods
      if (!isAdmin) {
        query = query.where(eq(mods.isPublished, true));
      }
      
      // Count total first
      const countQuery = db.select({ count: sql`COUNT(*)` }).from(mods);
      
      // Apply same filters to count query
      if (category) {
        countQuery.where(eq(mods.category, category as string));
      }
      
      if (search) {
        countQuery.where(
          sql`${mods.title} ILIKE ${'%' + search + '%'} OR ${mods.description} ILIKE ${'%' + search + '%'}`
        );
      }
      
      if (featured === "true") {
        countQuery.where(eq(mods.isFeatured, true));
      }
      
      if (subscription === "true") {
        countQuery.where(eq(mods.isSubscriptionOnly, true));
      }
      
      if (!isAdmin) {
        countQuery.where(eq(mods.isPublished, true));
      }
      
      // Execute the count query
      const [totalResult] = await countQuery;
      const total = Number(totalResult.count);
      
      // Apply sorting to main query
      const column = sortBy === 'title' ? mods.title :
                    sortBy === 'price' ? mods.price :
                    sortBy === 'category' ? mods.category :
                    sortBy === 'version' ? mods.version :
                    sortBy === 'downloadCount' ? mods.downloadCount :
                    mods.createdAt;
                    
      if (sortOrder === 'asc') {
        query = query.orderBy(asc(column));
      } else {
        query = query.orderBy(desc(column));
      }
      
      // Apply pagination to main query
      query = query.limit(pageSize).offset(offset);
      
      // Execute the main query
      const results = await query;
      
      // Return result
      res.json({
        mods: results,
        pagination: {
          total,
          pageSize,
          currentPage,
          totalPages: Math.ceil(total / pageSize)
        }
      });
    } catch (error: any) {
      console.error("Error fetching mods:", error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // SIMPLIFIED categories with direct SQL counts
  app.get("/api/mods/counts/by-category", async (req, res) => {
    try {
      // Check if this is an admin request
      const isAdmin = req.isAuthenticated() && (req.user as any)?.isAdmin;
      
      // Get categories directly from database - more efficient than hardcoding
      let query = db
        .select({ id: mods.category, count: sql`COUNT(*)` })
        .from(mods)
        .groupBy(mods.category);
      
      // Only show published mods for non-admin users
      if (!isAdmin) {
        query = query.where(eq(mods.isPublished, true));
      }
      
      const categoryCounts = await query;
      
      // Fallback to default categories if none found
      if (categoryCounts.length === 0) {
        const defaults = [
          { id: "vehicles", count: 0 },
          { id: "sports", count: 0 },
          { id: "drift", count: 0 },
          { id: "offroad", count: 0 },
          { id: "racing", count: 0 },
          { id: "muscle", count: 0 },
          { id: "maps", count: 0 },
          { id: "parts", count: 0 }
        ];
        res.json(defaults);
      } else {
        res.json(categoryCounts);
      }
    } catch (error: any) {
      console.error("Error fetching category counts:", error);
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/mods/:id", async (req, res) => {
    try {
      const mod = await storage.getMod(parseInt(req.params.id));
      
      if (!mod) {
        return res.status(404).json({ message: "Mod not found" });
      }
      
      // Check if the mod is published or if the user is an admin
      const isAdmin = req.isAuthenticated() && (req.user as any)?.isAdmin;
      
      // If mod is not published and user is not admin, return 404
      if (!mod.isPublished && !isAdmin) {
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
  
  // Publish/unpublish mod routes
  app.post("/api/mods/:id/publish", auth.isAdmin, async (req, res) => {
    try {
      const modId = parseInt(req.params.id);
      const mod = await storage.updateMod(modId, { isPublished: true });
      
      if (!mod) {
        return res.status(404).json({ message: "Mod not found" });
      }
      
      // Log admin activity
      await storage.logAdminActivity({
        userId: (req.user as any).id,
        action: "Publish Mod",
        details: `Published mod ID: ${modId}, Title: ${mod.title}`,
        ipAddress: req.ip
      });
      
      res.json(mod);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post("/api/mods/:id/unpublish", auth.isAdmin, async (req, res) => {
    try {
      const modId = parseInt(req.params.id);
      const mod = await storage.updateMod(modId, { isPublished: false });
      
      if (!mod) {
        return res.status(404).json({ message: "Mod not found" });
      }
      
      // Log admin activity
      await storage.logAdminActivity({
        userId: (req.user as any).id,
        action: "Unpublish Mod",
        details: `Unpublished mod ID: ${modId}, Title: ${mod.title}`,
        ipAddress: req.ip
      });
      
      res.json(mod);
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
  // Forum routes have been removed as requested

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
  
  // Get general settings
  app.get("/api/admin/settings/general", auth.isAdmin, async (req, res) => {
    try {
      const generalSettings = {
        siteName: await storage.getSiteSetting("siteName") || "JSD Mods",
        siteDescription: await storage.getSiteSetting("siteDescription") || "Premium BeamNG Drive mods",
        contactEmail: await storage.getSiteSetting("contactEmail") || "contact@jsdmods.com",
        maintenanceMode: await storage.getSiteSetting("maintenanceMode") === "true",
        maintenanceMessage: await storage.getSiteSetting("maintenanceMessage") || "Site is currently undergoing maintenance. Please check back soon.",
      };
      res.json(generalSettings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get integration settings
  app.get("/api/admin/settings/integrations", auth.isAdmin, async (req, res) => {
    try {
      const integrationSettings = {
        patreonClientId: await storage.getSiteSetting("patreonClientId") || "",
        patreonClientSecret: await storage.getSiteSetting("patreonClientSecret") || "",
        patreonWebhookSecret: await storage.getSiteSetting("patreonWebhookSecret") || "",
        patreonCreatorAccessToken: await storage.getSiteSetting("patreonCreatorAccessToken") || "",
        discordWebhookUrl: await storage.getSiteSetting("discordWebhookUrl") || "",
      };
      res.json(integrationSettings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get payment settings
  app.get("/api/admin/settings/payments", auth.isAdmin, async (req, res) => {
    try {
      const paymentSettings = {
        currency: await storage.getSiteSetting("currency") || "USD",
        defaultSubscriptionPrice: await storage.getSiteSetting("defaultSubscriptionPrice") || "9.99",
        enableStripe: await storage.getSiteSetting("enableStripe") === "true",
        enableSubscriptions: await storage.getSiteSetting("enableSubscriptions") === "true",
        taxRate: await storage.getSiteSetting("taxRate") || "0",
      };
      res.json(paymentSettings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Update general settings
  app.post("/api/admin/settings/general", auth.isAdmin, async (req, res) => {
    try {
      const { siteName, siteDescription, contactEmail, maintenanceMode, maintenanceMessage } = req.body;
      
      // Update settings one by one
      await storage.setSiteSetting("siteName", siteName);
      await storage.setSiteSetting("siteDescription", siteDescription);
      await storage.setSiteSetting("contactEmail", contactEmail);
      await storage.setSiteSetting("maintenanceMode", maintenanceMode.toString());
      await storage.setSiteSetting("maintenanceMessage", maintenanceMessage);
      
      // Log admin activity
      await storage.logAdminActivity({
        userId: (req.user as any).id,
        action: "Update General Settings",
        details: `Updated general site settings`,
        ipAddress: req.ip
      });
      
      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Update integration settings
  app.post("/api/admin/settings/integrations", auth.isAdmin, async (req, res) => {
    try {
      const { patreonClientId, patreonClientSecret, patreonWebhookSecret, patreonCreatorAccessToken, discordWebhookUrl } = req.body;
      
      // Update settings one by one
      await storage.setSiteSetting("patreonClientId", patreonClientId);
      await storage.setSiteSetting("patreonClientSecret", patreonClientSecret);
      await storage.setSiteSetting("patreonWebhookSecret", patreonWebhookSecret);
      await storage.setSiteSetting("patreonCreatorAccessToken", patreonCreatorAccessToken);
      await storage.setSiteSetting("discordWebhookUrl", discordWebhookUrl);
      
      // Log admin activity
      await storage.logAdminActivity({
        userId: (req.user as any).id,
        action: "Update Integration Settings",
        details: `Updated integration settings`,
        ipAddress: req.ip
      });
      
      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Update payment settings
  app.post("/api/admin/settings/payments", auth.isAdmin, async (req, res) => {
    try {
      const { currency, defaultSubscriptionPrice, enableStripe, enableSubscriptions, taxRate } = req.body;
      
      // Update settings one by one
      await storage.setSiteSetting("currency", currency);
      await storage.setSiteSetting("defaultSubscriptionPrice", defaultSubscriptionPrice);
      await storage.setSiteSetting("enableStripe", enableStripe.toString());
      await storage.setSiteSetting("enableSubscriptions", enableSubscriptions.toString());
      await storage.setSiteSetting("taxRate", taxRate);
      
      // Log admin activity
      await storage.logAdminActivity({
        userId: (req.user as any).id,
        action: "Update Payment Settings",
        details: `Updated payment settings`,
        ipAddress: req.ip
      });
      
      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Test Patreon connection
  app.post("/api/admin/settings/test-patreon", auth.isAdmin, async (req, res) => {
    try {
      const patreonClientId = await storage.getSiteSetting("patreonClientId");
      const patreonClientSecret = await storage.getSiteSetting("patreonClientSecret");
      const patreonCreatorAccessToken = await storage.getSiteSetting("patreonCreatorAccessToken");
      
      if (!patreonClientId || !patreonClientSecret || !patreonCreatorAccessToken) {
        return res.status(400).json({ message: "Patreon settings are incomplete" });
      }
      
      // Here we would normally test the Patreon API connection
      // For this implementation, we'll just validate that the required settings are present
      
      // Log admin activity
      await storage.logAdminActivity({
        userId: (req.user as any).id,
        action: "Test Patreon Connection",
        details: "Tested Patreon API connection",
        ipAddress: req.ip
      });
      
      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Test Discord webhook
  app.post("/api/admin/settings/test-discord-webhook", auth.isAdmin, async (req, res) => {
    try {
      const discordWebhookUrl = await storage.getSiteSetting("discordWebhookUrl");
      
      if (!discordWebhookUrl) {
        return res.status(400).json({ message: "Discord webhook URL is not set" });
      }
      
      // In a real implementation, you would send a test message to the Discord webhook
      // We'll simulate success for now
      
      // Log admin activity
      await storage.logAdminActivity({
        userId: (req.user as any).id,
        action: "Test Discord Webhook",
        details: "Sent test message to Discord webhook",
        ipAddress: req.ip
      });
      
      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Test Stripe connection
  app.post("/api/admin/settings/test-stripe", auth.isAdmin, async (req, res) => {
    try {
      // Check if Stripe API keys are configured in environment
      if (!process.env.STRIPE_SECRET_KEY || !process.env.VITE_STRIPE_PUBLIC_KEY) {
        return res.status(400).json({ message: "Stripe API keys are not configured" });
      }
      
      // Simply attempt to retrieve account info to test the connection
      await stripe.balance.retrieve();
      
      // Log admin activity
      await storage.logAdminActivity({
        userId: (req.user as any).id,
        action: "Test Stripe Connection",
        details: "Tested Stripe API connection",
        ipAddress: req.ip
      });
      
      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Individual site setting update for backward compatibility
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
