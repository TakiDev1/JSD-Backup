import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { db } from "./db";
import * as schema from "@shared/schema";
import { mods } from "@shared/schema";
import { setupAuth, hashPassword, comparePasswords } from "./auth";
import { stripe, createPaymentIntent, getOrCreateSubscription, handleWebhookEvent } from "./stripe";
import { z } from "zod";
import { eq, sql, asc, desc } from "drizzle-orm";
import {
  insertModSchema,
  insertModVersionSchema
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
      
      console.log("Login attempt for username:", username);
      console.log("Session before login:", req.sessionID);
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      // Find user
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        console.log("Login failed: User not found");
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
          console.error("Login error during req.login:", err);
          return res.status(500).json({ message: "Login error" });
        }
        
        console.log("User authenticated in req.login:", req.isAuthenticated());
        console.log("Session ID after login:", req.sessionID);
        
        // Don't send sensitive information to the client
        const safeUser = { ...user };
        delete (safeUser as any).password;
        
        // Update last login time
        storage.updateUser(user.id, { lastLogin: new Date() })
          .catch(err => console.error("Failed to update last login time:", err));
        
        // Force save the session to ensure it's stored properly
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("Error saving session:", saveErr);
          }
          console.log("Session saved successfully, user authenticated:", req.isAuthenticated());
          return res.status(200).json(safeUser);
        });
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "An error occurred during login" });
    }
  });
  
  app.get("/api/auth/user", (req, res) => {
    console.log("Auth check - Session ID:", req.sessionID);
    console.log("Auth check - isAuthenticated():", req.isAuthenticated());
    console.log("Auth check - Session data:", req.session);
    
    if (req.isAuthenticated()) {
      const user = { ...req.user };
      console.log("Auth check - User authenticated:", { id: user.id, username: user.username });
      
      // Don't send sensitive information to the client
      delete (user as any).password;
      res.json(user);
    } else {
      console.log("Auth check - User not authenticated");
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
          console.error("Admin login error during req.login:", err);
          return res.status(500).json({ message: "Login error" });
        }
        
        console.log("Admin user authenticated in req.login:", req.isAuthenticated());
        console.log("Admin session ID after login:", req.sessionID);
        
        // Log this login
        storage.logAdminActivity({
          userId: user.id,
          action: "Admin Login",
          details: `Admin login for ${username}`,
          ipAddress: req.ip
        }).catch(err => console.error("Failed to log admin activity:", err));
        
        // Don't send password back to client
        // Create a user object without password
        const userWithoutPassword = { ...user };
        delete userWithoutPassword.password;
        
        // Make sure isAdmin is set
        userWithoutPassword.isAdmin = true;
        
        // Force save the session to ensure it's stored properly
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("Error saving admin session:", saveErr);
          }
          console.log("Admin session saved successfully, user authenticated:", req.isAuthenticated());
          // Return the user object directly as this will be the authenticated user session
          res.json({ success: true, user: userWithoutPassword });
        });
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
          console.error("Registration login error during req.login:", err);
          return res.status(500).json({ message: "Login error" });
        }
        
        console.log("New user authenticated in req.login:", req.isAuthenticated());
        console.log("New user session ID after registration:", req.sessionID);
        
        // Don't send sensitive information to the client
        const safeUser = { ...user };
        delete (safeUser as any).password;
        
        // Force save the session to ensure it's stored properly
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("Error saving session after registration:", saveErr);
          }
          console.log("Session saved successfully after registration, user authenticated:", req.isAuthenticated());
          return res.status(201).json(safeUser);
        });
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

  // Simple mod listing endpoint - always showing all mods regardless of publish status
  app.get("/api/mods", async (req, res) => {
    try {
      const { category, search, featured, subscription, limit, page } = req.query;
      const pageSize = limit ? parseInt(limit as string) : 12;
      const currentPage = page ? parseInt(page as string) : 1;
      const offset = (currentPage - 1) * pageSize;
      
      // This will go directly to storage interface as in original code
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
      console.error("Error fetching mods:", error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get mod counts by category - showing all mods
  app.get("/api/mods/counts/by-category", async (req, res) => {
    try {
      // Use predefined categories to ensure we always have a consistent list
      const allCategories = [
        "vehicles", "sports", "drift", "offroad", "racing", "muscle", 
        "jdm", "supercars", "custom", "plushies", "rugs"
      ];
      
      const counts = await Promise.all(
        allCategories.map(async (category) => {
          const count = await storage.getModsCount({ 
            category
          });
          return {
            id: category,
            count
          };
        })
      );
      
      res.json(counts);
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
      
      // Get latest version
      const latestVersion = await storage.getLatestModVersion(mod.id);
      
      // Reviews system removed
      
      res.json({
        ...mod,
        latestVersion,
        reviews: [] // Empty array for backward compatibility
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
  
  // Removed all publish/unpublish endpoints since we now show all mods directly

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

  // Reviews system removed

  // Cart routes - completely rewritten for reliability
  app.get("/api/cart", auth.isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Get cart items directly from the database
      const cartItemsResult = await db.query.cartItems.findMany({
        where: eq(schema.cartItems.userId, userId),
        with: {
          mod: true
        }
      });
      
      // Format response
      const cart = cartItemsResult.map(item => {
        return {
          id: item.id,
          userId: item.userId,
          modId: item.modId,
          addedAt: item.addedAt,
          mod: item.mod
        };
      });
      
      res.json(cart);
    } catch (error: any) {
      console.error("Cart fetch error:", error);
      res.status(500).json({ message: "Failed to retrieve cart items", error: error.message });
    }
  });
  
  app.post("/api/cart", async (req, res) => {
    try {
      console.log("\n\n======== CART API - POST REQUEST ========");
      console.log("Cart API - Path:", req.path);
      console.log("Cart API - Method:", req.method);
      console.log("Cart API - Headers:", JSON.stringify(req.headers, null, 2));
      console.log("Cart API - Content-Type:", req.headers['content-type']);
      console.log("Cart API - Is authenticated?", req.isAuthenticated());
      console.log("Cart API - Session ID:", req.sessionID);
      console.log("Cart API - Session data:", req.session);
      console.log("Cart API - Request body:", req.body);
      console.log("Cart API - User:", req.user);
      
      // First, check authentication
      if (!req.isAuthenticated()) {
        console.log("Cart API - User not authenticated");
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Then get user ID
      const userId = (req.user as any)?.id;
      
      if (!userId) {
        console.log("Cart API - User is authenticated but ID is missing");
        return res.status(401).json({ message: "Authentication required - user ID not found" });
      }
      
      let { modId } = req.body;
      
      console.log("Cart API - modId from body:", modId, "Type:", typeof modId);
      
      // Ensure modId is a number
      modId = Number(modId);
      
      console.log("Cart API - After conversion - User ID:", userId, "Mod ID:", modId, "Type:", typeof modId);
      
      if (!modId || isNaN(modId)) {
        console.log("Cart API - Invalid mod ID:", modId);
        return res.status(400).json({ message: "Invalid mod ID provided" });
      }
      
      // Check if mod exists
      const mod = await db.query.mods.findFirst({
        where: eq(schema.mods.id, modId)
      });
      
      if (!mod) {
        return res.status(404).json({ message: "Mod not found" });
      }
      
      // Check if already in cart
      const existingCartItem = await db.query.cartItems.findFirst({
        where: (cartItems) => {
          return sql`${cartItems.userId} = ${userId} AND ${cartItems.modId} = ${modId}`;
        }
      });
      
      if (existingCartItem) {
        return res.status(200).json({
          message: "Item already in cart",
          cartItem: existingCartItem
        });
      }
      
      // Check if already purchased
      const purchase = await db.query.purchases.findFirst({
        where: (purchases) => {
          return sql`${purchases.userId} = ${userId} AND ${purchases.modId} = ${modId}`;
        }
      });
      
      if (purchase) {
        return res.status(400).json({ message: "You already own this mod" });
      }
      
      // Add to cart
      console.log("Cart API - Attempting to insert cart item:", { userId, modId });
      
      try {
        const [cartItem] = await db.insert(schema.cartItems)
          .values({
            userId,
            modId,
            addedAt: new Date()
          })
          .returning();
        
        console.log("Cart API - Insert successful, returned cart item:", cartItem);
        
        // Fetch the cart item with mod details
        const result = {
          ...cartItem,
          mod
        };
        
        console.log("Cart API - Final response:", result);
        
        res.status(201).json(result);
      } catch (dbError) {
        console.error("Cart API - Database error during insert:", dbError);
        throw dbError;
      }
    } catch (error: any) {
      console.error("Add to cart error:", error);
      res.status(500).json({ message: "Failed to add item to cart", error: error.message });
    }
  });
  
  app.delete("/api/cart/:modId", auth.isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const modId = parseInt(req.params.modId);
      
      if (isNaN(modId)) {
        return res.status(400).json({ message: "Invalid mod ID" });
      }
      
      // Check if item exists in cart
      const cartItem = await db.query.cartItems.findFirst({
        where: (cartItems) => {
          return sql`${cartItems.userId} = ${userId} AND ${cartItems.modId} = ${modId}`;
        }
      });
      
      if (!cartItem) {
        return res.status(404).json({ message: "Item not found in cart" });
      }
      
      // Remove from cart
      await db.delete(schema.cartItems)
        .where(sql`${schema.cartItems.userId} = ${userId} AND ${schema.cartItems.modId} = ${modId}`);
      
      res.status(200).json({ success: true, message: "Item removed from cart" });
    } catch (error: any) {
      console.error("Remove from cart error:", error);
      res.status(500).json({ message: "Failed to remove item from cart", error: error.message });
    }
  });
  
  app.delete("/api/cart", auth.isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Clear cart
      await db.delete(schema.cartItems)
        .where(eq(schema.cartItems.userId, userId));
      
      res.status(200).json({ success: true, message: "Cart cleared successfully" });
    } catch (error: any) {
      console.error("Clear cart error:", error);
      res.status(500).json({ message: "Failed to clear cart", error: error.message });
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
  
  app.post("/api/purchase-subscription", auth.isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const { duration } = req.body;
      
      if (!duration || !['1month', '3month', '6month', '12month'].includes(duration)) {
        return res.status(400).json({ message: "Valid subscription duration required" });
      }
      
      // Map durations to prices (in dollars)
      const pricingMap: Record<string, number> = {
        '1month': 5.99,
        '3month': 14.99,
        '6month': 24.99,
        '12month': 39.99
      };
      
      // Map durations to days
      const daysMap: Record<string, number> = {
        '1month': 30,
        '3month': 90,
        '6month': 180,
        '12month': 365
      };
      
      const price = pricingMap[duration];
      
      // Create a payment intent for the subscription purchase
      const paymentIntent = await createPaymentIntent(price, { 
        userId: user.id.toString(),
        action: 'subscription_purchase',
        duration 
      });
      
      // Store subscription information in session to use after payment success
      (req.session as any).pendingSubscriptionData = {
        userId: user.id,
        duration,
        days: daysMap[duration],
        price
      };
      
      res.json({ 
        clientSecret: paymentIntent.clientSecret,
        price,
        duration
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Activate subscription after successful payment
  app.post("/api/activate-subscription", auth.isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { paymentIntentId } = req.body;
      
      if (!paymentIntentId) {
        return res.status(400).json({ message: "Payment intent ID required" });
      }
      
      // Verify payment intent was successful
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ message: "Payment not completed successfully" });
      }
      
      // Get pending subscription from session
      const pendingSubscription = (req.session as any).pendingSubscriptionData;
      
      if (!pendingSubscription || pendingSubscription.userId !== userId) {
        return res.status(400).json({ message: "No valid pending subscription found" });
      }
      
      // Calculate expiration date
      const now = new Date();
      const expiresAt = new Date(now.getTime() + (pendingSubscription.days * 24 * 60 * 60 * 1000));
      
      // Update user with premium status
      await db.update(schema.users)
        .set({
          isPremium: true,
          premiumExpiresAt: expiresAt
        })
        .where(eq(schema.users.id, userId));
      
      // Clear pending subscription from session
      if ((req.session as any).pendingSubscriptionData) {
        delete (req.session as any).pendingSubscriptionData;
      }
      
      // Return user status
      const user = await storage.getUser(userId);
      res.json({ success: true, user });
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
      
      // If user has premium status, also include subscription-only mods
      let subscriptionMods: Array<{
        mod: schema.Mod,
        latestVersion: schema.ModVersion | undefined,
        subscription: boolean
      }> = [];
      
      const now = new Date();
      const isPremiumActive = user?.isPremium && user?.premiumExpiresAt && new Date(user.premiumExpiresAt) > now;
      
      if (isPremiumActive) {
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
        hasSubscription: isPremiumActive,
        premiumExpiresAt: user?.premiumExpiresAt
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
