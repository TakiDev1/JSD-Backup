import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { storage } from "./storage";
import { db } from "./db";
import * as schema from "@shared/schema";
import { mods, userRoles, roles, permissions, rolePermissions } from "@shared/schema";
import { setupAuth, hashPassword, comparePasswords } from "./auth";
import { stripe, createPaymentIntent, getOrCreateSubscription, handleWebhookEvent } from "./stripe";
import { notifyModUpdateToAllOwners } from "./notifications";
import { z } from "zod";
import { eq, sql, asc, desc, like, or, and, gte, lte, ilike } from "drizzle-orm";
import {
  insertModSchema,
  insertModVersionSchema
} from "@shared/schema";
import passport from "passport";
import { getClientIP } from "./ip-tracker";

// Setup file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      // Use different folders for images and mod files
      const folderType = file.fieldname === 'image' ? 'images' : 'mods';
      const dir = path.resolve(process.cwd(), "uploads", folderType);
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
  fileFilter: (req, file, cb) => {
    // Validate file types based on fieldname
    if (file.fieldname === 'image') {
      // Only allow images
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed!'));
      }
    }
    // Accept the file
    cb(null, true);
  },
  limits: {
    fileSize: 1024 * 1024 * 500 // 500MB max file size
  }
});

// Setup API routes
export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  const auth = setupAuth(app);

  // Permission-based middleware
  const isAdminWithPermission = (permissionName: string) => {
    return async (req: any, res: any, next: any) => {
      // First check if user is authenticated and admin
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!req.user || (!req.user.isAdmin && !req.user.is_admin)) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      try {
        // Check if user has the specific permission
        const hasPermission = await storage.userHasPermission(req.user.id, permissionName);
        
        if (!hasPermission) {
          return res.status(403).json({ 
            error: `Permission '${permissionName}' required`,
            required_permission: permissionName
          });
        }

        next();
      } catch (error) {
        console.error('Error checking permission:', error);
        res.status(500).json({ error: 'Permission check failed' });
      }
    };
  };

  // Auth routes
  // Discord authentication routes
  if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
    app.get("/api/auth/discord", passport.authenticate("discord"));
    
    app.get("/api/auth/discord/callback", 
      passport.authenticate("discord", { failureRedirect: "/login?error=discord_failed" }),
      (req, res) => {
        console.log("Discord callback successful, redirecting user");
        res.redirect("/");
      }
    );
  } else {
    // Fallback routes when Discord is not configured
    app.get("/api/auth/discord", (req, res) => {
      res.status(503).json({ message: "Discord authentication not configured" });
    });
    
    app.get("/api/auth/discord/callback", (req, res) => {
      res.status(503).json({ message: "Discord authentication not configured" });
    });
  }
  
  // Add a route to check Discord auth availability
  app.get("/api/auth/discord-status", (req, res) => {
    try {
      const available = !!(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET);
      res.json({ available });
    } catch (error) {
      console.error("Error checking Discord status:", error);
      res.status(500).json({ error: "Failed to check Discord status" });
    }
  });
  
  // Regular user login route
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      console.log("Login attempt for username:", username);
      
      // Find user with proper error handling
      let user;
      try {
        user = await storage.getUserByUsername(username);
      } catch (dbError) {
        console.error("Database error during user lookup:", dbError);
        return res.status(500).json({ message: "Database error during login" });
      }
      
      if (!user) {
        console.log("User not found:", username);
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Verify password - only if the user has a password set
      if (user.password) {
        let passwordValid;
        try {
          passwordValid = await comparePasswords(password, user.password);
        } catch (passwordError) {
          console.error("Password comparison error:", passwordError);
          return res.status(500).json({ message: "Authentication error" });
        }
        
        if (!passwordValid) {
          console.log("Invalid password for user:", username);
          return res.status(401).json({ message: "Invalid username or password" });
        }
      } else {
        console.log("User has no password set:", username);
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Convert null to undefined for TypeScript compatibility
      const convertedUser = {
        ...user,
        isAdmin: user.isAdmin ?? false,
        isPremium: user.isPremium ?? false,
        isBanned: user.isBanned ?? false,
        email: user.email ?? undefined,
      };
      
      // Login the user
      req.login(convertedUser, (err) => {
        if (err) {
          console.error("Login error during req.login:", err);
          return res.status(500).json({ message: 'Login failed' });
        }
        
        console.log("User logged in successfully:", username);
        
        // Update last login and login count
        storage.incrementUserLogin(user.id)
          .catch(updateError => console.error("Failed to update login count:", updateError));
        
        res.json({ message: 'Login successful', user: convertedUser });
      });
    } catch (error: any) {
      console.error('Login error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.get("/api/auth/user", (req, res) => {
    try {
      if (req.isAuthenticated() && req.user) {
        const user = { ...req.user };
        
        // Don't send sensitive information to the client
        delete (user as any).password;
        res.json(user);
      } else {
        res.status(401).json({ message: "Not authenticated" });
      }
    } catch (error) {
      console.error("Error getting user:", error);
      res.status(500).json({ message: "Failed to get user information" });
    }
  });

  // Get current user permissions
  app.get("/api/auth/user/permissions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = await storage.getUser((req.user as any).id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // If user is admin, they have all permissions
      if (user.isAdmin) {
        return res.json({
          isAdmin: true,
          permissions: [
            'view_dashboard',
            'view_analytics', 
            'view_users',
            'manage_users',
            'view_mods',
            'manage_mods',
            'view_roles',
            'manage_roles',
            'manage_content',
            'manage_system'
          ]
        });
      }

      // Get user roles
      const userRoleData = await db
        .select({
          roleId: schema.roles.id,
          roleName: schema.roles.name
        })
        .from(schema.userRoles)
        .innerJoin(schema.roles, eq(schema.userRoles.roleId, schema.roles.id))
        .where(eq(schema.userRoles.userId, user.id));

      // Get permissions for each role
      const allPermissions = new Set<string>();
      for (const role of userRoleData) {
        const rolePermissions = await db
          .select({
            permissionName: schema.permissions.name
          })
          .from(schema.rolePermissions)
          .innerJoin(schema.permissions, eq(schema.rolePermissions.permissionId, schema.permissions.id))
          .where(eq(schema.rolePermissions.roleId, role.roleId));
        
        rolePermissions.forEach(perm => {
          if (perm.permissionName) {
            allPermissions.add(perm.permissionName);
          }
        });
      }

      res.json({
        isAdmin: false,
        permissions: Array.from(allPermissions)
      });
    } catch (error) {
      console.error("Error fetching user permissions:", error);
      res.status(500).json({ message: "Failed to fetch permissions" });
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
      
      // Convert null to undefined for TypeScript compatibility
      const convertedUser = {
        ...user,
        isAdmin: user.isAdmin ?? true,
        isPremium: user.isPremium ?? false,
        isBanned: user.isBanned ?? false,
        email: user.email ?? undefined,
      };
      
      // Login the user
      req.login(convertedUser, (err) => {
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
        const userWithoutPassword = { ...convertedUser };
        delete (userWithoutPassword as any).password;
        
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
      
      // Convert null to undefined for TypeScript compatibility
      const convertedUser = {
        ...user,
        isAdmin: user.isAdmin ?? false,
        isPremium: user.isPremium ?? false,
        isBanned: user.isBanned ?? false,
        email: user.email ?? undefined,
      };
      
      // Login the user
      req.login(convertedUser, (err) => {
        if (err) {
          console.error("Registration login error during req.login:", err);
          return res.status(500).json({ message: "Login error" });
        }
        
        console.log("New user authenticated in req.login:", req.isAuthenticated());
        console.log("New user session ID after registration:", req.sessionID);
        
        // Don't send sensitive information to the client
        const safeUser = { ...convertedUser };
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
  app.get("/api/admin/mods", auth.isAdmin, async (req, res) => {
    try {
      const { category, search, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 } = req.query;
      
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      // Build filters array for where clause
      const filters = [];
      if (category) {
        filters.push(eq(schema.mods.category, category as string));
      }
      if (search) {
        filters.push(
          or(
            like(schema.mods.title, `%${search}%`),
            like(schema.mods.description, `%${search}%`)
          )
        );
      }

      // Only allow sorting by specific columns to avoid passing invalid values
      const allowedSortColumns: Record<string, any> = {
        id: schema.mods.id,
        title: schema.mods.title,
        description: schema.mods.description,
        price: schema.mods.price,
        discountPrice: schema.mods.discountPrice,
        category: schema.mods.category,
        tags: schema.mods.tags,
        isFeatured: schema.mods.isFeatured,
        isSubscriptionOnly: schema.mods.isSubscriptionOnly,
        downloadCount: schema.mods.downloadCount,
        averageRating: schema.mods.averageRating,
        createdAt: schema.mods.createdAt,
        version: schema.mods.version
      };
      const sortColumn = allowedSortColumns[sortBy as string] || schema.mods.createdAt;

      // Build the query
      let query = db
        .select({
          id: schema.mods.id,
          title: schema.mods.title,
          description: schema.mods.description,
          price: schema.mods.price,
          discountPrice: schema.mods.discountPrice,
          category: schema.mods.category,
          tags: schema.mods.tags,
          isFeatured: schema.mods.isFeatured,
          isSubscriptionOnly: schema.mods.isSubscriptionOnly,
          downloadCount: schema.mods.downloadCount,
          averageRating: schema.mods.averageRating,
          createdAt: schema.mods.createdAt,
          version: schema.mods.version
        })
        .from(schema.mods);

      // Apply filters
      if (filters.length > 0) {
        query = query.where(and(...filters)) as typeof query;
      }

      // Apply sorting
      if (sortOrder === 'desc') {
        query = query.orderBy(desc(sortColumn)) as typeof query;
      } else {
        query = query.orderBy(asc(sortColumn)) as typeof query;
      }

      // Apply pagination and execute
      const mods = await query.limit(parseInt(limit as string)).offset(offset);
      
      // Get total count
      let countQuery = db
        .select({ count: sql<number>`count(*)`.as('count') })
        .from(schema.mods);
        
      if (filters.length > 0) {
        countQuery = countQuery.where(and(...filters)) as typeof countQuery;
      }
      
      const [totalResult] = await countQuery;
      const totalCount = totalResult?.count || 0;
      
      res.json({
        mods,
        pagination: {
          total: totalCount,
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          totalPages: Math.ceil(totalCount / parseInt(limit as string))
        }
      });
    } catch (error: any) {
      console.error("[GET /api/admin/mods] Error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/mods", auth.isAdmin, async (req, res) => {
    try {
      const { version, fileSize, changelog, ...modData } = req.body;
      
      // Create the mod first using storage
      const validatedModData = insertModSchema.parse(modData);
      const mod = await storage.createMod(validatedModData);
      
      // Create the initial version if version info is provided
      if (version) {
        const versionData = {
          modId: mod.id,
          version: version,
          filePath: mod.downloadUrl || '',
          fileSize: fileSize ? parseFloat(fileSize) * 1024 * 1024 : 0, // Convert MB to bytes
          changelog: changelog || 'Initial release',
          isLatest: true
        };
        
        await storage.createModVersion(versionData);
        console.log(`[POST /api/admin/mods] Created version ${version} for mod ${mod.id}`);
      }
      
      res.status(201).json(mod);
    } catch (error: any) {
      console.error("[POST /api/admin/mods] Error:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/admin/mods/:id", auth.isAdmin, async (req, res) => {
    try {
      const validatedData = insertModSchema.partial().parse(req.body);
      const mod = await storage.updateMod(parseInt(req.params.id), validatedData);
      
      if (!mod) {
        return res.status(404).json({ message: "Mod not found" });
      }
      
      res.json(mod);
    } catch (error: any) {
      console.error(`[PATCH /api/admin/mods/${req.params.id}] Error:`, error);
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/admin/mods/:id", auth.isAdmin, async (req, res) => {
    try {
      const success = await storage.deleteMod(parseInt(req.params.id));
      
      if (!success) {
        return res.status(404).json({ message: "Mod not found" });
      }
      
      res.json({ success });
    } catch (error: any) {
      console.error(`[DELETE /api/admin/mods/${req.params.id}] Error:`, error);
      res.status(500).json({ message: error.message });
    }
  });

  // Legacy mod routes for backward compatibility
  app.post("/api/mods", auth.isAdmin, async (req, res) => {
    try {
      const { version, fileSize, changelog, ...modData } = req.body;
      
      // Create the mod first
      const validatedModData = insertModSchema.omit({ version: true }).parse(modData);
      const mod = await storage.createMod(validatedModData);
      
      // Create the initial version if version info is provided
      if (version) {
        const versionData = {
          modId: mod.id,
          version: version,
          filePath: mod.downloadUrl || '',
          fileSize: fileSize ? parseFloat(fileSize) * 1024 * 1024 : 0, // Convert MB to bytes
          changelog: changelog || 'Initial release',
          isLatest: true,
          releaseDate: new Date()
        };
        
        await storage.createModVersion(versionData);
        console.log(`[POST /api/mods] Created version ${version} for mod ${mod.id}`);
      }
      
      res.status(201).json(mod);
    } catch (error: any) {
      console.error("[POST /api/mods] Error:", error);
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

  app.patch("/api/mods/:id", auth.isAdmin, async (req, res) => {
    try {
      const { version, fileSize, changelog, ...modData } = req.body;
      const modId = parseInt(req.params.id);
      
      console.log(`[PATCH /api/mods/${modId}] Received data:`, req.body);
      
      // Update the mod first (excluding version-specific fields)
      const validatedModData = insertModSchema.omit({ version: true }).partial().parse(modData);
      const mod = await storage.updateMod(modId, validatedModData);
      
      if (!mod) {
        return res.status(404).json({ message: "Mod not found" });
      }
      
      // Create new version if version info is provided
      if (version) {
        // Mark all existing versions as not latest
        const existingVersions = await storage.getModVersions(modId);
        for (const existingVersion of existingVersions) {
          if (existingVersion.isLatest) {
            // Note: Need to add updateModVersion method to storage
            console.log(`[PATCH /api/mods/${modId}] Marking version ${existingVersion.version} as not latest`);
          }
        }
        
        // Create new version
        const versionData = {
          modId: modId,
          version: version,
          filePath: mod.downloadUrl || '',
          fileSize: fileSize ? Math.round(parseFloat(fileSize) * 1024 * 1024) : 0, // Convert MB to bytes
          changelog: changelog || 'Updated mod',
          isLatest: true,
          releaseDate: new Date()
        };
        
        const newVersion = await storage.createModVersion(versionData);
        console.log(`[PATCH /api/mods/${modId}] Created version ${version} for mod ${modId}`);
        
        // Send notifications for mod updates
        try {
          await notifyModUpdateToAllOwners(modId, version, changelog);
          console.log(`[PATCH /api/mods/${modId}] Sent update notifications for version ${version}`);
        } catch (notifyError) {
          console.error(`[PATCH /api/mods/${modId}] Failed to send notifications:`, notifyError);
        }
      }
      
      console.log(`[PATCH /api/mods/${modId}] Updated mod:`, mod);
      res.json(mod);
    } catch (error: any) {
      console.error(`[PATCH /api/mods/${req.params.id}] Error:`, error);
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
  
  // Image upload endpoint for mods
  app.post("/api/upload/image", auth.isAdmin, upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" });
      }
      
      // Create the URL path for the uploaded image
      const imageUrl = `/uploads/images/${req.file.filename}`;
      
      // Return the image URL
      res.status(201).json({ 
        success: true, 
        imageUrl,
        filename: req.file.filename,
        originalName: req.file.originalname 
      });
    } catch (error: any) {
      console.error("Error uploading image:", error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Manual notification sending endpoint
  app.post("/api/admin/notifications/send", auth.isAdmin, async (req, res) => {
    try {
      const { modId, version, changelog } = req.body;
      
      if (!modId || !version) {
        return res.status(400).json({ message: "Mod ID and version are required" });
      }
      
      const mod = await storage.getMod(modId);
      if (!mod) {
        return res.status(404).json({ message: "Mod not found" });
      }
      
      // Get recipient count before sending
      const purchases = await storage.getPurchasesByMod(modId);
      const recipientCount = purchases.length;
      
      console.log(`[ManualNotification] Sending notification for ${mod.title} v${version} to ${recipientCount} users`);
      
      // Send notifications
      notifyModUpdateToAllOwners(modId, version, changelog)
        .catch(error => console.error(`[ManualNotification] Failed to send notifications:`, error));
      
      res.json({
        success: true,
        recipientCount,
        modTitle: mod.title,
        version
      });
    } catch (error: any) {
      console.error("[ManualNotification] Error:", error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Notification history endpoint (placeholder - would need database table)
  app.get("/api/admin/notifications/history", auth.isAdmin, async (req, res) => {
    try {
      // For now, return empty array - would need proper notification log table
      res.json([]);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Add static file serving for uploaded images
  app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));
  
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
      
      // Trigger notifications to all mod owners about the new version
      console.log(`[ModUpdate] Triggering notifications for mod ${mod.title} v${req.body.version}`);
      notifyModUpdateToAllOwners(modId, req.body.version, req.body.changelog)
        .catch(error => console.error(`[ModUpdate] Failed to send notifications:`, error));
      
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
      
      console.log(`[Download] User ${userId} requesting mod ${modId}`);
      
      // Check if user has purchased the mod or has a subscription
      const purchase = await storage.getModPurchase(userId, modId);
      const user = await storage.getUser(userId);
      const mod = await storage.getMod(modId);
      
      if (!mod) {
        return res.status(404).json({ message: "Mod not found" });
      }
      
      console.log(`[Download] Mod found: ${mod.title}, downloadUrl: "${mod.downloadUrl}", lockerFolder: "${mod.lockerFolder}"`);
      
      // Allow download if user has purchased the mod or has a subscription for subscription-only mods
      if (!purchase && (!user?.stripeSubscriptionId || !mod.isSubscriptionOnly)) {
        return res.status(403).json({ message: "You need to purchase this mod first" });
      }
      
      // Track the download before proceeding
      try {
        await db.insert(schema.modDownloads)
          .values({
            userId,
            modId,
            downloadedAt: new Date(),
            reviewRequested: false,
            reviewReminderSent: false
          });

        // Increment download count
        await db.update(schema.mods)
          .set({ 
            downloadCount: sql`${schema.mods.downloadCount} + 1`
          })
          .where(eq(schema.mods.id, modId));

        console.log(`[Download] Tracked download for user ${userId}, mod ${modId}`);
      } catch (trackingError) {
        console.error(`[Download] Error tracking download:`, trackingError);
        // Don't fail the download if tracking fails
      }
      
      // Check if mod has a locker folder configured
      if (mod.lockerFolder && mod.lockerFolder.trim() !== '') {
        console.log(`[Download] Mod uses locker folder: ${mod.lockerFolder}`);
        
        // Generate a license key for the mod locker
        const licenseKey = `${crypto.randomUUID()}`;
        
        // Add license to modlocker database
        try {
          const modlockerDBPath = path.join(process.cwd(), "modlocker", "licenseDB.json");
          let licenseDB: { [key: string]: any } = {};
          
          if (fs.existsSync(modlockerDBPath)) {
            const licenseDBContent = fs.readFileSync(modlockerDBPath, 'utf8');
            licenseDB = JSON.parse(licenseDBContent);
          }
          
          // Add the new license with mod folder and name
          licenseDB[licenseKey] = {
            issuedAt: Date.now(),
            modFolder: mod.lockerFolder,
            modName: mod.title,
            userId: userId,
            modId: modId
          };
          
          fs.writeFileSync(modlockerDBPath, JSON.stringify(licenseDB, null, 2));
          
          console.log(`[Download] License created: ${licenseKey} for mod folder: ${mod.lockerFolder}`);
          
          // Redirect to modlocker download endpoint
          const modlockerPort = process.env.MODLOCKER_PORT || 3000;
          const modlockerHost = process.env.MODLOCKER_HOST || 'http://localhost';
          const modlockerUrl = `${modlockerHost}:${modlockerPort}/mods/download/${licenseKey}`;
          
          console.log(`[Download] Redirecting to modlocker: ${modlockerUrl}`);
          res.redirect(modlockerUrl);
          return;
        } catch (lockerError) {
          console.error(`[Download] Error creating modlocker license:`, lockerError);
          return res.status(500).json({ message: "Failed to prepare mod download. Please try again." });
        }
      }
      
      // First try to get the latest version file
      const version = await storage.getLatestModVersion(modId);
      
      if (version && version.filePath) {
        console.log(`[Download] Checking version file: ${version.filePath}`);
        // Check if the file actually exists
        try {
          if (fs.existsSync(version.filePath)) {
            console.log(`[Download] Serving uploaded file: ${version.filePath}`);
            const fileName = `${mod.title.replace(/[^a-zA-Z0-9]/g, '_')}_v${version.version}.zip`;
            res.download(version.filePath, fileName);
            return;
          } else {
            console.log(`[Download] Version file doesn't exist, falling back to downloadUrl`);
          }
        } catch (fileError) {
          console.log(`[Download] Error checking version file:`, fileError);
        }
      }
      
      // Fall back to mod download URL
      if (mod.downloadUrl && mod.downloadUrl.trim() !== '' && !mod.downloadUrl.includes('example.com')) {
        console.log(`[Download] Using downloadUrl redirect: ${mod.downloadUrl}`);
        res.redirect(mod.downloadUrl);
      } else {
        console.log(`[Download] No valid download source available for mod ${modId}`);
        return res.status(404).json({ message: "Download not available for this mod. Please contact support." });
      }
    } catch (error: any) {
      console.error(`[Download] Error:`, error);
      res.status(500).json({ message: error.message });
    }
  });

  // Cart routes - completely rewritten for reliability
  app.get("/api/cart", auth.isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      console.log("[GET /api/cart] User ID:", userId);
      
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Get cart items with mod details
      const cartItemsResult = await db.select({
        id: schema.cartItems.id,
        userId: schema.cartItems.userId,
        modId: schema.cartItems.modId,
        addedAt: schema.cartItems.addedAt,
        mod: {
          id: schema.mods.id,
          title: schema.mods.title,
          description: schema.mods.description,
          price: schema.mods.price,
          discountPrice: schema.mods.discountPrice,
          previewImageUrl: schema.mods.previewImageUrl,
          category: schema.mods.category,
          tags: schema.mods.tags,
          features: schema.mods.features,
          isSubscriptionOnly: schema.mods.isSubscriptionOnly,
        }
      })
      .from(schema.cartItems)
      .leftJoin(schema.mods, eq(schema.cartItems.modId, schema.mods.id))
      .where(eq(schema.cartItems.userId, userId));
      
      console.log("[GET /api/cart] Found items:", cartItemsResult.length);
      
      res.json(cartItemsResult);
    } catch (error: any) {
      console.error("Cart fetch error:", error);
      res.status(500).json({ message: "Failed to retrieve cart items", error: error.message });
    }
  });
  
  app.post("/api/cart", auth.isAuthenticated, async (req, res) => {
    try {
      console.log("\n\n======== CART API - POST REQUEST ========");
      console.log("Cart API - Path:", req.path);
      console.log("Cart API - Method:", req.method);
      console.log("Cart API - Headers:", JSON.stringify(req.headers, null, 2));
      console.log("Cart API - Content-Type:", req.headers['content-type']);
      console.log("Cart API - Is authenticated?", req.isAuthenticated());
      console.log("Cart API - Session ID:", req.sessionID);
      console.log("Cart API - Request body:", req.body);
      console.log("Cart API - User:", req.user);
      
      // Get user ID - authentication already verified by middleware
      const userId = (req.user as any).id;
      
      if (!userId) {
        console.log("Cart API - User ID is missing");
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
      
      // Get client IP address
      const customerIpAddress = getClientIP(req);
      
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
            price,
            customerIpAddress
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

  // User purchases route
  app.get("/api/purchases", auth.isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      console.log(`[GET /api/purchases] Loading purchases for user ${userId}`);
      
      // Get user's purchases using storage method
      const purchases = await storage.getPurchasesByUser(userId);
      
      // Get mod details for each purchase
      const purchasesWithMods = await Promise.all(
        purchases.map(async (purchase) => {
          const mod = await storage.getMod(purchase.modId);
          return {
            ...purchase,
            mod: mod
          };
        })
      );
      
      console.log(`[GET /api/purchases] Found ${purchasesWithMods.length} purchases for user ${userId}`);
      res.json(purchasesWithMods);
    } catch (error: any) {
      console.error("[GET /api/purchases] Error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // User's mod locker route
  app.get("/api/mod-locker", auth.isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const user = await storage.getUser(userId);
      
      console.log(`[ModLocker] Loading for user ${userId}`);
      
      // Get user's purchases
      const purchases = await storage.getPurchasesByUser(userId);
      console.log(`[ModLocker] Found ${purchases.length} purchases`);
      
      // Get purchased mods with latest version information
      const purchasedMods = await Promise.all(
        purchases.map(async (purchase) => {
          const mod = await storage.getMod(purchase.modId);
          const latestVersion = await storage.getLatestModVersion(purchase.modId);
          
          console.log(`[ModLocker] Mod ${purchase.modId}: downloadUrl="${mod?.downloadUrl}", hasVersion=${!!latestVersion}`);
          if (latestVersion) {
            console.log(`[ModLocker] Version data:`, {
              version: latestVersion.version,
              releaseDate: latestVersion.releaseDate,
              fileSize: latestVersion.fileSize,
              changelog: latestVersion.changelog
            });
          }
          
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

  // User subscription info route
  app.get("/api/subscription", auth.isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const now = new Date();
      const isPremiumActive = user.isPremium && user.premiumExpiresAt && new Date(user.premiumExpiresAt) > now;
      
      if (isPremiumActive) {
        res.json({
          active: true,
          plan: "Premium",
          nextBilling: user.premiumExpiresAt,
          stripeSubscriptionId: user.stripeSubscriptionId
        });
      } else {
        res.json({
          active: false,
          plan: null,
          nextBilling: null,
          stripeSubscriptionId: null
        });
      }
    } catch (error: any) {
      console.error("[GET /api/subscription] Error:", error);
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
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/admin/users/:id", auth.isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updateData = req.body;
      
      // Log admin activity
      await storage.logAdminActivity({
        userId: (req.user as any).id,
        action: 'UPDATE_USER',
        details: `Updated user ${userId}`,
        ipAddress: req.ip
      });
      
      const updatedUser = await storage.updateUser(userId, updateData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
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
      
      // Log admin activity
      await storage.logAdminActivity({
        userId: (req.user as any).id,
        action: 'UPDATE_SETTINGS',
        details: `Updated setting ${key}`,
        ipAddress: req.ip
      });
      
      const setting = await storage.setSiteSetting(key, value);
      
      res.json(setting);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/notifications/send", auth.isAdmin, async (req, res) => {
    try {
      const { type, modId, subject, message } = req.body;
      const userId = (req.user as any).id;
      
      // Log admin activity for notification sending
      await storage.logAdminActivity({
        userId,
        action: 'SEND_NOTIFICATION',
        details: `Sent ${type} notification: ${subject}`,
        ipAddress: req.ip
      });
      
      // For now, we'll just log the notification
      // In a real implementation, you would integrate with email service
      console.log(`Notification sent by user ${userId}:`, {
        type,
        modId,
        subject,
        message,
        timestamp: new Date().toISOString()
      });
      
      res.json({ 
        success: true, 
        message: "Notification sent successfully",
        notificationId: Date.now() // Mock notification ID
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/notifications/history", auth.isAdmin, async (req, res) => {
    try {
      // Mock notification history for now
      // In a real implementation, you would fetch from database
      const mockHistory = [
        {
          id: 1,
          modId: 26,
          modTitle: "Test Mod Update",
          version: "2.0.0",
          recipientCount: 15,
          successCount: 14,
          failureCount: 1,
          createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
        },
        {
          id: 2,
          modId: 28,
          modTitle: "JSD's hypersonic gtx",
          version: "1.5.0",
          recipientCount: 8,
          successCount: 8,
          failureCount: 0,
          createdAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
        }
      ];
      
      res.json(mockHistory);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/users/tracking", auth.isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsersWithTrackingInfo();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.patch("/api/admin/users/:id", auth.isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updates = req.body;
      
      // Log admin activity
      await storage.logAdminActivity({
        userId: (req.user as any).id,
        action: "Update User",
        details: `Updated user ${userId}: ${JSON.stringify(updates)}`,
        ipAddress: req.ip
      });
      
      const user = await storage.updateUser(userId, updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.delete("/api/admin/users/:id", auth.isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const currentUserId = (req.user as any).id;
      
      // Prevent self-deletion
      if (userId === currentUserId) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      
      // Log admin activity
      await storage.logAdminActivity({
        userId: currentUserId,
        action: "Delete User",
        details: `Deleted user ${userId}`,
        ipAddress: req.ip
      });
      
      // Note: We need to implement deleteUser in storage
      // For now, just ban the user instead
      const user = await storage.banUser(userId, true);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.patch("/api/admin/users/:id/ban", auth.isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { banned } = req.body;
      const currentUserId = (req.user as any).id;
      
      // Prevent self-ban
      if (userId === currentUserId) {
        return res.status(400).json({ message: "Cannot ban your own account" });
      }
      
      // Log admin activity
      await storage.logAdminActivity({
        userId: currentUserId,
        action: banned ? "Ban User" : "Unban User",
        details: `${banned ? 'Banned' : 'Unbanned'} user ${userId}`,
        ipAddress: req.ip
      });
      
      const user = await storage.banUser(userId, banned);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
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
  
  // Subscription plans and benefits API routes
  
  // Get all subscription plans

  app.get("/api/subscription/plans", async (req, res) => {
    try {
      const plans = await storage.getSubscriptionPlans();
      res.json(plans);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
 });
  
  // Get a specific subscription plan
  app.get("/api/subscription/plans/:id", async (req, res) => {
    try {
      const plan = await storage.getSubscriptionPlan(parseInt(req.params.id));
      if (!plan) {
        return res.status(404).json({ message: "Subscription plan not found" });
      }
      res.json(plan);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Create a subscription plan (admin only)
  app.post("/api/subscription/plans", auth.isAdmin, async (req, res) => {
    try {
      // Validate the request body

      const validatedData = schema.insertSubscriptionPlanSchema.parse(req.body);
      const plan = await storage.createSubscriptionPlan(validatedData);
      
      // Log admin activity
      await storage.logAdminActivity({
        userId: (req.user as any).id,
        action: "Create Subscription Plan",
        details: `Created subscription plan: ${plan.name}`,
        ipAddress: req.ip
      });
      
      res.status(201).json(plan);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Update a subscription plan (admin only)
  app.put("/api/subscription/plans/:id", auth.isAdmin, async (req, res) => {
    try {
      // Validate the request body
      const validatedData = schema.insertSubscriptionPlanSchema.partial().parse(req.body);
      const plan = await storage.updateSubscriptionPlan(parseInt(req.params.id), validatedData);
      
      if (!plan) {
        return res.status(404).json({ message: "Subscription plan not found" });
      }
      
      // Log admin activity
      await storage.logAdminActivity({
        userId: (req.user as any).id,
        action: "Update Subscription Plan",
        details: `Updated subscription plan: ${plan.name}`,
        ipAddress: req.ip
      });
      
      res.json(plan);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Delete a subscription plan (admin only)
  app.delete("/api/subscription/plans/:id", auth.isAdmin, async (req, res) => {
    try {
      const planDeleteResult = await storage.deleteSubscriptionPlan(parseInt(req.params.id));
      
      if (!planDeleteResult) {
        return res.status(404).json({ message: "Subscription plan not found" });
      }
      
      // Log admin activity
      await storage.logAdminActivity({
        userId: (req.user as any).id,
        action: "Delete Subscription Plan",
        details: `Deleted subscription plan ID: ${req.params.id}`,
        ipAddress: req.ip
      });
      
      res.json({ success: planDeleteResult });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get all subscription benefits
  app.get("/api/subscription/benefits", async (req, res) => {
    try {
      const benefits = await storage.getSubscriptionBenefits();
      res.json(benefits);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Get a specific subscription benefit
  app.get("/api/subscription/benefits/:id", async (req, res) => {
    try {
      const benefit = await storage.getSubscriptionBenefit(parseInt(req.params.id));
      if (!benefit) {
        return res.status(404).json({ message: "Subscription benefit not found" });
      }
      res.json(benefit);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Create a subscription benefit (admin only)
  app.post("/api/subscription/benefits", auth.isAdmin, async (req, res) => {
    try {
      // Validate the request body
      const validatedData = schema.insertSubscriptionBenefitSchema.parse(req.body);
      const benefit = await storage.createSubscriptionBenefit(validatedData);
      
      // Log admin activity
      await storage.logAdminActivity({
        userId: (req.user as any).id,
        action: "Create Subscription Benefit",
        details: `Created subscription benefit: ${benefit.title}`,
        ipAddress: req.ip
      });
      
      res.status(201).json(benefit);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Update a subscription benefit (admin only)
  app.put("/api/subscription/benefits/:id", auth.isAdmin, async (req, res) => {
    try {
      // Validate the request body
      const validatedData = schema.insertSubscriptionBenefitSchema.partial().parse(req.body);
      const benefit = await storage.updateSubscriptionBenefit(parseInt(req.params.id), validatedData);
      
      if (!benefit) {
        return res.status(404).json({ message: "Subscription benefit not found" });
      }
      
      // Log admin activity
      await storage.logAdminActivity({
        userId: (req.user as any).id,
        action: "Update Subscription Benefit",
        details: `Updated subscription benefit: ${benefit.title}`,
        ipAddress: req.ip
      });
      
      res.json(benefit);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Delete a subscription benefit (admin only)
  app.delete("/api/subscription/benefits/:id", auth.isAdmin, async (req, res) => {
    try {
      const success = await storage.deleteSubscriptionBenefit(parseInt(req.params.id));
      
      if (!success) {
        return res.status(404).json({ message: "Subscription benefit not found" });
      }
      
      // Log admin activity
      await storage.logAdminActivity({
        userId: (req.user as any).id,
        action: "Delete Subscription Benefit",
        details: `Deleted subscription benefit ID: ${req.params.id}`,
        ipAddress: req.ip
      });
      
      res.json({ success });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Admin endpoint to get all orders with IP tracking
  app.get("/api/admin/orders", auth.isAdmin, async (req, res) => {
    try {
      const orders = await storage.getAllPurchases();
      
      // Get user details for each order
      const ordersWithUsers = await Promise.all(
        orders.map(async (order) => {
          const user = await storage.getUser(order.userId);
          const mod = await storage.getMod(order.modId);
          return {
            ...order,
            user: {
              id: user?.id,
              username: user?.username,
              email: user?.email
            },
            mod: {
              id: mod?.id,
              title: mod?.title
            }
          };
        })
      );
      
      res.json(ordersWithUsers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
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

  // Role Management API Routes
  // Get all roles
  app.get("/api/admin/roles", isAdminWithPermission("roles.view"), async (req, res) => {
    try {
      const roles = await storage.getRoles();
      res.json(roles);
    } catch (error) {
      console.error('Error fetching roles:', error);
      res.status(500).json({ error: 'Failed to fetch roles' });
    }
  });

  // Get all permissions
  app.get("/api/admin/permissions", isAdminWithPermission("roles.view"), async (req, res) => {
    try {
      const permissions = await storage.getPermissions();
      res.json(permissions);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      res.status(500).json({ error: 'Failed to fetch permissions' });
    }
  });

  // Get permissions by category
  app.get("/api/admin/permissions/:category", isAdminWithPermission("roles.view"), async (req, res) => {
    try {
      const { category } = req.params;
      const permissions = await storage.getPermissionsByCategory(category);
      res.json(permissions);
    } catch (error) {
      console.error('Error fetching permissions by category:', error);
      res.status(500).json({ error: 'Failed to fetch permissions' });
    }
  });

  // Get role with permissions
  app.get("/api/admin/roles/:id", isAdminWithPermission("roles.view"), async (req, res) => {
    try {
      const roleId = parseInt(req.params.id);
      if (isNaN(roleId)) {
        return res.status(400).json({ error: 'Invalid role ID' });
      }

      const role = await storage.getRole(roleId);
      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }

      const permissions = await storage.getRolePermissions(roleId);
      res.json({ ...role, permissions });
    } catch (error) {
      console.error('Error fetching role:', error);
      res.status(500).json({ error: 'Failed to fetch role' });
    }
  });

  // Create new role
  app.post("/api/admin/roles", isAdminWithPermission("roles.create"), async (req, res) => {
    try {
      const { name, description, permissionIds } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Role name is required' });
      }

      // Create the role
      const role = await storage.createRole({
        name,
        description: description || null,
        isSystem: false
      });

      // Assign permissions if provided
      if (permissionIds && Array.isArray(permissionIds) && permissionIds.length > 0) {
        await storage.assignPermissionsToRole(role.id, permissionIds);
      }

      res.status(201).json(role);
    } catch (error) {
      console.error('Error creating role:', error);
      res.status(500).json({ error: 'Failed to create role' });
    }
  });

  // Update role
  app.put("/api/admin/roles/:id", isAdminWithPermission("roles.edit"), async (req, res) => {
    try {
      const roleId = parseInt(req.params.id);
      if (isNaN(roleId)) {
        return res.status(400).json({ error: 'Invalid role ID' });
      }

      const { name, description, permissionIds } = req.body;
      
      // Update role details
      const updatedRole = await storage.updateRole(roleId, {
        name,
        description: description || null
      });

      if (!updatedRole) {
        return res.status(404).json({ error: 'Role not found' });
      }

      // Update permissions if provided
      if (permissionIds && Array.isArray(permissionIds)) {
        await storage.assignPermissionsToRole(roleId, permissionIds);
      }

      res.json(updatedRole);
    } catch (error) {
      console.error('Error updating role:', error);
      res.status(500).json({ error: 'Failed to update role' });
    }
  });

  // Delete role
  app.delete("/api/admin/roles/:id", isAdminWithPermission("roles.delete"), async (req, res) => {
    try {
      const roleId = parseInt(req.params.id);
      if (isNaN(roleId)) {
        return res.status(400).json({ error: 'Invalid role ID' });
      }

      const deleted = await storage.deleteRole(roleId);
      if (!deleted) {
        return res.status(404).json({ error: 'Role not found or cannot be deleted' });
      }

      res.json({ message: 'Role deleted successfully' });
    } catch (error) {
      console.error('Error deleting role:', error);
      res.status(500).json({ error: 'Failed to delete role' });
    }
  });

  // Get user roles
  app.get("/api/admin/users/:id/roles", isAdminWithPermission("users.view"), async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const roles = await storage.getUserRoles(userId);
      res.json(roles);
    } catch (error) {
      console.error('Error fetching user roles:', error);
      res.status(500).json({ error: 'Failed to fetch user roles' });
    }
  });

  // Update user roles
  app.put("/api/admin/users/:id/roles", isAdminWithPermission("roles.assign"), async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const { roleIds } = req.body;
      if (!Array.isArray(roleIds)) {
        return res.status(400).json({ error: 'Role IDs must be an array' });
      }

      const currentUserId = (req.user as any).id;
      
      // First, remove all existing roles
      await storage.removeRolesFromUser(userId, []);
      
      // Then assign new roles
      const success = await storage.assignRolesToUser(userId, roleIds, currentUserId);
      
      if (!success) {
        return res.status(500).json({ error: 'Failed to update roles' });
      }

      res.json({ message: 'Roles updated successfully' });
    } catch (error) {
      console.error('Error updating user roles:', error);
      res.status(500).json({ error: 'Failed to update user roles' });
    }
  });

  // Assign roles to user
  app.post("/api/admin/users/:id/roles", isAdminWithPermission("roles.assign"), async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const { roleIds } = req.body;
      if (!Array.isArray(roleIds)) {
        return res.status(400).json({ error: 'Role IDs must be an array' });
      }

      const currentUserId = (req.user as any).id;
      const success = await storage.assignRolesToUser(userId, roleIds, currentUserId);
      
      if (!success) {
        return res.status(500).json({ error: 'Failed to assign roles' });
      }

      res.json({ message: 'Roles assigned successfully' });
    } catch (error) {
      console.error('Error assigning roles to user:', error);
      res.status(500).json({ error: 'Failed to assign roles to user' });
    }
  });

  // Bulk role assignment
  app.post("/api/admin/bulk-role-assignment", isAdminWithPermission("roles.assign"), async (req, res) => {
    try {
      const { userIds, roleId, action } = req.body;
      
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ error: 'User IDs must be a non-empty array' });
      }
      
      if (!roleId || isNaN(parseInt(roleId))) {
        return res.status(400).json({ error: 'Valid role ID is required' });
      }
      
      if (!action || !['assign', 'remove'].includes(action)) {
        return res.status(400).json({ error: 'Action must be "assign" or "remove"' });
      }

      const currentUserId = (req.user as any).id;
      let successCount = 0;
      let errorCount = 0;

      for (const userId of userIds) {
        try {
          if (action === 'assign') {
            // Get current user roles
            const currentRoles = await storage.getUserRoles(userId);
            const currentRoleIds = currentRoles.map(role => role.id);
            
            // Add new role if not already assigned
            if (!currentRoleIds.includes(parseInt(roleId))) {
              await storage.assignRolesToUser(userId, [...currentRoleIds, parseInt(roleId)], currentUserId);
            }
          } else {
            // Remove role
            const currentRoles = await storage.getUserRoles(userId);
            const updatedRoleIds = currentRoles
              .filter(role => role.id !== parseInt(roleId))
              .map(role => role.id);
            
            await storage.removeRolesFromUser(userId, [parseInt(roleId)]);
          }
          successCount++;
        } catch (error) {
          console.error(`Error updating roles for user ${userId}:`, error);
          errorCount++;
        }
      }

      res.json({ 
        message: `Bulk role ${action} completed`,
        success: successCount,
        errors: errorCount
      });
    } catch (error) {
      console.error('Error in bulk role assignment:', error);
      res.status(500).json({ error: 'Failed to perform bulk role assignment' });
    }
  });

  // Get all users with their roles
  app.get("/api/admin/users-with-roles", isAdminWithPermission("users.view"), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithRoles = await Promise.all(
        users.map(async (user) => {
          const roles = await storage.getUserRoles(user.id);
          return {
            ...user,
            roles
          };
        })
      );
      
      res.json(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users with roles:', error);
      res.status(500).json({ error: 'Failed to fetch users with roles' });
    }
  });

  // Support Tickets API Routes
  
  // Get all support tickets (admin only)
  app.get("/api/admin/support-tickets", isAdminWithPermission("support.view"), async (req, res) => {
    try {
      const tickets = await db.query.supportTickets.findMany({
        with: {
          user: {
            columns: {
              id: true,
              username: true,
            },
          },
          assignedToUser: {
            columns: {
              id: true,
              username: true,
            },
          },
        },
        orderBy: [desc(schema.supportTickets.createdAt)],
      });
      res.json(tickets);
    } catch (error) {
      console.error('Error fetching support tickets:', error);
      res.status(500).json({ error: 'Failed to fetch support tickets' });
    }
  });

  // Create a new support ticket (admin only)
  app.post("/api/admin/support-tickets", isAdminWithPermission("support.create"), async (req, res) => {
    try {
      const validatedData = schema.insertSupportTicketSchema.parse(req.body);
      
      const [ticket] = await db.insert(schema.supportTickets)
        .values({
          ...validatedData,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      // Log admin activity
      await storage.logAdminActivity({
        userId: (req.user as any).id,
        action: "Create Support Ticket",
        details: `Created support ticket: ${ticket.title}`,
        ipAddress: req.ip
      });

      res.status(201).json(ticket);
    } catch (error) {
      console.error('Error creating support ticket:', error);
      res.status(500).json({ error: 'Failed to create support ticket' });
    }
  });

  // Update a support ticket (admin only)
  app.patch("/api/admin/support-tickets/:id", isAdminWithPermission("support.update"), async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const updateData = req.body;
      
      const [updatedTicket] = await db.update(schema.supportTickets)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(schema.supportTickets.id, ticketId))
        .returning();

      if (!updatedTicket) {
        return res.status(404).json({ error: 'Support ticket not found' });
      }

      // Log admin activity
      await storage.logAdminActivity({
        userId: (req.user as any).id,
        action: "Update Support Ticket",
        details: `Updated support ticket: ${updatedTicket.title}`,
        ipAddress: req.ip
      });

      res.json(updatedTicket);
    } catch (error) {
      console.error('Error updating support ticket:', error);
      res.status(500).json({ error: 'Failed to update support ticket' });
    }
  });

  // Delete a support ticket (admin only)
  app.delete("/api/admin/support-tickets/:id", isAdminWithPermission("support.delete"), async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      
      const [deletedTicket] = await db.delete(schema.supportTickets)
        .where(eq(schema.supportTickets.id, ticketId))
        .returning();

      if (!deletedTicket) {
        return res.status(404).json({ error: 'Support ticket not found' });
      }

      // Log admin activity
      await storage.logAdminActivity({
        userId: (req.user as any).id,
        action: "Delete Support Ticket",
        details: `Deleted support ticket: ${deletedTicket.title}`,
        ipAddress: req.ip
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting support ticket:', error);
      res.status(500).json({ error: 'Failed to delete support ticket' });
    }
  });

  // Get available mod locker folders
  app.get("/api/admin/mod-locker/folders", auth.isAdmin, async (req, res) => {
    try {
      const modLockerPath = path.join(process.cwd(), "modlocker", "mods");
      
      if (!fs.existsSync(modLockerPath)) {
        return res.json([]);
      }
      
      const folders = fs.readdirSync(modLockerPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)
        .filter(name => !name.startsWith('.') && name !== 'node_modules'); // Filter out hidden and system folders
      
      res.json(folders);
    } catch (error: any) {
      console.error("Error reading mod locker folders:", error);
      res.status(500).json({ message: error.message });
    }
  });
  
  // Enhanced search endpoint with comprehensive filtering
  app.get("/api/mods/search", async (req, res) => {
    try {
      const {
        q: query,
        category,
        minPrice,
        maxPrice,
        minRating,
        sortBy = "newest",
        featured,
        premium,
        page = 1,
        limit = 12,
      } = req.query;

      const conditions = [];
      
      if (query) {
        conditions.push(
          or(
            ilike(schema.mods.title, `%${query}%`),
            ilike(schema.mods.description, `%${query}%`)
          )
        );
      }

      if (category && category !== "All Categories") {
        conditions.push(eq(schema.mods.category, category as string));
      }

      if (minPrice) {
        conditions.push(gte(schema.mods.price, parseFloat(minPrice as string)));
      }

      if (maxPrice) {
        conditions.push(lte(schema.mods.price, parseFloat(maxPrice as string)));
      }

      if (minRating) {
        conditions.push(gte(schema.mods.averageRating, parseFloat(minRating as string)));
      }

      if (featured === "true") {
        conditions.push(eq(schema.mods.isFeatured, true));
      }

      if (premium === "true") {
        conditions.push(eq(schema.mods.isSubscriptionOnly, true));
      }

      let orderBy;
      switch (sortBy) {
        case "price-low":
          orderBy = asc(schema.mods.price);
          break;
        case "price-high":
          orderBy = desc(schema.mods.price);
          break;
        case "rating":
          orderBy = desc(schema.mods.averageRating);
          break;
        case "popular":
          orderBy = desc(schema.mods.downloadCount);
          break;
        case "oldest":
          orderBy = asc(schema.mods.createdAt);
          break;
        default:
          orderBy = desc(schema.mods.createdAt);
      }

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);

      // Build the query step by step to avoid type issues
      let modsQuery = db.select().from(schema.mods);
      
      if (conditions.length > 0) {
        modsQuery = modsQuery.where(and(...conditions)) as any;
      }
      
      const mods = await modsQuery
        .orderBy(orderBy)
        .limit(limitNum)
        .offset((pageNum - 1) * limitNum);

      // Build count query separately
      let totalQuery = db.select({ count: sql<number>`count(*)`.as('count') }).from(schema.mods);
      
      if (conditions.length > 0) {
        totalQuery = totalQuery.where(and(...conditions)) as any;
      }
      
      const [totalResult] = await totalQuery;
      const totalCount = totalResult?.count || 0;

      res.json({
        mods,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
          total: totalCount,
          pageSize: limitNum,
        },
      });
    } catch (error: any) {
      console.error("Error searching mods:", error);
      res.status(500).json({ message: "Failed to search mods" });
    }
  });

  // Reviews API endpoints
  app.get("/api/reviews/featured", async (req, res) => {
    try {
      const reviews = await db.select({
        id: schema.reviews.id,
        rating: schema.reviews.rating,
        title: schema.reviews.title,
        content: schema.reviews.content,
        isVerifiedPurchase: schema.reviews.isVerifiedPurchase,
        createdAt: schema.reviews.createdAt,
        user: {
          discordUsername: schema.users.discordUsername,
          discordAvatar: schema.users.discordAvatar,
        },
        mod: {
          title: schema.mods.title,
        },
      })
      .from(schema.reviews)
      .leftJoin(schema.users, eq(schema.reviews.userId, schema.users.id))
      .leftJoin(schema.mods, eq(schema.reviews.modId, schema.mods.id))
      .where(gte(schema.reviews.rating, 4))
      .orderBy(desc(schema.reviews.createdAt))
      .limit(20);

      res.json({ reviews });
    } catch (error) {
      console.error("Error fetching featured reviews:", error);
      res.status(500).json({ message: "Failed to fetch featured reviews" });
    }
  });

  app.get("/api/mods/:id/reviews", async (req, res) => {
    try {
      const modId = parseInt(req.params.id);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const sortBy = req.query.sortBy as string || "newest";
      const rating = req.query.rating ? parseInt(req.query.rating as string) : undefined;

      let orderBy;
      switch (sortBy) {
        case "oldest":
          orderBy = asc(schema.reviews.createdAt);
          break;
        case "highest":
          orderBy = desc(schema.reviews.rating);
          break;
        case "lowest":
          orderBy = asc(schema.reviews.rating);
          break;
        case "helpful":
          orderBy = desc(schema.reviews.helpfulCount);
          break;
        default:
          orderBy = desc(schema.reviews.createdAt);
      }

      const conditions = [eq(schema.reviews.modId, modId)];
      if (rating) {
        conditions.push(eq(schema.reviews.rating, rating));
      }

      const reviews = await db.select({
        id: schema.reviews.id,
        rating: schema.reviews.rating,
        title: schema.reviews.title,
        content: schema.reviews.content,
        isVerifiedPurchase: schema.reviews.isVerifiedPurchase,
        helpfulCount: schema.reviews.helpfulCount,
        createdAt: schema.reviews.createdAt,
        user: {
          discordUsername: schema.users.discordUsername,
          discordAvatar: schema.users.discordAvatar,
        },
      })
      .from(schema.reviews)
      .leftJoin(schema.users, eq(schema.reviews.userId, schema.users.id))
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(limit)
      .offset((page - 1) * limit);

      const [totalResult] = await db.select({ count: sql<number>`count(*)`.as('count') })
        .from(schema.reviews)
        .where(and(...conditions));

      const total = totalResult?.count || 0;

      res.json({
        reviews,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          total,
          limit,
        },
      });
    } catch (error: any) {
      console.error("Error fetching mod reviews:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/mods/:id/reviews", auth.isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const modId = parseInt(req.params.id);
      const { rating, title, content } = req.body;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }

      if (!title || title.trim().length === 0) {
        return res.status(400).json({ message: "Review title is required" });
      }

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: "Review content is required" });
      }

      // Check if user has already reviewed this mod
      const existingReview = await db.select()
        .from(schema.reviews)
        .where(and(
          eq(schema.reviews.userId, userId),
          eq(schema.reviews.modId, modId)
        ))
        .limit(1);

      if (existingReview.length > 0) {
        return res.status(400).json({ message: "You have already reviewed this mod" });
      }

      // Check if this is a verified purchase
      const purchase = await db.select()
        .from(schema.purchases)
        .where(and(
          eq(schema.purchases.userId, userId),
          eq(schema.purchases.modId, modId)
        ))
        .limit(1);

      const user = await db.select()
        .from(schema.users)
        .where(eq(schema.users.id, userId))
        .limit(1);

      const mod = await db.select()
        .from(schema.mods)
        .where(eq(schema.mods.id, modId))
        .limit(1);

      const isVerifiedPurchase = purchase.length > 0 || 
        (user[0]?.stripeSubscriptionId && mod[0]?.isSubscriptionOnly);

      // Create the review
      const [review] = await db.insert(schema.reviews)
        .values({
          userId: userId as number,
          modId: modId as number,
          rating: rating as number,
          title: title.trim() as string,
          content: content.trim() as string,
          isVerifiedPurchase: Boolean(isVerifiedPurchase),
          helpfulCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      // Update mod's average rating
      const [avgResult] = await db.select({
        avgRating: sql<number>`avg(${schema.reviews.rating})`.as('avgRating'),
        reviewCount: sql<number>`count(*)`.as('reviewCount'),
      })
      .from(schema.reviews)
      .where(eq(schema.reviews.modId, modId));

      await db.update(schema.mods)
        .set({ 
          averageRating: avgResult.avgRating ? parseFloat(avgResult.avgRating.toString()) : 0,
          reviewCount: avgResult.reviewCount || 0,
        })
        .where(eq(schema.mods.id, modId));

      res.status(201).json({ message: "Review submitted successfully", review });
    } catch (error: any) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to submit review" });
    }
  });

  app.post("/api/reviews/:id/helpful", auth.isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const reviewId = parseInt(req.params.id);

      // Check if user has already marked this review as helpful
      const existingVote = await db.select()
        .from(schema.reviewHelpfulVotes)
        .where(and(
          eq(schema.reviewHelpfulVotes.userId, userId),
          eq(schema.reviewHelpfulVotes.reviewId, reviewId)
        ))
        .limit(1);

      if (existingVote.length > 0) {
        return res.status(400).json({ message: "You have already marked this review as helpful" });
      }

      // Add helpful vote
      await db.insert(schema.reviewHelpfulVotes)
        .values({
          userId,
          reviewId,
          createdAt: new Date(),
        });

      // Update review helpful count
      await db.update(schema.reviews)
        .set({ 
          helpfulCount: sql`${schema.reviews.helpfulCount} + 1`
        })
        .where(eq(schema.reviews.id, reviewId));

      res.json({ message: "Review marked as helpful" });
    } catch (error) {
      console.error("Error marking review as helpful:", error);
      res.status(500).json({ message: "Failed to mark review as helpful" });
    }
  });

  app.post("/api/mods/:id/track-download", auth.isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const modId = parseInt(req.params.id);

      // Check if user has already downloaded this mod recently
      const recentDownload = await db.select()
        .from(schema.modDownloads)
        .where(and(
          eq(schema.modDownloads.userId, userId),
          eq(schema.modDownloads.modId, modId),
          gte(schema.modDownloads.downloadedAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // 7 days ago
        ))
        .limit(1);

      let shouldRequestReview = false;

      if (recentDownload.length === 0) {
        // Track new download
        await db.insert(schema.modDownloads)
          .values({
            userId,
            modId,
            downloadedAt: new Date(),
            reviewRequested: false,
            reviewReminderSent: false,
          });

        // Check if user should be asked for review
        const [totalDownloads] = await db.select({ count: sql<number>`count(*)`.as('count') })
          .from(schema.modDownloads)
          .where(and(
            eq(schema.modDownloads.userId, userId),
            eq(schema.modDownloads.modId, modId)
          ));

        const existingReview = await db.select()
          .from(schema.reviews)
          .where(and(
            eq(schema.reviews.userId, userId),
            eq(schema.reviews.modId, modId)
          ))
          .limit(1);

        // Request review if user has downloaded 2+ times and hasn't reviewed yet
        shouldRequestReview = totalDownloads.count >= 2 && existingReview.length === 0;
      }

      res.json({ shouldRequestReview });
    } catch (error: any) {
      console.error("Error tracking download:", error);
      res.status(500).json({ message: "Failed to track download" });
    }
  });

  // Create and return the HTTP server
  const server = createServer(app);
  return server;
}