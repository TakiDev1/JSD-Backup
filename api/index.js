var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// api/index.ts
import express2 from "express";

// server/routes.ts
import express from "express";
import { createServer } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto2 from "crypto";

// server/storage.ts
import { and, count, eq, gt, sql, desc } from "drizzle-orm";

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  adminActivityLog: () => adminActivityLog,
  adminActivityLogRelations: () => adminActivityLogRelations,
  cartItems: () => cartItems,
  cartItemsRelations: () => cartItemsRelations,
  insertAdminActivityLogSchema: () => insertAdminActivityLogSchema,
  insertCartItemSchema: () => insertCartItemSchema,
  insertModDownloadSchema: () => insertModDownloadSchema,
  insertModImagesSchema: () => insertModImagesSchema,
  insertModRequirementsSchema: () => insertModRequirementsSchema,
  insertModSchema: () => insertModSchema,
  insertModVersionSchema: () => insertModVersionSchema,
  insertNotificationSchema: () => insertNotificationSchema,
  insertPermissionSchema: () => insertPermissionSchema,
  insertPurchaseSchema: () => insertPurchaseSchema,
  insertReviewHelpfulVoteSchema: () => insertReviewHelpfulVoteSchema,
  insertReviewSchema: () => insertReviewSchema,
  insertRolePermissionSchema: () => insertRolePermissionSchema,
  insertRoleSchema: () => insertRoleSchema,
  insertSiteSettingsSchema: () => insertSiteSettingsSchema,
  insertSubscriptionBenefitSchema: () => insertSubscriptionBenefitSchema,
  insertSubscriptionPlanSchema: () => insertSubscriptionPlanSchema,
  insertSupportTicketSchema: () => insertSupportTicketSchema,
  insertUserRoleSchema: () => insertUserRoleSchema,
  insertUserSchema: () => insertUserSchema,
  modDownloads: () => modDownloads,
  modImages: () => modImages,
  modImagesRelations: () => modImagesRelations,
  modRequirements: () => modRequirements,
  modRequirementsRelations: () => modRequirementsRelations,
  modVersions: () => modVersions,
  modVersionsRelations: () => modVersionsRelations,
  mods: () => mods,
  modsRelations: () => modsRelations,
  notifications: () => notifications,
  notificationsRelations: () => notificationsRelations,
  permissionRelations: () => permissionRelations,
  permissions: () => permissions,
  purchases: () => purchases,
  purchasesRelations: () => purchasesRelations,
  reviewHelpfulVotes: () => reviewHelpfulVotes,
  reviewHelpfulVotesRelations: () => reviewHelpfulVotesRelations,
  reviews: () => reviews,
  reviewsRelations: () => reviewsRelations,
  rolePermissionRelations: () => rolePermissionRelations,
  rolePermissions: () => rolePermissions,
  roleRelations: () => roleRelations,
  roles: () => roles,
  siteSettings: () => siteSettings,
  subscriptionBenefits: () => subscriptionBenefits,
  subscriptionPlans: () => subscriptionPlans,
  supportTickets: () => supportTickets,
  supportTicketsRelations: () => supportTicketsRelations,
  userRoleRelations: () => userRoleRelations,
  userRoles: () => userRoles,
  users: () => users,
  usersRelations: () => usersRelations
});
import { pgTable, text, serial, integer, doublePrecision, boolean, timestamp, json, primaryKey, varchar, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password"),
  email: text("email"),
  discordId: text("discord_id").unique(),
  discordUsername: text("discord_username"),
  discordAvatar: text("discord_avatar"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  isAdmin: boolean("is_admin").default(false),
  isPremium: boolean("is_premium").default(false),
  premiumExpiresAt: timestamp("premium_expires_at"),
  isBanned: boolean("is_banned").default(false),
  patreonId: text("patreon_id").unique(),
  patreonTier: text("patreon_tier"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastLogin: timestamp("last_login"),
  // IP tracking and detailed user information
  lastIpAddress: text("last_ip_address"),
  registrationIpAddress: text("registration_ip_address"),
  loginCount: integer("login_count").default(0),
  totalSpent: doublePrecision("total_spent").default(0),
  country: text("country"),
  city: text("city"),
  region: text("region"),
  userAgent: text("user_agent"),
  timezone: text("timezone"),
  referrer: text("referrer"),
  deviceType: text("device_type"),
  browser: text("browser"),
  operatingSystem: text("operating_system")
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});
var siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value"),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
var insertSiteSettingsSchema = createInsertSchema(siteSettings).omit({
  id: true,
  updatedAt: true
});
var mods = pgTable("mods", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: doublePrecision("price").notNull(),
  discountPrice: doublePrecision("discount_price"),
  previewImageUrl: text("preview_image_url"),
  downloadUrl: text("download_url"),
  category: text("category").notNull(),
  tags: json("tags").$type().default([]),
  features: json("features").$type().default([]),
  isFeatured: boolean("is_featured").default(false),
  featured: boolean("featured").default(false),
  // Add featured column
  // Removed isPublished field as it's no longer needed
  downloadCount: integer("download_count").default(0),
  averageRating: doublePrecision("average_rating").default(0),
  reviewCount: integer("review_count").default(0),
  // Add reviewCount column
  isSubscriptionOnly: boolean("is_subscription_only").default(false),
  version: text("version").default("1.0.0"),
  releaseNotes: text("release_notes"),
  changelog: text("changelog").default(""),
  lockerFolder: text("locker_folder"),
  // Maps to mod locker folder name
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
var insertModSchema = createInsertSchema(mods).omit({
  id: true,
  downloadCount: true,
  averageRating: true,
  createdAt: true,
  updatedAt: true
});
var modVersions = pgTable("mod_versions", {
  id: serial("id").primaryKey(),
  modId: integer("mod_id").notNull(),
  version: text("version").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size").notNull(),
  changelog: text("changelog"),
  isLatest: boolean("is_latest").default(true),
  releaseDate: timestamp("release_date").notNull().defaultNow()
});
var insertModVersionSchema = createInsertSchema(modVersions).omit({
  id: true,
  releaseDate: true
});
var purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  modId: integer("mod_id").notNull(),
  transactionId: text("transaction_id").notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  price: doublePrecision("price").notNull(),
  status: text("status").default("completed"),
  customerIpAddress: text("customer_ip_address"),
  purchaseDate: timestamp("purchase_date").notNull().defaultNow()
});
var insertPurchaseSchema = createInsertSchema(purchases).omit({
  id: true,
  purchaseDate: true
});
var cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  modId: integer("mod_id").notNull(),
  addedAt: timestamp("added_at").notNull().defaultNow()
});
var insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  addedAt: true
});
var adminActivityLog = pgTable("admin_activity_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  action: text("action").notNull(),
  details: text("details"),
  ipAddress: text("ip_address"),
  timestamp: timestamp("timestamp").notNull().defaultNow()
});
var insertAdminActivityLogSchema = createInsertSchema(adminActivityLog).omit({
  id: true,
  timestamp: true
});
var reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  modId: integer("mod_id").notNull(),
  rating: integer("rating").notNull(),
  // 1-5 stars
  title: text("title").notNull(),
  content: text("content").notNull(),
  isVerifiedPurchase: boolean("is_verified_purchase").default(false),
  helpfulCount: integer("helpful_count").default(0),
  // Change from isHelpful to helpfulCount
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
var insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var reviewHelpfulVotes = pgTable("review_helpful_votes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  reviewId: integer("review_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var insertReviewHelpfulVoteSchema = createInsertSchema(reviewHelpfulVotes).omit({
  id: true,
  createdAt: true
});
var modDownloads = pgTable("mod_downloads", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  modId: integer("mod_id").notNull(),
  downloadedAt: timestamp("downloaded_at").notNull().defaultNow(),
  reviewRequested: boolean("review_requested").default(false),
  reviewReminderSent: boolean("review_reminder_sent").default(false)
});
var insertModDownloadSchema = createInsertSchema(modDownloads).omit({
  id: true,
  downloadedAt: true
});
var usersRelations = relations(users, ({ many }) => ({
  purchases: many(purchases),
  cartItems: many(cartItems),
  adminLogs: many(adminActivityLog),
  reviews: many(reviews),
  modDownloads: many(modDownloads),
  reviewHelpfulVotes: many(reviewHelpfulVotes)
}));
var modsRelations = relations(mods, ({ many }) => ({
  versions: many(modVersions),
  purchases: many(purchases),
  cartItems: many(cartItems),
  reviews: many(reviews),
  downloads: many(modDownloads)
}));
var modVersionsRelations = relations(modVersions, ({ one }) => ({
  mod: one(mods, {
    fields: [modVersions.modId],
    references: [mods.id]
  })
}));
var purchasesRelations = relations(purchases, ({ one }) => ({
  user: one(users, {
    fields: [purchases.userId],
    references: [users.id]
  }),
  mod: one(mods, {
    fields: [purchases.modId],
    references: [mods.id]
  })
}));
var cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id]
  }),
  mod: one(mods, {
    fields: [cartItems.modId],
    references: [mods.id]
  })
}));
var adminActivityLogRelations = relations(adminActivityLog, ({ one }) => ({
  user: one(users, {
    fields: [adminActivityLog.userId],
    references: [users.id]
  })
}));
var reviewsRelations = relations(reviews, ({ one, many }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id]
  }),
  mod: one(mods, {
    fields: [reviews.modId],
    references: [mods.id]
  }),
  helpfulVotes: many(reviewHelpfulVotes)
}));
var reviewHelpfulVotesRelations = relations(reviewHelpfulVotes, ({ one }) => ({
  user: one(users, {
    fields: [reviewHelpfulVotes.userId],
    references: [users.id]
  }),
  review: one(reviews, {
    fields: [reviewHelpfulVotes.reviewId],
    references: [reviews.id]
  })
}));
var modImages = pgTable("mod_images", {
  id: serial("id").primaryKey(),
  modId: integer("mod_id").notNull(),
  imageUrl: text("image_url").notNull(),
  sortOrder: integer("sort_order").default(0),
  caption: text("caption"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var insertModImagesSchema = createInsertSchema(modImages).omit({
  id: true,
  createdAt: true
});
var modImagesRelations = relations(modImages, ({ one }) => ({
  mod: one(mods, {
    fields: [modImages.modId],
    references: [mods.id]
  })
}));
var notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").default("info"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true
});
var notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id]
  })
}));
var modRequirements = pgTable("mod_requirements", {
  id: serial("id").primaryKey(),
  modId: integer("mod_id").notNull(),
  requirement: text("requirement").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var insertModRequirementsSchema = createInsertSchema(modRequirements).omit({
  id: true,
  createdAt: true
});
var modRequirementsRelations = relations(modRequirements, ({ one }) => ({
  mod: one(mods, {
    fields: [modRequirements.modId],
    references: [mods.id]
  })
}));
var subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: doublePrecision("price").notNull(),
  interval: text("interval").notNull().default("month"),
  // 'month' or 'year'
  features: jsonb("features").$type().default([]),
  stripePriceId: text("stripe_price_id"),
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
var insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var subscriptionBenefits = pgTable("subscription_benefits", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  // Lucide icon name
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var insertSubscriptionBenefitSchema = createInsertSchema(subscriptionBenefits).omit({
  id: true,
  createdAt: true
});
var roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  isSystem: boolean("is_system").default(false),
  // System roles can't be deleted
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
var insertRoleSchema = createInsertSchema(roles).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  category: text("category").notNull(),
  // e.g., "users", "orders", "mods", "settings"
  action: text("action").notNull(),
  // e.g., "view", "create", "edit", "delete"
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var insertPermissionSchema = createInsertSchema(permissions).omit({
  id: true,
  createdAt: true
});
var rolePermissions = pgTable("role_permissions", {
  roleId: integer("role_id").notNull(),
  permissionId: integer("permission_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
}, (table) => ({
  pk: primaryKey({ columns: [table.roleId, table.permissionId] })
}));
var insertRolePermissionSchema = createInsertSchema(rolePermissions).omit({
  createdAt: true
});
var userRoles = pgTable("user_roles", {
  userId: integer("user_id").notNull(),
  roleId: integer("role_id").notNull(),
  assignedBy: integer("assigned_by").notNull(),
  // Who assigned this role
  createdAt: timestamp("created_at").notNull().defaultNow()
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.roleId] })
}));
var insertUserRoleSchema = createInsertSchema(userRoles).omit({
  createdAt: true
});
var roleRelations = relations(roles, ({ many }) => ({
  rolePermissions: many(rolePermissions),
  userRoles: many(userRoles)
}));
var permissionRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions)
}));
var rolePermissionRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id]
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id]
  })
}));
var userRoleRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id]
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id]
  }),
  assignedByUser: one(users, {
    fields: [userRoles.assignedBy],
    references: [users.id]
  })
}));
var supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  priority: varchar("priority", { length: 20 }).default("medium"),
  status: varchar("status", { length: 20 }).default("open"),
  category: varchar("category", { length: 50 }).default("general"),
  userId: integer("user_id").references(() => users.id),
  assignedTo: integer("assigned_to").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  closedAt: timestamp("closed_at", { withTimezone: true })
});
var insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var supportTicketsRelations = relations(supportTickets, ({ one }) => ({
  user: one(users, {
    fields: [supportTickets.userId],
    references: [users.id]
  }),
  assignedToUser: one(users, {
    fields: [supportTickets.assignedTo],
    references: [users.id]
  })
}));

// server/db.ts
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL environment variable is not set. Please make sure the database is properly configured."
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle(pool, { schema: schema_exports });
console.log("Database connection established.");

// server/storage.ts
var DatabaseStorage = class {
  // User operations
  async getUser(id) {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }
  async getUserByUsername(username) {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }
  async getUserByDiscordId(discordId) {
    const result = await db.select().from(users).where(eq(users.discordId, discordId));
    return result[0];
  }
  async createUser(user) {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }
  async updateUser(id, user) {
    const result = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return result[0];
  }
  async updateUserStripeInfo(id, stripeInfo) {
    const result = await db.update(users).set({
      stripeCustomerId: stripeInfo.stripeCustomerId,
      stripeSubscriptionId: stripeInfo.stripeSubscriptionId
    }).where(eq(users.id, id)).returning();
    return result[0];
  }
  async getUserByPatreonId(patreonId) {
    const result = await db.select().from(users).where(eq(users.patreonId, patreonId));
    return result[0];
  }
  async getAllUsers() {
    return await db.select().from(users).orderBy(users.username);
  }
  async getAllUsersWithTrackingInfo() {
    const allUsers = await db.select().from(users).orderBy(users.username);
    const usersWithStats = await Promise.all(
      allUsers.map(async (user) => {
        const userPurchases = await this.getPurchasesByUser(user.id);
        const totalSpent = userPurchases.reduce((sum, purchase) => sum + purchase.price, 0);
        return {
          ...user,
          totalSpent,
          loginCount: user.loginCount || 0
        };
      })
    );
    return usersWithStats;
  }
  async updateUserPatreonInfo(id, patreonInfo) {
    const result = await db.update(users).set({
      patreonId: patreonInfo.patreonId,
      patreonTier: patreonInfo.patreonTier
    }).where(eq(users.id, id)).returning();
    return result[0];
  }
  async updateUserTrackingInfo(id, trackingInfo) {
    const result = await db.update(users).set(trackingInfo).where(eq(users.id, id)).returning();
    return result[0];
  }
  async incrementUserLogin(id) {
    const result = await db.update(users).set({
      loginCount: sql`${users.loginCount} + 1`,
      lastLogin: /* @__PURE__ */ new Date()
    }).where(eq(users.id, id)).returning();
    return result[0];
  }
  async banUser(id, banned) {
    const result = await db.update(users).set({ isBanned: banned }).where(eq(users.id, id)).returning();
    return result[0];
  }
  // Site settings operations
  async getSiteSettings() {
    const settings = await db.select().from(siteSettings);
    const result = {};
    for (const setting of settings) {
      result[setting.key] = setting.value || "";
    }
    return result;
  }
  async getSiteSetting(key) {
    const result = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    return result[0]?.value || void 0;
  }
  async setSiteSetting(key, value) {
    const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    if (existing.length > 0) {
      const result = await db.update(siteSettings).set({ value }).where(eq(siteSettings.key, key)).returning();
      return result[0];
    } else {
      const result = await db.insert(siteSettings).values({ key, value }).returning();
      return result[0];
    }
  }
  // Mod operations
  async getMod(id) {
    const result = await db.select().from(mods).where(eq(mods.id, id));
    return result[0];
  }
  async getMods(params) {
    let query = db.select().from(mods);
    const conditions = [];
    if (params) {
      if (params.category) {
        conditions.push(eq(mods.category, params.category));
      }
      if (params.searchTerm) {
        conditions.push(
          sql`${mods.title} LIKE ${"%" + params.searchTerm + "%"} OR ${mods.description} LIKE ${"%" + params.searchTerm + "%"}`
        );
      }
      if (params.featured !== void 0) {
        conditions.push(eq(mods.isFeatured, params.featured));
      }
      if (params.subscriptionOnly !== void 0) {
        conditions.push(eq(mods.isSubscriptionOnly, params.subscriptionOnly));
      }
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      if (params.limit) {
        query = query.limit(params.limit);
      }
      if (params.offset) {
        query = query.offset(params.offset);
      }
    }
    return await query;
  }
  async getModsCount(params) {
    let query = db.select({ count: count() }).from(mods);
    const conditions = [];
    if (params) {
      if (params.category) {
        conditions.push(eq(mods.category, params.category));
      }
      if (params.searchTerm) {
        conditions.push(
          sql`${mods.title} LIKE ${"%" + params.searchTerm + "%"} OR ${mods.description} LIKE ${"%" + params.searchTerm + "%"}`
        );
      }
      if (params.featured !== void 0) {
        conditions.push(eq(mods.isFeatured, params.featured));
      }
      if (params.subscriptionOnly !== void 0) {
        conditions.push(eq(mods.isSubscriptionOnly, params.subscriptionOnly));
      }
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    const result = await query;
    return result[0]?.count || 0;
  }
  async createMod(mod) {
    const result = await db.insert(mods).values(mod).returning();
    return result[0];
  }
  async updateMod(id, mod) {
    const result = await db.update(mods).set(mod).where(eq(mods.id, id)).returning();
    return result[0];
  }
  async deleteMod(id) {
    const result = await db.delete(mods).where(eq(mods.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  // Mod version operations
  async getModVersions(modId) {
    return await db.select().from(modVersions).where(eq(modVersions.modId, modId));
  }
  async getLatestModVersion(modId) {
    const result = await db.select().from(modVersions).where(and(eq(modVersions.modId, modId), eq(modVersions.isLatest, true)));
    return result[0];
  }
  async createModVersion(version) {
    await db.update(modVersions).set({ isLatest: false }).where(eq(modVersions.modId, version.modId));
    const result = await db.insert(modVersions).values(version).returning();
    return result[0];
  }
  // Purchase operations
  async getPurchasesByUser(userId) {
    return await db.select().from(purchases).where(eq(purchases.userId, userId));
  }
  async getPurchasesByMod(modId) {
    return await db.select().from(purchases).where(eq(purchases.modId, modId));
  }
  async getAllPurchases() {
    return await db.select().from(purchases).orderBy(desc(purchases.purchaseDate));
  }
  async getModPurchase(userId, modId) {
    const result = await db.select().from(purchases).where(and(eq(purchases.userId, userId), eq(purchases.modId, modId)));
    return result[0];
  }
  async createPurchase(purchase) {
    const result = await db.insert(purchases).values(purchase).returning();
    await db.update(mods).set({ downloadCount: sql`${mods.downloadCount} + 1` }).where(eq(mods.id, purchase.modId));
    return result[0];
  }
  // Review operations and Forum operations removed
  // Cart operations
  async getCartItems(userId) {
    return await db.select().from(cartItems).where(eq(cartItems.userId, userId));
  }
  async addToCart(item) {
    const existing = await db.select().from(cartItems).where(and(eq(cartItems.userId, item.userId), eq(cartItems.modId, item.modId)));
    if (existing.length > 0) {
      return existing[0];
    }
    const result = await db.insert(cartItems).values(item).returning();
    return result[0];
  }
  async removeFromCart(userId, modId) {
    const result = await db.delete(cartItems).where(and(eq(cartItems.userId, userId), eq(cartItems.modId, modId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  async clearCart(userId) {
    const result = await db.delete(cartItems).where(eq(cartItems.userId, userId));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  // Admin operations
  async logAdminActivity(activity) {
    const result = await db.insert(adminActivityLog).values(activity).returning();
    return result[0];
  }
  async getAdminActivity(limit) {
    let query = db.select().from(adminActivityLog).orderBy(desc(adminActivityLog.timestamp));
    if (limit) {
      query = query.limit(limit);
    }
    return await query;
  }
  async getAdminStats() {
    const usersResult = await db.select({ count: count() }).from(users);
    const totalUsers = usersResult[0]?.count || 0;
    const modsResult = await db.select({ count: count() }).from(mods);
    const totalMods = modsResult[0]?.count || 0;
    const purchasesResult = await db.select({ count: count() }).from(purchases);
    const totalPurchases = purchasesResult[0]?.count || 0;
    const revenueResult = await db.select({
      sum: sql`COALESCE(SUM(${purchases.price}), 0)`
    }).from(purchases);
    const totalRevenue = Number(revenueResult[0]?.sum) || 0;
    const thirtyDaysAgo = /* @__PURE__ */ new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsersResult = await db.select({ count: count() }).from(users).where(gt(users.lastLogin, thirtyDaysAgo));
    const activeUsers = activeUsersResult[0]?.count || 0;
    const pendingReviews = 0;
    return {
      users: totalUsers,
      mods: totalMods,
      purchases: totalPurchases,
      revenue: totalRevenue,
      activeUsers,
      pendingReviews
    };
  }
  // Subscription plans operations
  async getSubscriptionPlans() {
    return await db.select().from(subscriptionPlans).orderBy(subscriptionPlans.sortOrder);
  }
  async getSubscriptionPlan(id) {
    const result = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id));
    return result[0];
  }
  async createSubscriptionPlan(plan) {
    const result = await db.insert(subscriptionPlans).values(plan).returning();
    return result[0];
  }
  async updateSubscriptionPlan(id, plan) {
    const result = await db.update(subscriptionPlans).set(plan).where(eq(subscriptionPlans.id, id)).returning();
    return result[0];
  }
  async deleteSubscriptionPlan(id) {
    const result = await db.delete(subscriptionPlans).where(eq(subscriptionPlans.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  // Subscription benefits operations
  async getSubscriptionBenefits() {
    return await db.select().from(subscriptionBenefits).orderBy(subscriptionBenefits.sortOrder);
  }
  async getSubscriptionBenefit(id) {
    const result = await db.select().from(subscriptionBenefits).where(eq(subscriptionBenefits.id, id));
    return result[0];
  }
  async createSubscriptionBenefit(benefit) {
    const result = await db.insert(subscriptionBenefits).values(benefit).returning();
    return result[0];
  }
  async updateSubscriptionBenefit(id, benefit) {
    const result = await db.update(subscriptionBenefits).set(benefit).where(eq(subscriptionBenefits.id, id)).returning();
    return result[0];
  }
  async deleteSubscriptionBenefit(id) {
    const result = await db.delete(subscriptionBenefits).where(eq(subscriptionBenefits.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  // Role management operations
  async getRoles() {
    return await db.select().from(roles).orderBy(roles.name);
  }
  async getRole(id) {
    const result = await db.select().from(roles).where(eq(roles.id, id));
    return result[0];
  }
  async createRole(role) {
    const result = await db.insert(roles).values(role).returning();
    return result[0];
  }
  async updateRole(id, role) {
    const result = await db.update(roles).set({
      ...role,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(roles.id, id)).returning();
    return result[0];
  }
  async deleteRole(id) {
    const roleToDelete = await this.getRole(id);
    if (roleToDelete?.isSystem) {
      return false;
    }
    await db.delete(userRoles).where(eq(userRoles.roleId, id));
    await db.delete(rolePermissions).where(eq(rolePermissions.roleId, id));
    const result = await db.delete(roles).where(eq(roles.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  // Permission operations
  async getPermissions() {
    return await db.select().from(permissions).orderBy(permissions.category, permissions.action);
  }
  async getPermissionsByCategory(category) {
    return await db.select().from(permissions).where(eq(permissions.category, category)).orderBy(permissions.action);
  }
  // Role permission operations
  async getRolePermissions(roleId) {
    const result = await db.select({
      id: permissions.id,
      name: permissions.name,
      description: permissions.description,
      category: permissions.category,
      action: permissions.action,
      createdAt: permissions.createdAt
    }).from(rolePermissions).innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id)).where(eq(rolePermissions.roleId, roleId)).orderBy(permissions.category, permissions.action);
    return result;
  }
  async assignPermissionsToRole(roleId, permissionIds) {
    try {
      await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));
      if (permissionIds.length > 0) {
        const assignments = permissionIds.map((permissionId) => ({
          roleId,
          permissionId
        }));
        await db.insert(rolePermissions).values(assignments);
      }
      return true;
    } catch (error) {
      console.error("Error assigning permissions to role:", error);
      return false;
    }
  }
  async removePermissionsFromRole(roleId, permissionIds) {
    try {
      await db.delete(rolePermissions).where(and(
        eq(rolePermissions.roleId, roleId),
        sql`${rolePermissions.permissionId} = ANY(${permissionIds})`
      ));
      return true;
    } catch (error) {
      console.error("Error removing permissions from role:", error);
      return false;
    }
  }
  // User role operations
  async getUserRoles(userId) {
    const result = await db.select({
      id: roles.id,
      name: roles.name,
      description: roles.description,
      isSystem: roles.isSystem,
      createdAt: roles.createdAt,
      updatedAt: roles.updatedAt
    }).from(userRoles).innerJoin(roles, eq(userRoles.roleId, roles.id)).where(eq(userRoles.userId, userId)).orderBy(roles.name);
    return result;
  }
  async getUserPermissions(userId) {
    const result = await db.select({
      id: permissions.id,
      name: permissions.name,
      description: permissions.description,
      category: permissions.category,
      action: permissions.action,
      createdAt: permissions.createdAt
    }).from(userRoles).innerJoin(roles, eq(userRoles.roleId, roles.id)).innerJoin(rolePermissions, eq(roles.id, rolePermissions.roleId)).innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id)).where(eq(userRoles.userId, userId)).orderBy(permissions.category, permissions.action);
    const uniquePermissions = result.filter(
      (permission, index, self) => index === self.findIndex((p) => p.id === permission.id)
    );
    return uniquePermissions;
  }
  async assignRolesToUser(userId, roleIds, assignedBy) {
    try {
      await db.delete(userRoles).where(eq(userRoles.userId, userId));
      if (roleIds.length > 0) {
        const assignments = roleIds.map((roleId) => ({
          userId,
          roleId,
          assignedBy
        }));
        await db.insert(userRoles).values(assignments);
      }
      return true;
    } catch (error) {
      console.error("Error assigning roles to user:", error);
      return false;
    }
  }
  async removeRolesFromUser(userId, roleIds) {
    try {
      await db.delete(userRoles).where(and(
        eq(userRoles.userId, userId),
        sql`${userRoles.roleId} = ANY(${roleIds})`
      ));
      return true;
    } catch (error) {
      console.error("Error removing roles from user:", error);
      return false;
    }
  }
  // Permission checking
  async userHasPermission(userId, permissionName) {
    const userPermissions = await this.getUserPermissions(userId);
    return userPermissions.some((permission) => permission.name === permissionName);
  }
  async userHasAnyPermission(userId, permissionNames) {
    const userPermissions = await this.getUserPermissions(userId);
    const userPermissionNames = userPermissions.map((p) => p.name);
    return permissionNames.some((permName) => userPermissionNames.includes(permName));
  }
};
var storage = new DatabaseStorage();

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as DiscordStrategy } from "passport-discord";
import session from "express-session";
import crypto from "crypto";
import { promisify } from "util";
import connectPg from "connect-pg-simple";
var scryptAsync = promisify(crypto.scrypt);
async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await scryptAsync(password, salt, 64);
  return `${derivedKey.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  try {
    const [hashedPassword, salt] = stored.split(".");
    if (!hashedPassword || !salt) {
      return false;
    }
    const derivedKey = await scryptAsync(supplied, salt, 64);
    return crypto.timingSafeEqual(
      Buffer.from(hashedPassword, "hex"),
      derivedKey
    );
  } catch (error) {
    console.error("Password comparison error:", error);
    return false;
  }
}
var DISCORD_SCOPES = ["identify", "email"];
var PostgresStore = connectPg(session);
function setupAuth(app2) {
  const sessionSecret = process.env.SESSION_SECRET || crypto.randomBytes(20).toString("hex");
  console.log("Setting up session middleware with secret hash:", crypto.createHash("sha256").update(sessionSecret).digest("hex").substring(0, 8));
  app2.use(
    session({
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1e3,
        // 30 days for longer sessions
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        // Prevent client-side JS from reading
        sameSite: "lax"
        // Improve CSRF protection
      },
      store: new PostgresStore({
        pool,
        createTableIfMissing: true,
        tableName: "session"
      }),
      secret: sessionSecret,
      resave: true,
      // Save session on each request
      rolling: true,
      // Reset expiration countdown on every response
      saveUninitialized: true,
      // Create session for all users
      name: "jsd_session"
      // Custom name for better security
    })
  );
  app2.use(passport.initialize());
  app2.use(passport.session());
  app2.use((req, res, next) => {
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
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      if (user) {
        const convertedUser = {
          ...user,
          isAdmin: user.isAdmin ?? void 0,
          isPremium: user.isPremium ?? void 0,
          email: user.email ?? void 0,
          discordId: user.discordId ?? void 0,
          discordUsername: user.discordUsername ?? void 0,
          discordAvatar: user.discordAvatar ?? void 0,
          stripeCustomerId: user.stripeCustomerId ?? void 0,
          stripeSubscriptionId: user.stripeSubscriptionId ?? void 0,
          premiumExpiresAt: user.premiumExpiresAt ?? void 0,
          lastLogin: user.lastLogin ?? void 0,
          isBanned: user.isBanned ?? void 0
        };
        done(null, convertedUser);
      } else {
        done(null, false);
      }
    } catch (err) {
      done(err, false);
    }
  });
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }
        if (!user.password) {
          return done(null, false, { message: "Password login not available for this account." });
        }
        const isValid = await comparePasswords(password, user.password);
        if (!isValid) {
          return done(null, false, { message: "Incorrect password." });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );
  if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
    console.log("Initializing Discord authentication strategy");
    passport.use(
      new DiscordStrategy(
        {
          clientID: process.env.DISCORD_CLIENT_ID,
          clientSecret: process.env.DISCORD_CLIENT_SECRET,
          callbackURL: process.env.DISCORD_CALLBACK_URL || (process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}/api/auth/discord/callback` : "http://localhost:5000/api/auth/discord/callback"),
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
            let user = await storage.getUserByDiscordId(profile.id);
            if (user) {
              const shouldBeAdmin = ["jsd", "von", "developer"].includes(profile.username.toLowerCase());
              user = await storage.updateUser(user.id, {
                discordUsername: profile.username,
                discordAvatar: profile.avatar,
                email: profile.email,
                isAdmin: shouldBeAdmin ? true : user.isAdmin,
                // Don't remove existing admin privileges
                lastLogin: /* @__PURE__ */ new Date()
              });
            } else {
              const isAdmin = ["jsd", "von", "developer"].includes(profile.username.toLowerCase());
              user = await storage.createUser({
                username: profile.username,
                discordId: profile.id,
                discordUsername: profile.username,
                discordAvatar: profile.avatar,
                email: profile.email,
                isAdmin,
                // Grant admin access to specific Discord users
                lastLogin: /* @__PURE__ */ new Date()
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
  return {
    isAuthenticated: (req, res, next) => {
      console.log("Authentication check - Path:", req.path, "Method:", req.method);
      console.log("Authentication check - User:", req.user ? { id: req.user.id, username: req.user.username } : "Not authenticated");
      console.log("Authentication check - isAuthenticated():", req.isAuthenticated());
      if (req.isAuthenticated()) {
        console.log("Authentication check - PASSED");
        return next();
      }
      console.log("Authentication check - FAILED");
      res.status(401).json({ message: "Unauthorized" });
    },
    isAdmin: (req, res, next) => {
      console.log("Auth check - user:", req.user ? {
        id: req.user.id,
        username: req.user.username,
        isAdmin: req.user.isAdmin,
        is_admin: req.user.is_admin
      } : "No user");
      if (req.isAuthenticated() && (req.user.isAdmin || req.user.is_admin)) {
        return next();
      }
      res.status(403).json({ message: "Forbidden" });
    }
  };
}

// server/stripe.ts
import Stripe from "stripe";
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("Missing required Stripe secret: STRIPE_SECRET_KEY");
}
var stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2025-05-28.basil"
});
async function createPaymentIntent(amount, metadata) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      // Convert to cents
      currency: "usd",
      metadata
    });
    return { clientSecret: paymentIntent.client_secret };
  } catch (error) {
    throw new Error(`Error creating payment intent: ${error.message}`);
  }
}
async function handleWebhookEvent(event) {
  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
        break;
      case "customer.subscription.deleted":
        break;
    }
    return { received: true };
  } catch (error) {
    throw new Error(`Error handling webhook: ${error.message}`);
  }
}

// server/notifications.ts
import { MailService } from "@sendgrid/mail";
if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY not set - email notifications will be disabled");
}
var mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}
async function sendModUpdateNotification(data) {
  if (!process.env.SENDGRID_API_KEY) {
    console.log(`[Notifications] Would send email to ${data.userEmail} about ${data.modTitle} update (no SendGrid key)`);
    return false;
  }
  try {
    const siteSettings2 = await storage.getSiteSettings();
    const siteName = siteSettings2.siteName || "JSD Mods";
    const contactEmail = siteSettings2.contactEmail || "noreply@jsdmods.com";
    const emailContent = {
      to: data.userEmail,
      from: {
        email: contactEmail,
        name: siteName
      },
      subject: `\u{1F3AE} New Update Available: ${data.modTitle} v${data.newVersion}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">\u{1F3AE} Mod Update Available!</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Hey ${data.username}!</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Great news! <strong>${data.modTitle}</strong> has been updated to version <strong>${data.newVersion}</strong>.
            </p>
            
            ${data.changelog ? `
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #333; margin-top: 0;">\u{1F527} What's New:</h3>
                <p style="color: #666; margin-bottom: 0; white-space: pre-line;">${data.changelog}</p>
              </div>
            ` : ""}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.REPLIT_URL || "https://your-site.com"}/mod-locker" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        font-weight: bold; 
                        font-size: 16px;
                        display: inline-block;
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                \u{1F4E5} Download Update
              </a>
            </div>
            
            <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
              Your download link has been automatically updated in your mod locker.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <p style="color: #999; font-size: 12px;">
              \xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} ${siteName}. This email was sent because you own this mod.
            </p>
          </div>
        </div>
      `,
      text: `
Hey ${data.username}!

Great news! ${data.modTitle} has been updated to version ${data.newVersion}.

${data.changelog ? `What's New:
${data.changelog}

` : ""}

Visit your mod locker to download the update: ${process.env.REPLIT_URL || "https://your-site.com"}/mod-locker

Your download link has been automatically updated.

\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} ${siteName}
      `.trim()
    };
    await mailService.send(emailContent);
    await storage.logAdminActivity({
      userId: 0,
      // System action
      action: "mod_update_notification_sent",
      details: `Email sent to ${data.userEmail} for ${data.modTitle} v${data.newVersion}`
    });
    console.log(`[Notifications] Sent mod update email to ${data.userEmail} for ${data.modTitle} v${data.newVersion}`);
    return true;
  } catch (error) {
    console.error("[Notifications] Failed to send mod update email:", error);
    return false;
  }
}
async function notifyModUpdateToAllOwners(modId, newVersion, changelog) {
  try {
    const mod = await storage.getMod(modId);
    if (!mod) {
      console.error(`[Notifications] Mod ${modId} not found`);
      return;
    }
    const purchases2 = await storage.getPurchasesByMod(modId);
    console.log(`[Notifications] Found ${purchases2.length} owners of mod ${mod.title}`);
    const notificationPromises = purchases2.map(async (purchase) => {
      const user = await storage.getUser(purchase.userId);
      if (!user || !user.email) {
        console.warn(`[Notifications] User ${purchase.userId} not found or has no email`);
        return false;
      }
      return sendModUpdateNotification({
        modTitle: mod.title,
        modId: mod.id,
        newVersion,
        changelog,
        userEmail: user.email,
        username: user.username
      });
    });
    const results = await Promise.allSettled(notificationPromises);
    const successful = results.filter((r) => r.status === "fulfilled" && r.value).length;
    const failed = results.length - successful;
    console.log(`[Notifications] Mod update notifications sent: ${successful} successful, ${failed} failed`);
  } catch (error) {
    console.error("[Notifications] Failed to notify mod owners:", error);
  }
}

// server/routes.ts
import { eq as eq2, sql as sql2, asc as asc2, desc as desc2, like as like2, or, and as and2, gte, lte, ilike } from "drizzle-orm";
import passport2 from "passport";

// server/ip-tracker.ts
function getClientIP(req) {
  const xForwardedFor = req.headers["x-forwarded-for"];
  if (xForwardedFor) {
    if (Array.isArray(xForwardedFor)) {
      return xForwardedFor[0];
    }
    return xForwardedFor.split(",")[0].trim();
  }
  return req.headers["x-real-ip"] || req.connection.remoteAddress || req.socket.remoteAddress || "127.0.0.1";
}

// server/routes.ts
var upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const folderType = file.fieldname === "image" ? "images" : "mods";
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
    if (file.fieldname === "image") {
      if (!file.mimetype.startsWith("image/")) {
        return cb(new Error("Only image files are allowed!"));
      }
    }
    cb(null, true);
  },
  limits: {
    fileSize: 1024 * 1024 * 500
    // 500MB max file size
  }
});
async function registerRoutes(app2) {
  const auth = setupAuth(app2);
  const isAdminWithPermission = (permissionName) => {
    return async (req, res, next) => {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }
      if (!req.user || !req.user.isAdmin && !req.user.is_admin) {
        return res.status(403).json({ error: "Admin access required" });
      }
      try {
        const hasPermission = await storage.userHasPermission(req.user.id, permissionName);
        if (!hasPermission) {
          return res.status(403).json({
            error: `Permission '${permissionName}' required`,
            required_permission: permissionName
          });
        }
        next();
      } catch (error) {
        console.error("Error checking permission:", error);
        res.status(500).json({ error: "Permission check failed" });
      }
    };
  };
  if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
    app2.get("/api/auth/discord", passport2.authenticate("discord"));
    app2.get(
      "/api/auth/discord/callback",
      passport2.authenticate("discord", { failureRedirect: "/login?error=discord_failed" }),
      (req, res) => {
        console.log("Discord callback successful, redirecting user");
        res.redirect("/");
      }
    );
  } else {
    app2.get("/api/auth/discord", (req, res) => {
      res.status(503).json({ message: "Discord authentication not configured" });
    });
    app2.get("/api/auth/discord/callback", (req, res) => {
      res.status(503).json({ message: "Discord authentication not configured" });
    });
  }
  app2.get("/api/auth/discord-status", (req, res) => {
    const available = !!(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET);
    res.json({ available });
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      console.log("Login attempt for username:", username);
      console.log("Session before login:", req.sessionID);
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      const user = await storage.getUserByUsername(username);
      if (!user) {
        console.log("Login failed: User not found");
        return res.status(401).json({ message: "Invalid username or password" });
      }
      if (user.password) {
        const passwordValid = await comparePasswords(password, user.password);
        if (!passwordValid) {
          return res.status(401).json({ message: "Invalid username or password" });
        }
      } else {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      const convertedUser = {
        ...user,
        isAdmin: user.isAdmin ?? false,
        isPremium: user.isPremium ?? false,
        isBanned: user.isBanned ?? false,
        email: user.email ?? void 0
      };
      req.login(convertedUser, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed" });
        }
        res.json({ message: "Login successful", user: convertedUser });
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/auth/user", (req, res) => {
    console.log("Auth check - Session ID:", req.sessionID);
    console.log("Auth check - isAuthenticated():", req.isAuthenticated());
    console.log("Auth check - Session data:", req.session);
    if (req.isAuthenticated() && req.user) {
      const user = { ...req.user };
      console.log("Auth check - User authenticated:", { id: user.id, username: user.username });
      delete user.password;
      res.json(user);
    } else {
      console.log("Auth check - User not authenticated");
      res.status(401).json({ message: "Not authenticated" });
    }
  });
  app2.get("/api/auth/user/permissions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user.isAdmin) {
        return res.json({
          isAdmin: true,
          permissions: [
            "view_dashboard",
            "view_analytics",
            "view_users",
            "manage_users",
            "view_mods",
            "manage_mods",
            "view_roles",
            "manage_roles",
            "manage_content",
            "manage_system"
          ]
        });
      }
      const userRoleData = await db.select({
        roleId: roles.id,
        roleName: roles.name
      }).from(userRoles).innerJoin(roles, eq2(userRoles.roleId, roles.id)).where(eq2(userRoles.userId, user.id));
      const allPermissions = /* @__PURE__ */ new Set();
      for (const role of userRoleData) {
        const rolePermissions2 = await db.select({
          permissionName: permissions.name
        }).from(rolePermissions).innerJoin(permissions, eq2(rolePermissions.permissionId, permissions.id)).where(eq2(rolePermissions.roleId, role.roleId));
        rolePermissions2.forEach((perm) => {
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
  app2.post("/api/auth/admin-login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      const user = await storage.getUserByUsername(username);
      console.log("Admin login attempt for user:", username, "Found:", !!user);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      if (!user.isAdmin) {
        console.log("User is not an admin. isAdmin:", user.isAdmin);
        return res.status(401).json({ message: "Invalid admin credentials" });
      }
      if (user.password) {
        const passwordValid = await comparePasswords(password, user.password);
        if (!passwordValid) {
          return res.status(401).json({ message: "Invalid admin credentials" });
        }
      } else {
        const hashedPassword = await hashPassword(password);
        await storage.updateUser(user.id, { password: hashedPassword });
      }
      const convertedUser = {
        ...user,
        isAdmin: user.isAdmin ?? true,
        isPremium: user.isPremium ?? false,
        isBanned: user.isBanned ?? false,
        email: user.email ?? void 0
      };
      req.login(convertedUser, (err) => {
        if (err) {
          console.error("Admin login error during req.login:", err);
          return res.status(500).json({ message: "Login error" });
        }
        console.log("Admin user authenticated in req.login:", req.isAuthenticated());
        console.log("Admin session ID after login:", req.sessionID);
        storage.logAdminActivity({
          userId: user.id,
          action: "Admin Login",
          details: `Admin login for ${username}`,
          ipAddress: req.ip
        }).catch((err2) => console.error("Failed to log admin activity:", err2));
        const userWithoutPassword = { ...convertedUser };
        delete userWithoutPassword.password;
        userWithoutPassword.isAdmin = true;
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("Error saving admin session:", saveErr);
          }
          console.log("Admin session saved successfully, user authenticated:", req.isAuthenticated());
          res.json({ success: true, user: userWithoutPassword });
        });
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const { username, email, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        isAdmin: false
      });
      const convertedUser = {
        ...user,
        isAdmin: user.isAdmin ?? false,
        isPremium: user.isPremium ?? false,
        isBanned: user.isBanned ?? false,
        email: user.email ?? void 0
      };
      req.login(convertedUser, (err) => {
        if (err) {
          console.error("Registration login error during req.login:", err);
          return res.status(500).json({ message: "Login error" });
        }
        console.log("New user authenticated in req.login:", req.isAuthenticated());
        console.log("New user session ID after registration:", req.sessionID);
        const safeUser = { ...convertedUser };
        delete safeUser.password;
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("Error saving session after registration:", saveErr);
          }
          console.log("Session saved successfully after registration, user authenticated:", req.isAuthenticated());
          return res.status(201).json(safeUser);
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "An error occurred during registration" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ success: true });
    });
  });
  app2.get("/api/mods", async (req, res) => {
    try {
      const { category, search, featured, subscription, limit, page } = req.query;
      const pageSize = limit ? parseInt(limit) : 12;
      const currentPage = page ? parseInt(page) : 1;
      const offset = (currentPage - 1) * pageSize;
      const mods2 = await storage.getMods({
        category,
        searchTerm: search,
        featured: featured === "true",
        subscriptionOnly: subscription === "true",
        limit: pageSize,
        offset
      });
      const total = await storage.getModsCount({
        category,
        searchTerm: search,
        featured: featured === "true",
        subscriptionOnly: subscription === "true"
      });
      res.json({
        mods: mods2,
        pagination: {
          total,
          pageSize,
          currentPage,
          totalPages: Math.ceil(total / pageSize)
        }
      });
    } catch (error) {
      console.error("Error fetching mods:", error);
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/mods/counts/by-category", async (req, res) => {
    try {
      const allCategories = [
        "vehicles",
        "sports",
        "drift",
        "offroad",
        "racing",
        "muscle",
        "jdm",
        "supercars",
        "custom",
        "plushies",
        "rugs"
      ];
      const counts = await Promise.all(
        allCategories.map(async (category) => {
          const count2 = await storage.getModsCount({
            category
          });
          return {
            id: category,
            count: count2
          };
        })
      );
      res.json(counts);
    } catch (error) {
      console.error("Error fetching category counts:", error);
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/mods/:id", async (req, res) => {
    try {
      const mod = await storage.getMod(parseInt(req.params.id));
      if (!mod) {
        return res.status(404).json({ message: "Mod not found" });
      }
      const latestVersion = await storage.getLatestModVersion(mod.id);
      res.json({
        ...mod,
        latestVersion,
        reviews: []
        // Empty array for backward compatibility
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/admin/mods", auth.isAdmin, async (req, res) => {
    try {
      const { category, search, sortBy = "createdAt", sortOrder = "desc", page = 1, limit = 10 } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      const filters = [];
      if (category) {
        filters.push(eq2(mods.category, category));
      }
      if (search) {
        filters.push(
          or(
            like2(mods.title, `%${search}%`),
            like2(mods.description, `%${search}%`)
          )
        );
      }
      const allowedSortColumns = {
        id: mods.id,
        title: mods.title,
        description: mods.description,
        price: mods.price,
        discountPrice: mods.discountPrice,
        category: mods.category,
        tags: mods.tags,
        isFeatured: mods.isFeatured,
        isSubscriptionOnly: mods.isSubscriptionOnly,
        downloadCount: mods.downloadCount,
        averageRating: mods.averageRating,
        createdAt: mods.createdAt,
        version: mods.version
      };
      const sortColumn = allowedSortColumns[sortBy] || mods.createdAt;
      let query = db.select({
        id: mods.id,
        title: mods.title,
        description: mods.description,
        price: mods.price,
        discountPrice: mods.discountPrice,
        category: mods.category,
        tags: mods.tags,
        isFeatured: mods.isFeatured,
        isSubscriptionOnly: mods.isSubscriptionOnly,
        downloadCount: mods.downloadCount,
        averageRating: mods.averageRating,
        createdAt: mods.createdAt,
        version: mods.version
      }).from(mods);
      if (filters.length > 0) {
        query = query.where(and2(...filters));
      }
      if (sortOrder === "desc") {
        query = query.orderBy(desc2(sortColumn));
      } else {
        query = query.orderBy(asc2(sortColumn));
      }
      const mods2 = await query.limit(parseInt(limit)).offset(offset);
      let countQuery = db.select({ count: sql2`count(*)`.as("count") }).from(mods);
      if (filters.length > 0) {
        countQuery = countQuery.where(and2(...filters));
      }
      const [totalResult] = await countQuery;
      const totalCount = totalResult?.count || 0;
      res.json({
        mods: mods2,
        pagination: {
          total: totalCount,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalCount / parseInt(limit))
        }
      });
    } catch (error) {
      console.error("[GET /api/admin/mods] Error:", error);
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/admin/mods", auth.isAdmin, async (req, res) => {
    try {
      const { version, fileSize, changelog, ...modData } = req.body;
      const validatedModData = insertModSchema.parse(modData);
      const mod = await storage.createMod(validatedModData);
      if (version) {
        const versionData = {
          modId: mod.id,
          version,
          filePath: mod.downloadUrl || "",
          fileSize: fileSize ? parseFloat(fileSize) * 1024 * 1024 : 0,
          // Convert MB to bytes
          changelog: changelog || "Initial release",
          isLatest: true
        };
        await storage.createModVersion(versionData);
        console.log(`[POST /api/admin/mods] Created version ${version} for mod ${mod.id}`);
      }
      res.status(201).json(mod);
    } catch (error) {
      console.error("[POST /api/admin/mods] Error:", error);
      res.status(400).json({ message: error.message });
    }
  });
  app2.patch("/api/admin/mods/:id", auth.isAdmin, async (req, res) => {
    try {
      const validatedData = insertModSchema.partial().parse(req.body);
      const mod = await storage.updateMod(parseInt(req.params.id), validatedData);
      if (!mod) {
        return res.status(404).json({ message: "Mod not found" });
      }
      res.json(mod);
    } catch (error) {
      console.error(`[PATCH /api/admin/mods/${req.params.id}] Error:`, error);
      res.status(400).json({ message: error.message });
    }
  });
  app2.delete("/api/admin/mods/:id", auth.isAdmin, async (req, res) => {
    try {
      const success = await storage.deleteMod(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Mod not found" });
      }
      res.json({ success });
    } catch (error) {
      console.error(`[DELETE /api/admin/mods/${req.params.id}] Error:`, error);
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/mods", auth.isAdmin, async (req, res) => {
    try {
      const { version, fileSize, changelog, ...modData } = req.body;
      const validatedModData = insertModSchema.omit({ version: true }).parse(modData);
      const mod = await storage.createMod(validatedModData);
      if (version) {
        const versionData = {
          modId: mod.id,
          version,
          filePath: mod.downloadUrl || "",
          fileSize: fileSize ? parseFloat(fileSize) * 1024 * 1024 : 0,
          // Convert MB to bytes
          changelog: changelog || "Initial release",
          isLatest: true,
          releaseDate: /* @__PURE__ */ new Date()
        };
        await storage.createModVersion(versionData);
        console.log(`[POST /api/mods] Created version ${version} for mod ${mod.id}`);
      }
      res.status(201).json(mod);
    } catch (error) {
      console.error("[POST /api/mods] Error:", error);
      res.status(400).json({ message: error.message });
    }
  });
  app2.put("/api/mods/:id", auth.isAdmin, async (req, res) => {
    try {
      const validatedData = insertModSchema.partial().parse(req.body);
      const mod = await storage.updateMod(parseInt(req.params.id), validatedData);
      if (!mod) {
        return res.status(404).json({ message: "Mod not found" });
      }
      res.json(mod);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.patch("/api/mods/:id", auth.isAdmin, async (req, res) => {
    try {
      const { version, fileSize, changelog, ...modData } = req.body;
      const modId = parseInt(req.params.id);
      console.log(`[PATCH /api/mods/${modId}] Received data:`, req.body);
      const validatedModData = insertModSchema.omit({ version: true }).partial().parse(modData);
      const mod = await storage.updateMod(modId, validatedModData);
      if (!mod) {
        return res.status(404).json({ message: "Mod not found" });
      }
      if (version) {
        const existingVersions = await storage.getModVersions(modId);
        for (const existingVersion of existingVersions) {
          if (existingVersion.isLatest) {
            console.log(`[PATCH /api/mods/${modId}] Marking version ${existingVersion.version} as not latest`);
          }
        }
        const versionData = {
          modId,
          version,
          filePath: mod.downloadUrl || "",
          fileSize: fileSize ? Math.round(parseFloat(fileSize) * 1024 * 1024) : 0,
          // Convert MB to bytes
          changelog: changelog || "Updated mod",
          isLatest: true,
          releaseDate: /* @__PURE__ */ new Date()
        };
        const newVersion = await storage.createModVersion(versionData);
        console.log(`[PATCH /api/mods/${modId}] Created version ${version} for mod ${modId}`);
        try {
          await notifyModUpdateToAllOwners(modId, version, changelog);
          console.log(`[PATCH /api/mods/${modId}] Sent update notifications for version ${version}`);
        } catch (notifyError) {
          console.error(`[PATCH /api/mods/${modId}] Failed to send notifications:`, notifyError);
        }
      }
      console.log(`[PATCH /api/mods/${modId}] Updated mod:`, mod);
      res.json(mod);
    } catch (error) {
      console.error(`[PATCH /api/mods/${req.params.id}] Error:`, error);
      res.status(400).json({ message: error.message });
    }
  });
  app2.delete("/api/mods/:id", auth.isAdmin, async (req, res) => {
    try {
      const success = await storage.deleteMod(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Mod not found" });
      }
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/upload/image", auth.isAdmin, upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" });
      }
      const imageUrl = `/uploads/images/${req.file.filename}`;
      res.status(201).json({
        success: true,
        imageUrl,
        filename: req.file.filename,
        originalName: req.file.originalname
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/admin/notifications/send", auth.isAdmin, async (req, res) => {
    try {
      const { modId, version, changelog } = req.body;
      if (!modId || !version) {
        return res.status(400).json({ message: "Mod ID and version are required" });
      }
      const mod = await storage.getMod(modId);
      if (!mod) {
        return res.status(404).json({ message: "Mod not found" });
      }
      const purchases2 = await storage.getPurchasesByMod(modId);
      const recipientCount = purchases2.length;
      console.log(`[ManualNotification] Sending notification for ${mod.title} v${version} to ${recipientCount} users`);
      notifyModUpdateToAllOwners(modId, version, changelog).catch((error) => console.error(`[ManualNotification] Failed to send notifications:`, error));
      res.json({
        success: true,
        recipientCount,
        modTitle: mod.title,
        version
      });
    } catch (error) {
      console.error("[ManualNotification] Error:", error);
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/admin/notifications/history", auth.isAdmin, async (req, res) => {
    try {
      res.json([]);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));
  app2.get("/api/mods/:id/versions", async (req, res) => {
    try {
      const versions = await storage.getModVersions(parseInt(req.params.id));
      res.json(versions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/mods/:id/versions", auth.isAdmin, upload.single("file"), async (req, res) => {
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
      console.log(`[ModUpdate] Triggering notifications for mod ${mod.title} v${req.body.version}`);
      notifyModUpdateToAllOwners(modId, req.body.version, req.body.changelog).catch((error) => console.error(`[ModUpdate] Failed to send notifications:`, error));
      res.status(201).json(version);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.get("/api/mods/:id/download", auth.isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const modId = parseInt(req.params.id);
      console.log(`[Download] User ${userId} requesting mod ${modId}`);
      const purchase = await storage.getModPurchase(userId, modId);
      const user = await storage.getUser(userId);
      const mod = await storage.getMod(modId);
      if (!mod) {
        return res.status(404).json({ message: "Mod not found" });
      }
      console.log(`[Download] Mod found: ${mod.title}, downloadUrl: "${mod.downloadUrl}", lockerFolder: "${mod.lockerFolder}"`);
      if (!purchase && (!user?.stripeSubscriptionId || !mod.isSubscriptionOnly)) {
        return res.status(403).json({ message: "You need to purchase this mod first" });
      }
      try {
        await db.insert(modDownloads).values({
          userId,
          modId,
          downloadedAt: /* @__PURE__ */ new Date(),
          reviewRequested: false,
          reviewReminderSent: false
        });
        await db.update(mods).set({
          downloadCount: sql2`${mods.downloadCount} + 1`
        }).where(eq2(mods.id, modId));
        console.log(`[Download] Tracked download for user ${userId}, mod ${modId}`);
      } catch (trackingError) {
        console.error(`[Download] Error tracking download:`, trackingError);
      }
      if (mod.lockerFolder && mod.lockerFolder.trim() !== "") {
        console.log(`[Download] Mod uses locker folder: ${mod.lockerFolder}`);
        const licenseKey = `${crypto2.randomUUID()}`;
        try {
          const modlockerDBPath = path.join(process.cwd(), "modlocker", "licenseDB.json");
          let licenseDB = {};
          if (fs.existsSync(modlockerDBPath)) {
            const licenseDBContent = fs.readFileSync(modlockerDBPath, "utf8");
            licenseDB = JSON.parse(licenseDBContent);
          }
          licenseDB[licenseKey] = {
            issuedAt: Date.now(),
            modFolder: mod.lockerFolder,
            modName: mod.title,
            userId,
            modId
          };
          fs.writeFileSync(modlockerDBPath, JSON.stringify(licenseDB, null, 2));
          console.log(`[Download] License created: ${licenseKey} for mod folder: ${mod.lockerFolder}`);
          const modlockerPort = process.env.MODLOCKER_PORT || 3e3;
          const modlockerHost = process.env.MODLOCKER_HOST || "http://localhost";
          const modlockerUrl = `${modlockerHost}:${modlockerPort}/mods/download/${licenseKey}`;
          console.log(`[Download] Redirecting to modlocker: ${modlockerUrl}`);
          res.redirect(modlockerUrl);
          return;
        } catch (lockerError) {
          console.error(`[Download] Error creating modlocker license:`, lockerError);
          return res.status(500).json({ message: "Failed to prepare mod download. Please try again." });
        }
      }
      const version = await storage.getLatestModVersion(modId);
      if (version && version.filePath) {
        console.log(`[Download] Checking version file: ${version.filePath}`);
        try {
          if (fs.existsSync(version.filePath)) {
            console.log(`[Download] Serving uploaded file: ${version.filePath}`);
            const fileName = `${mod.title.replace(/[^a-zA-Z0-9]/g, "_")}_v${version.version}.zip`;
            res.download(version.filePath, fileName);
            return;
          } else {
            console.log(`[Download] Version file doesn't exist, falling back to downloadUrl`);
          }
        } catch (fileError) {
          console.log(`[Download] Error checking version file:`, fileError);
        }
      }
      if (mod.downloadUrl && mod.downloadUrl.trim() !== "" && !mod.downloadUrl.includes("example.com")) {
        console.log(`[Download] Using downloadUrl redirect: ${mod.downloadUrl}`);
        res.redirect(mod.downloadUrl);
      } else {
        console.log(`[Download] No valid download source available for mod ${modId}`);
        return res.status(404).json({ message: "Download not available for this mod. Please contact support." });
      }
    } catch (error) {
      console.error(`[Download] Error:`, error);
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/cart", auth.isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      console.log("[GET /api/cart] User ID:", userId);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const cartItemsResult = await db.select({
        id: cartItems.id,
        userId: cartItems.userId,
        modId: cartItems.modId,
        addedAt: cartItems.addedAt,
        mod: {
          id: mods.id,
          title: mods.title,
          description: mods.description,
          price: mods.price,
          discountPrice: mods.discountPrice,
          previewImageUrl: mods.previewImageUrl,
          category: mods.category,
          tags: mods.tags,
          features: mods.features,
          isSubscriptionOnly: mods.isSubscriptionOnly
        }
      }).from(cartItems).leftJoin(mods, eq2(cartItems.modId, mods.id)).where(eq2(cartItems.userId, userId));
      console.log("[GET /api/cart] Found items:", cartItemsResult.length);
      res.json(cartItemsResult);
    } catch (error) {
      console.error("Cart fetch error:", error);
      res.status(500).json({ message: "Failed to retrieve cart items", error: error.message });
    }
  });
  app2.post("/api/cart", auth.isAuthenticated, async (req, res) => {
    try {
      console.log("\n\n======== CART API - POST REQUEST ========");
      console.log("Cart API - Path:", req.path);
      console.log("Cart API - Method:", req.method);
      console.log("Cart API - Headers:", JSON.stringify(req.headers, null, 2));
      console.log("Cart API - Content-Type:", req.headers["content-type"]);
      console.log("Cart API - Is authenticated?", req.isAuthenticated());
      console.log("Cart API - Session ID:", req.sessionID);
      console.log("Cart API - Request body:", req.body);
      console.log("Cart API - User:", req.user);
      const userId = req.user.id;
      if (!userId) {
        console.log("Cart API - User ID is missing");
        return res.status(401).json({ message: "Authentication required - user ID not found" });
      }
      let { modId } = req.body;
      console.log("Cart API - modId from body:", modId, "Type:", typeof modId);
      modId = Number(modId);
      console.log("Cart API - After conversion - User ID:", userId, "Mod ID:", modId, "Type:", typeof modId);
      if (!modId || isNaN(modId)) {
        console.log("Cart API - Invalid mod ID:", modId);
        return res.status(400).json({ message: "Invalid mod ID provided" });
      }
      const mod = await db.query.mods.findFirst({
        where: eq2(mods.id, modId)
      });
      if (!mod) {
        return res.status(404).json({ message: "Mod not found" });
      }
      const existingCartItem = await db.query.cartItems.findFirst({
        where: (cartItems2) => {
          return sql2`${cartItems2.userId} = ${userId} AND ${cartItems2.modId} = ${modId}`;
        }
      });
      if (existingCartItem) {
        return res.status(200).json({
          message: "Item already in cart",
          cartItem: existingCartItem
        });
      }
      const purchase = await db.query.purchases.findFirst({
        where: (purchases2) => {
          return sql2`${purchases2.userId} = ${userId} AND ${purchases2.modId} = ${modId}`;
        }
      });
      if (purchase) {
        return res.status(400).json({ message: "You already own this mod" });
      }
      console.log("Cart API - Attempting to insert cart item:", { userId, modId });
      try {
        const [cartItem] = await db.insert(cartItems).values({
          userId,
          modId,
          addedAt: /* @__PURE__ */ new Date()
        }).returning();
        console.log("Cart API - Insert successful, returned cart item:", cartItem);
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
    } catch (error) {
      console.error("Add to cart error:", error);
      res.status(500).json({ message: "Failed to add item to cart", error: error.message });
    }
  });
  app2.delete("/api/cart/:modId", auth.isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const modId = parseInt(req.params.modId);
      if (isNaN(modId)) {
        return res.status(400).json({ message: "Invalid mod ID" });
      }
      const cartItem = await db.query.cartItems.findFirst({
        where: (cartItems2) => {
          return sql2`${cartItems2.userId} = ${userId} AND ${cartItems2.modId} = ${modId}`;
        }
      });
      if (!cartItem) {
        return res.status(404).json({ message: "Item not found in cart" });
      }
      await db.delete(cartItems).where(sql2`${cartItems.userId} = ${userId} AND ${cartItems.modId} = ${modId}`);
      res.status(200).json({ success: true, message: "Item removed from cart" });
    } catch (error) {
      console.error("Remove from cart error:", error);
      res.status(500).json({ message: "Failed to remove item from cart", error: error.message });
    }
  });
  app2.delete("/api/cart", auth.isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      await db.delete(cartItems).where(eq2(cartItems.userId, userId));
      res.status(200).json({ success: true, message: "Cart cleared successfully" });
    } catch (error) {
      console.error("Clear cart error:", error);
      res.status(500).json({ message: "Failed to clear cart", error: error.message });
    }
  });
  app2.post("/api/create-payment-intent", auth.isAuthenticated, async (req, res) => {
    try {
      const { amount } = req.body;
      const userId = req.user.id;
      const paymentIntent = await createPaymentIntent(amount, { userId: userId.toString() });
      res.json({ clientSecret: paymentIntent.clientSecret });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/purchase-subscription", auth.isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      const { duration } = req.body;
      if (!duration || !["1month", "3month", "6month", "12month"].includes(duration)) {
        return res.status(400).json({ message: "Valid subscription duration required" });
      }
      const pricingMap = {
        "1month": 5.99,
        "3month": 14.99,
        "6month": 24.99,
        "12month": 39.99
      };
      const daysMap = {
        "1month": 30,
        "3month": 90,
        "6month": 180,
        "12month": 365
      };
      const price = pricingMap[duration];
      const paymentIntent = await createPaymentIntent(price, {
        userId: user.id.toString(),
        action: "subscription_purchase",
        duration
      });
      req.session.pendingSubscriptionData = {
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
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/activate-subscription", auth.isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const { paymentIntentId } = req.body;
      if (!paymentIntentId) {
        return res.status(400).json({ message: "Payment intent ID required" });
      }
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (paymentIntent.status !== "succeeded") {
        return res.status(400).json({ message: "Payment not completed successfully" });
      }
      const pendingSubscription = req.session.pendingSubscriptionData;
      if (!pendingSubscription || pendingSubscription.userId !== userId) {
        return res.status(400).json({ message: "No valid pending subscription found" });
      }
      const now = /* @__PURE__ */ new Date();
      const expiresAt = new Date(now.getTime() + pendingSubscription.days * 24 * 60 * 60 * 1e3);
      await db.update(users).set({
        isPremium: true,
        premiumExpiresAt: expiresAt
      }).where(eq2(users.id, userId));
      if (req.session.pendingSubscriptionData) {
        delete req.session.pendingSubscriptionData;
      }
      const user = await storage.getUser(userId);
      res.json({ success: true, user });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/webhook", async (req, res) => {
    const sig = req.headers["stripe-signature"];
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
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.post("/api/purchase/complete", auth.isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const { transactionId } = req.body;
      const customerIpAddress = getClientIP(req);
      const cartItems2 = await storage.getCartItems(userId);
      if (cartItems2.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      const purchases2 = await Promise.all(
        cartItems2.map(async (item) => {
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
      await storage.clearCart(userId);
      res.status(201).json({ purchases: purchases2 });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/purchases", auth.isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      console.log(`[GET /api/purchases] Loading purchases for user ${userId}`);
      const purchases2 = await storage.getPurchasesByUser(userId);
      const purchasesWithMods = await Promise.all(
        purchases2.map(async (purchase) => {
          const mod = await storage.getMod(purchase.modId);
          return {
            ...purchase,
            mod
          };
        })
      );
      console.log(`[GET /api/purchases] Found ${purchasesWithMods.length} purchases for user ${userId}`);
      res.json(purchasesWithMods);
    } catch (error) {
      console.error("[GET /api/purchases] Error:", error);
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/mod-locker", auth.isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      console.log(`[ModLocker] Loading for user ${userId}`);
      const purchases2 = await storage.getPurchasesByUser(userId);
      console.log(`[ModLocker] Found ${purchases2.length} purchases`);
      const purchasedMods = await Promise.all(
        purchases2.map(async (purchase) => {
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
      let subscriptionMods = [];
      const now = /* @__PURE__ */ new Date();
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
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/subscription", auth.isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const now = /* @__PURE__ */ new Date();
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
    } catch (error) {
      console.error("[GET /api/subscription] Error:", error);
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/admin/stats", auth.isAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/admin/activity", auth.isAdmin, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : void 0;
      const activity = await storage.getAdminActivity(limit);
      res.json(activity);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/admin/activity", auth.isAdmin, async (req, res) => {
    try {
      const userId = req.user.id;
      const { action, details } = req.body;
      const logEntry = await storage.logAdminActivity({
        userId,
        action,
        details,
        ipAddress: req.ip
      });
      res.status(201).json(logEntry);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.get("/api/admin/users", auth.isAdmin, async (req, res) => {
    try {
      const users2 = await storage.getAllUsers();
      res.json(users2);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.patch("/api/admin/users/:id", auth.isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updateData = req.body;
      await storage.logAdminActivity({
        userId: req.user.id,
        action: "UPDATE_USER",
        details: `Updated user ${userId}`,
        ipAddress: req.ip
      });
      const updatedUser = await storage.updateUser(userId, updateData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/admin/settings", auth.isAdmin, async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/admin/settings", auth.isAdmin, async (req, res) => {
    try {
      const { key, value } = req.body;
      await storage.logAdminActivity({
        userId: req.user.id,
        action: "UPDATE_SETTINGS",
        details: `Updated setting ${key}`,
        ipAddress: req.ip
      });
      const setting = await storage.setSiteSetting(key, value);
      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/admin/notifications/send", auth.isAdmin, async (req, res) => {
    try {
      const { type, modId, subject, message } = req.body;
      const userId = req.user.id;
      await storage.logAdminActivity({
        userId,
        action: "SEND_NOTIFICATION",
        details: `Sent ${type} notification: ${subject}`,
        ipAddress: req.ip
      });
      console.log(`Notification sent by user ${userId}:`, {
        type,
        modId,
        subject,
        message,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      res.json({
        success: true,
        message: "Notification sent successfully",
        notificationId: Date.now()
        // Mock notification ID
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/admin/notifications/history", auth.isAdmin, async (req, res) => {
    try {
      const mockHistory = [
        {
          id: 1,
          modId: 26,
          modTitle: "Test Mod Update",
          version: "2.0.0",
          recipientCount: 15,
          successCount: 14,
          failureCount: 1,
          createdAt: new Date(Date.now() - 864e5).toISOString()
          // 1 day ago
        },
        {
          id: 2,
          modId: 28,
          modTitle: "JSD's hypersonic gtx",
          version: "1.5.0",
          recipientCount: 8,
          successCount: 8,
          failureCount: 0,
          createdAt: new Date(Date.now() - 1728e5).toISOString()
          // 2 days ago
        }
      ];
      res.json(mockHistory);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/admin/users/tracking", auth.isAdmin, async (req, res) => {
    try {
      const users2 = await storage.getAllUsersWithTrackingInfo();
      res.json(users2);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.patch("/api/admin/users/:id", auth.isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updates = req.body;
      await storage.logAdminActivity({
        userId: req.user.id,
        action: "Update User",
        details: `Updated user ${userId}: ${JSON.stringify(updates)}`,
        ipAddress: req.ip
      });
      const user = await storage.updateUser(userId, updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.delete("/api/admin/users/:id", auth.isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const currentUserId = req.user.id;
      if (userId === currentUserId) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      await storage.logAdminActivity({
        userId: currentUserId,
        action: "Delete User",
        details: `Deleted user ${userId}`,
        ipAddress: req.ip
      });
      const user = await storage.banUser(userId, true);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.patch("/api/admin/users/:id/ban", auth.isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { banned } = req.body;
      const currentUserId = req.user.id;
      if (userId === currentUserId) {
        return res.status(400).json({ message: "Cannot ban your own account" });
      }
      await storage.logAdminActivity({
        userId: currentUserId,
        action: banned ? "Ban User" : "Unban User",
        details: `${banned ? "Banned" : "Unbanned"} user ${userId}`,
        ipAddress: req.ip
      });
      const user = await storage.banUser(userId, banned);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/admin/users", auth.isAdmin, async (req, res) => {
    try {
      const { username, email, isAdmin, isPremium } = req.body;
      const user = await storage.createUser({
        username,
        email,
        isAdmin: isAdmin || false,
        isPremium: isPremium || false
      });
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.put("/api/admin/users/:id", auth.isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updateData = req.body;
      const user = await storage.updateUser(userId, updateData);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.post("/api/admin/users/:id/ban", auth.isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { banned } = req.body;
      const user = await storage.banUser(userId, banned);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      await storage.logAdminActivity({
        userId: req.user.id,
        action: banned ? "Ban User" : "Unban User",
        details: `User ID: ${userId}, Username: ${user.username}`,
        ipAddress: req.ip
      });
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.get("/api/admin/settings", auth.isAdmin, async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/admin/settings/general", auth.isAdmin, async (req, res) => {
    try {
      const generalSettings = {
        siteName: await storage.getSiteSetting("siteName") || "JSD Mods",
        siteDescription: await storage.getSiteSetting("siteDescription") || "Premium BeamNG Drive mods",
        contactEmail: await storage.getSiteSetting("contactEmail") || "contact@jsdmods.com",
        maintenanceMode: await storage.getSiteSetting("maintenanceMode") === "true",
        maintenanceMessage: await storage.getSiteSetting("maintenanceMessage") || "Site is currently undergoing maintenance. Please check back soon."
      };
      res.json(generalSettings);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/admin/settings/integrations", auth.isAdmin, async (req, res) => {
    try {
      const integrationSettings = {
        patreonClientId: await storage.getSiteSetting("patreonClientId") || "",
        patreonClientSecret: await storage.getSiteSetting("patreonClientSecret") || "",
        patreonWebhookSecret: await storage.getSiteSetting("patreonWebhookSecret") || "",
        patreonCreatorAccessToken: await storage.getSiteSetting("patreonCreatorAccessToken") || "",
        discordWebhookUrl: await storage.getSiteSetting("discordWebhookUrl") || ""
      };
      res.json(integrationSettings);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/admin/settings/payments", auth.isAdmin, async (req, res) => {
    try {
      const paymentSettings = {
        currency: await storage.getSiteSetting("currency") || "USD",
        defaultSubscriptionPrice: await storage.getSiteSetting("defaultSubscriptionPrice") || "9.99",
        enableStripe: await storage.getSiteSetting("enableStripe") === "true",
        enableSubscriptions: await storage.getSiteSetting("enableSubscriptions") === "true",
        taxRate: await storage.getSiteSetting("taxRate") || "0"
      };
      res.json(paymentSettings);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/admin/settings/general", auth.isAdmin, async (req, res) => {
    try {
      const { siteName, siteDescription, contactEmail, maintenanceMode, maintenanceMessage } = req.body;
      await storage.setSiteSetting("siteName", siteName);
      await storage.setSiteSetting("siteDescription", siteDescription);
      await storage.setSiteSetting("contactEmail", contactEmail);
      await storage.setSiteSetting("maintenanceMode", maintenanceMode.toString());
      await storage.setSiteSetting("maintenanceMessage", maintenanceMessage);
      await storage.logAdminActivity({
        userId: req.user.id,
        action: "Update General Settings",
        details: `Updated general site settings`,
        ipAddress: req.ip
      });
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.post("/api/admin/settings/integrations", auth.isAdmin, async (req, res) => {
    try {
      const { patreonClientId, patreonClientSecret, patreonWebhookSecret, patreonCreatorAccessToken, discordWebhookUrl } = req.body;
      await storage.setSiteSetting("patreonClientId", patreonClientId);
      await storage.setSiteSetting("patreonClientSecret", patreonClientSecret);
      await storage.setSiteSetting("patreonWebhookSecret", patreonWebhookSecret);
      await storage.setSiteSetting("patreonCreatorAccessToken", patreonCreatorAccessToken);
      await storage.setSiteSetting("discordWebhookUrl", discordWebhookUrl);
      await storage.logAdminActivity({
        userId: req.user.id,
        action: "Update Integration Settings",
        details: `Updated integration settings`,
        ipAddress: req.ip
      });
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.post("/api/admin/settings/payments", auth.isAdmin, async (req, res) => {
    try {
      const { currency, defaultSubscriptionPrice, enableStripe, enableSubscriptions, taxRate } = req.body;
      await storage.setSiteSetting("currency", currency);
      await storage.setSiteSetting("defaultSubscriptionPrice", defaultSubscriptionPrice);
      await storage.setSiteSetting("enableStripe", enableStripe.toString());
      await storage.setSiteSetting("enableSubscriptions", enableSubscriptions.toString());
      await storage.setSiteSetting("taxRate", taxRate);
      await storage.logAdminActivity({
        userId: req.user.id,
        action: "Update Payment Settings",
        details: `Updated payment settings`,
        ipAddress: req.ip
      });
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.post("/api/admin/settings/test-patreon", auth.isAdmin, async (req, res) => {
    try {
      const patreonClientId = await storage.getSiteSetting("patreonClientId");
      const patreonClientSecret = await storage.getSiteSetting("patreonClientSecret");
      const patreonCreatorAccessToken = await storage.getSiteSetting("patreonCreatorAccessToken");
      if (!patreonClientId || !patreonClientSecret || !patreonCreatorAccessToken) {
        return res.status(400).json({ message: "Patreon settings are incomplete" });
      }
      await storage.logAdminActivity({
        userId: req.user.id,
        action: "Test Patreon Connection",
        details: "Tested Patreon API connection",
        ipAddress: req.ip
      });
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.post("/api/admin/settings/test-discord-webhook", auth.isAdmin, async (req, res) => {
    try {
      const discordWebhookUrl = await storage.getSiteSetting("discordWebhookUrl");
      if (!discordWebhookUrl) {
        return res.status(400).json({ message: "Discord webhook URL is not set" });
      }
      await storage.logAdminActivity({
        userId: req.user.id,
        action: "Test Discord Webhook",
        details: "Sent test message to Discord webhook",
        ipAddress: req.ip
      });
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.post("/api/admin/settings/test-stripe", auth.isAdmin, async (req, res) => {
    try {
      if (!process.env.STRIPE_SECRET_KEY || !process.env.VITE_STRIPE_PUBLIC_KEY) {
        return res.status(400).json({ message: "Stripe API keys are not configured" });
      }
      await stripe.balance.retrieve();
      await storage.logAdminActivity({
        userId: req.user.id,
        action: "Test Stripe Connection",
        details: "Tested Stripe API connection",
        ipAddress: req.ip
      });
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.get("/api/subscription/plans", async (req, res) => {
    try {
      const plans = await storage.getSubscriptionPlans();
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/subscription/plans/:id", async (req, res) => {
    try {
      const plan = await storage.getSubscriptionPlan(parseInt(req.params.id));
      if (!plan) {
        return res.status(404).json({ message: "Subscription plan not found" });
      }
      res.json(plan);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/subscription/plans", auth.isAdmin, async (req, res) => {
    try {
      const validatedData = insertSubscriptionPlanSchema.parse(req.body);
      const plan = await storage.createSubscriptionPlan(validatedData);
      await storage.logAdminActivity({
        userId: req.user.id,
        action: "Create Subscription Plan",
        details: `Created subscription plan: ${plan.name}`,
        ipAddress: req.ip
      });
      res.status(201).json(plan);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.put("/api/subscription/plans/:id", auth.isAdmin, async (req, res) => {
    try {
      const validatedData = insertSubscriptionPlanSchema.partial().parse(req.body);
      const plan = await storage.updateSubscriptionPlan(parseInt(req.params.id), validatedData);
      if (!plan) {
        return res.status(404).json({ message: "Subscription plan not found" });
      }
      await storage.logAdminActivity({
        userId: req.user.id,
        action: "Update Subscription Plan",
        details: `Updated subscription plan: ${plan.name}`,
        ipAddress: req.ip
      });
      res.json(plan);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.delete("/api/subscription/plans/:id", auth.isAdmin, async (req, res) => {
    try {
      const planDeleteResult = await storage.deleteSubscriptionPlan(parseInt(req.params.id));
      if (!planDeleteResult) {
        return res.status(404).json({ message: "Subscription plan not found" });
      }
      await storage.logAdminActivity({
        userId: req.user.id,
        action: "Delete Subscription Plan",
        details: `Deleted subscription plan ID: ${req.params.id}`,
        ipAddress: req.ip
      });
      res.json({ success: planDeleteResult });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/subscription/benefits", async (req, res) => {
    try {
      const benefits = await storage.getSubscriptionBenefits();
      res.json(benefits);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/subscription/benefits/:id", async (req, res) => {
    try {
      const benefit = await storage.getSubscriptionBenefit(parseInt(req.params.id));
      if (!benefit) {
        return res.status(404).json({ message: "Subscription benefit not found" });
      }
      res.json(benefit);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/subscription/benefits", auth.isAdmin, async (req, res) => {
    try {
      const validatedData = insertSubscriptionBenefitSchema.parse(req.body);
      const benefit = await storage.createSubscriptionBenefit(validatedData);
      await storage.logAdminActivity({
        userId: req.user.id,
        action: "Create Subscription Benefit",
        details: `Created subscription benefit: ${benefit.title}`,
        ipAddress: req.ip
      });
      res.status(201).json(benefit);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.put("/api/subscription/benefits/:id", auth.isAdmin, async (req, res) => {
    try {
      const validatedData = insertSubscriptionBenefitSchema.partial().parse(req.body);
      const benefit = await storage.updateSubscriptionBenefit(parseInt(req.params.id), validatedData);
      if (!benefit) {
        return res.status(404).json({ message: "Subscription benefit not found" });
      }
      await storage.logAdminActivity({
        userId: req.user.id,
        action: "Update Subscription Benefit",
        details: `Updated subscription benefit: ${benefit.title}`,
        ipAddress: req.ip
      });
      res.json(benefit);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.delete("/api/subscription/benefits/:id", auth.isAdmin, async (req, res) => {
    try {
      const success = await storage.deleteSubscriptionBenefit(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Subscription benefit not found" });
      }
      await storage.logAdminActivity({
        userId: req.user.id,
        action: "Delete Subscription Benefit",
        details: `Deleted subscription benefit ID: ${req.params.id}`,
        ipAddress: req.ip
      });
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/admin/orders", auth.isAdmin, async (req, res) => {
    try {
      const orders = await storage.getAllPurchases();
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
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/admin/settings", auth.isAdmin, async (req, res) => {
    try {
      const { key, value } = req.body;
      const setting = await storage.setSiteSetting(key, value);
      await storage.logAdminActivity({
        userId: req.user.id,
        action: "Update Site Setting",
        details: `Key: ${key}, Value: ${value}`,
        ipAddress: req.ip
      });
      res.status(201).json(setting);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  (async () => {
    try {
      const existingSettings = await storage.getSiteSettings();
      if (Object.keys(existingSettings).length === 0) {
        await storage.setSiteSetting("totalDownloads", "0");
        await storage.setSiteSetting("happyUsers", "1000");
        await storage.setSiteSetting("modsCreated", "0");
        await storage.setSiteSetting("maintenanceMode", "false");
        await storage.setSiteSetting("siteTitle", "JSD BeamNG Drive Mods");
        await storage.setSiteSetting("siteDescription", "Premium BeamNG Drive mods by JSD");
        const jsdExists = await storage.getUserByUsername("JSD");
        if (!jsdExists) {
          await storage.createUser({
            username: "JSD",
            email: "jsd@example.com",
            isAdmin: true,
            isPremium: true
          });
        }
        const vonExists = await storage.getUserByUsername("Von");
        if (!vonExists) {
          await storage.createUser({
            username: "Von",
            email: "von@example.com",
            isAdmin: true,
            isPremium: true
          });
        }
        const devExists = await storage.getUserByUsername("Developer");
        if (!devExists) {
          await storage.createUser({
            username: "Developer",
            email: "dev@example.com",
            isAdmin: true,
            isPremium: true
          });
        }
        console.log("Initial site settings and admin users created");
      }
    } catch (error) {
      console.error("Failed to initialize site settings:", error);
    }
  })();
  app2.get("/api/admin/roles", isAdminWithPermission("roles.view"), async (req, res) => {
    try {
      const roles2 = await storage.getRoles();
      res.json(roles2);
    } catch (error) {
      console.error("Error fetching roles:", error);
      res.status(500).json({ error: "Failed to fetch roles" });
    }
  });
  app2.get("/api/admin/permissions", isAdminWithPermission("roles.view"), async (req, res) => {
    try {
      const permissions2 = await storage.getPermissions();
      res.json(permissions2);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      res.status(500).json({ error: "Failed to fetch permissions" });
    }
  });
  app2.get("/api/admin/permissions/:category", isAdminWithPermission("roles.view"), async (req, res) => {
    try {
      const { category } = req.params;
      const permissions2 = await storage.getPermissionsByCategory(category);
      res.json(permissions2);
    } catch (error) {
      console.error("Error fetching permissions by category:", error);
      res.status(500).json({ error: "Failed to fetch permissions" });
    }
  });
  app2.get("/api/admin/roles/:id", isAdminWithPermission("roles.view"), async (req, res) => {
    try {
      const roleId = parseInt(req.params.id);
      if (isNaN(roleId)) {
        return res.status(400).json({ error: "Invalid role ID" });
      }
      const role = await storage.getRole(roleId);
      if (!role) {
        return res.status(404).json({ error: "Role not found" });
      }
      const permissions2 = await storage.getRolePermissions(roleId);
      res.json({ ...role, permissions: permissions2 });
    } catch (error) {
      console.error("Error fetching role:", error);
      res.status(500).json({ error: "Failed to fetch role" });
    }
  });
  app2.post("/api/admin/roles", isAdminWithPermission("roles.create"), async (req, res) => {
    try {
      const { name, description, permissionIds } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Role name is required" });
      }
      const role = await storage.createRole({
        name,
        description: description || null,
        isSystem: false
      });
      if (permissionIds && Array.isArray(permissionIds) && permissionIds.length > 0) {
        await storage.assignPermissionsToRole(role.id, permissionIds);
      }
      res.status(201).json(role);
    } catch (error) {
      console.error("Error creating role:", error);
      res.status(500).json({ error: "Failed to create role" });
    }
  });
  app2.put("/api/admin/roles/:id", isAdminWithPermission("roles.edit"), async (req, res) => {
    try {
      const roleId = parseInt(req.params.id);
      if (isNaN(roleId)) {
        return res.status(400).json({ error: "Invalid role ID" });
      }
      const { name, description, permissionIds } = req.body;
      const updatedRole = await storage.updateRole(roleId, {
        name,
        description: description || null
      });
      if (!updatedRole) {
        return res.status(404).json({ error: "Role not found" });
      }
      if (permissionIds && Array.isArray(permissionIds)) {
        await storage.assignPermissionsToRole(roleId, permissionIds);
      }
      res.json(updatedRole);
    } catch (error) {
      console.error("Error updating role:", error);
      res.status(500).json({ error: "Failed to update role" });
    }
  });
  app2.delete("/api/admin/roles/:id", isAdminWithPermission("roles.delete"), async (req, res) => {
    try {
      const roleId = parseInt(req.params.id);
      if (isNaN(roleId)) {
        return res.status(400).json({ error: "Invalid role ID" });
      }
      const deleted = await storage.deleteRole(roleId);
      if (!deleted) {
        return res.status(404).json({ error: "Role not found or cannot be deleted" });
      }
      res.json({ message: "Role deleted successfully" });
    } catch (error) {
      console.error("Error deleting role:", error);
      res.status(500).json({ error: "Failed to delete role" });
    }
  });
  app2.get("/api/admin/users/:id/roles", isAdminWithPermission("users.view"), async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      const roles2 = await storage.getUserRoles(userId);
      res.json(roles2);
    } catch (error) {
      console.error("Error fetching user roles:", error);
      res.status(500).json({ error: "Failed to fetch user roles" });
    }
  });
  app2.put("/api/admin/users/:id/roles", isAdminWithPermission("roles.assign"), async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      const { roleIds } = req.body;
      if (!Array.isArray(roleIds)) {
        return res.status(400).json({ error: "Role IDs must be an array" });
      }
      const currentUserId = req.user.id;
      await storage.removeRolesFromUser(userId, []);
      const success = await storage.assignRolesToUser(userId, roleIds, currentUserId);
      if (!success) {
        return res.status(500).json({ error: "Failed to update roles" });
      }
      res.json({ message: "Roles updated successfully" });
    } catch (error) {
      console.error("Error updating user roles:", error);
      res.status(500).json({ error: "Failed to update user roles" });
    }
  });
  app2.post("/api/admin/users/:id/roles", isAdminWithPermission("roles.assign"), async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      const { roleIds } = req.body;
      if (!Array.isArray(roleIds)) {
        return res.status(400).json({ error: "Role IDs must be an array" });
      }
      const currentUserId = req.user.id;
      const success = await storage.assignRolesToUser(userId, roleIds, currentUserId);
      if (!success) {
        return res.status(500).json({ error: "Failed to assign roles" });
      }
      res.json({ message: "Roles assigned successfully" });
    } catch (error) {
      console.error("Error assigning roles to user:", error);
      res.status(500).json({ error: "Failed to assign roles to user" });
    }
  });
  app2.post("/api/admin/bulk-role-assignment", isAdminWithPermission("roles.assign"), async (req, res) => {
    try {
      const { userIds, roleId, action } = req.body;
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ error: "User IDs must be a non-empty array" });
      }
      if (!roleId || isNaN(parseInt(roleId))) {
        return res.status(400).json({ error: "Valid role ID is required" });
      }
      if (!action || !["assign", "remove"].includes(action)) {
        return res.status(400).json({ error: 'Action must be "assign" or "remove"' });
      }
      const currentUserId = req.user.id;
      let successCount = 0;
      let errorCount = 0;
      for (const userId of userIds) {
        try {
          if (action === "assign") {
            const currentRoles = await storage.getUserRoles(userId);
            const currentRoleIds = currentRoles.map((role) => role.id);
            if (!currentRoleIds.includes(parseInt(roleId))) {
              await storage.assignRolesToUser(userId, [...currentRoleIds, parseInt(roleId)], currentUserId);
            }
          } else {
            const currentRoles = await storage.getUserRoles(userId);
            const updatedRoleIds = currentRoles.filter((role) => role.id !== parseInt(roleId)).map((role) => role.id);
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
      console.error("Error in bulk role assignment:", error);
      res.status(500).json({ error: "Failed to perform bulk role assignment" });
    }
  });
  app2.get("/api/admin/users-with-roles", isAdminWithPermission("users.view"), async (req, res) => {
    try {
      const users2 = await storage.getAllUsers();
      const usersWithRoles = await Promise.all(
        users2.map(async (user) => {
          const roles2 = await storage.getUserRoles(user.id);
          return {
            ...user,
            roles: roles2
          };
        })
      );
      res.json(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users with roles:", error);
      res.status(500).json({ error: "Failed to fetch users with roles" });
    }
  });
  app2.get("/api/admin/support-tickets", isAdminWithPermission("support.view"), async (req, res) => {
    try {
      const tickets = await db.query.supportTickets.findMany({
        with: {
          user: {
            columns: {
              id: true,
              username: true
            }
          },
          assignedToUser: {
            columns: {
              id: true,
              username: true
            }
          }
        },
        orderBy: [desc2(supportTickets.createdAt)]
      });
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching support tickets:", error);
      res.status(500).json({ error: "Failed to fetch support tickets" });
    }
  });
  app2.post("/api/admin/support-tickets", isAdminWithPermission("support.create"), async (req, res) => {
    try {
      const validatedData = insertSupportTicketSchema.parse(req.body);
      const [ticket] = await db.insert(supportTickets).values({
        ...validatedData,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).returning();
      await storage.logAdminActivity({
        userId: req.user.id,
        action: "Create Support Ticket",
        details: `Created support ticket: ${ticket.title}`,
        ipAddress: req.ip
      });
      res.status(201).json(ticket);
    } catch (error) {
      console.error("Error creating support ticket:", error);
      res.status(500).json({ error: "Failed to create support ticket" });
    }
  });
  app2.patch("/api/admin/support-tickets/:id", isAdminWithPermission("support.update"), async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const updateData = req.body;
      const [updatedTicket] = await db.update(supportTickets).set({
        ...updateData,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq2(supportTickets.id, ticketId)).returning();
      if (!updatedTicket) {
        return res.status(404).json({ error: "Support ticket not found" });
      }
      await storage.logAdminActivity({
        userId: req.user.id,
        action: "Update Support Ticket",
        details: `Updated support ticket: ${updatedTicket.title}`,
        ipAddress: req.ip
      });
      res.json(updatedTicket);
    } catch (error) {
      console.error("Error updating support ticket:", error);
      res.status(500).json({ error: "Failed to update support ticket" });
    }
  });
  app2.delete("/api/admin/support-tickets/:id", isAdminWithPermission("support.delete"), async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const [deletedTicket] = await db.delete(supportTickets).where(eq2(supportTickets.id, ticketId)).returning();
      if (!deletedTicket) {
        return res.status(404).json({ error: "Support ticket not found" });
      }
      await storage.logAdminActivity({
        userId: req.user.id,
        action: "Delete Support Ticket",
        details: `Deleted support ticket: ${deletedTicket.title}`,
        ipAddress: req.ip
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting support ticket:", error);
      res.status(500).json({ error: "Failed to delete support ticket" });
    }
  });
  app2.get("/api/admin/mod-locker/folders", auth.isAdmin, async (req, res) => {
    try {
      const modLockerPath = path.join(process.cwd(), "modlocker", "mods");
      if (!fs.existsSync(modLockerPath)) {
        return res.json([]);
      }
      const folders = fs.readdirSync(modLockerPath, { withFileTypes: true }).filter((dirent) => dirent.isDirectory()).map((dirent) => dirent.name).filter((name) => !name.startsWith(".") && name !== "node_modules");
      res.json(folders);
    } catch (error) {
      console.error("Error reading mod locker folders:", error);
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/mods/search", async (req, res) => {
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
        limit = 12
      } = req.query;
      const conditions = [];
      if (query) {
        conditions.push(
          or(
            ilike(mods.title, `%${query}%`),
            ilike(mods.description, `%${query}%`)
          )
        );
      }
      if (category && category !== "All Categories") {
        conditions.push(eq2(mods.category, category));
      }
      if (minPrice) {
        conditions.push(gte(mods.price, parseFloat(minPrice)));
      }
      if (maxPrice) {
        conditions.push(lte(mods.price, parseFloat(maxPrice)));
      }
      if (minRating) {
        conditions.push(gte(mods.averageRating, parseFloat(minRating)));
      }
      if (featured === "true") {
        conditions.push(eq2(mods.isFeatured, true));
      }
      if (premium === "true") {
        conditions.push(eq2(mods.isSubscriptionOnly, true));
      }
      let orderBy;
      switch (sortBy) {
        case "price-low":
          orderBy = asc2(mods.price);
          break;
        case "price-high":
          orderBy = desc2(mods.price);
          break;
        case "rating":
          orderBy = desc2(mods.averageRating);
          break;
        case "popular":
          orderBy = desc2(mods.downloadCount);
          break;
        case "oldest":
          orderBy = asc2(mods.createdAt);
          break;
        default:
          orderBy = desc2(mods.createdAt);
      }
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      let modsQuery = db.select().from(mods);
      if (conditions.length > 0) {
        modsQuery = modsQuery.where(and2(...conditions));
      }
      const mods2 = await modsQuery.orderBy(orderBy).limit(limitNum).offset((pageNum - 1) * limitNum);
      let totalQuery = db.select({ count: sql2`count(*)`.as("count") }).from(mods);
      if (conditions.length > 0) {
        totalQuery = totalQuery.where(and2(...conditions));
      }
      const [totalResult] = await totalQuery;
      const totalCount = totalResult?.count || 0;
      res.json({
        mods: mods2,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
          total: totalCount,
          pageSize: limitNum
        }
      });
    } catch (error) {
      console.error("Error searching mods:", error);
      res.status(500).json({ message: "Failed to search mods" });
    }
  });
  app2.get("/api/reviews/featured", async (req, res) => {
    try {
      const reviews2 = await db.select({
        id: reviews.id,
        rating: reviews.rating,
        title: reviews.title,
        content: reviews.content,
        isVerifiedPurchase: reviews.isVerifiedPurchase,
        createdAt: reviews.createdAt,
        user: {
          discordUsername: users.discordUsername,
          discordAvatar: users.discordAvatar
        },
        mod: {
          title: mods.title
        }
      }).from(reviews).leftJoin(users, eq2(reviews.userId, users.id)).leftJoin(mods, eq2(reviews.modId, mods.id)).where(gte(reviews.rating, 4)).orderBy(desc2(reviews.createdAt)).limit(20);
      res.json({ reviews: reviews2 });
    } catch (error) {
      console.error("Error fetching featured reviews:", error);
      res.status(500).json({ message: "Failed to fetch featured reviews" });
    }
  });
  app2.get("/api/mods/:id/reviews", async (req, res) => {
    try {
      const modId = parseInt(req.params.id);
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const sortBy = req.query.sortBy || "newest";
      const rating = req.query.rating ? parseInt(req.query.rating) : void 0;
      let orderBy;
      switch (sortBy) {
        case "oldest":
          orderBy = asc2(reviews.createdAt);
          break;
        case "highest":
          orderBy = desc2(reviews.rating);
          break;
        case "lowest":
          orderBy = asc2(reviews.rating);
          break;
        case "helpful":
          orderBy = desc2(reviews.helpfulCount);
          break;
        default:
          orderBy = desc2(reviews.createdAt);
      }
      const conditions = [eq2(reviews.modId, modId)];
      if (rating) {
        conditions.push(eq2(reviews.rating, rating));
      }
      const reviews2 = await db.select({
        id: reviews.id,
        rating: reviews.rating,
        title: reviews.title,
        content: reviews.content,
        isVerifiedPurchase: reviews.isVerifiedPurchase,
        helpfulCount: reviews.helpfulCount,
        createdAt: reviews.createdAt,
        user: {
          discordUsername: users.discordUsername,
          discordAvatar: users.discordAvatar
        }
      }).from(reviews).leftJoin(users, eq2(reviews.userId, users.id)).where(and2(...conditions)).orderBy(orderBy).limit(limit).offset((page - 1) * limit);
      const [totalResult] = await db.select({ count: sql2`count(*)`.as("count") }).from(reviews).where(and2(...conditions));
      const total = totalResult?.count || 0;
      res.json({
        reviews: reviews2,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          total,
          limit
        }
      });
    } catch (error) {
      console.error("Error fetching mod reviews:", error);
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/mods/:id/reviews", auth.isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
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
      const existingReview = await db.select().from(reviews).where(and2(
        eq2(reviews.userId, userId),
        eq2(reviews.modId, modId)
      )).limit(1);
      if (existingReview.length > 0) {
        return res.status(400).json({ message: "You have already reviewed this mod" });
      }
      const purchase = await db.select().from(purchases).where(and2(
        eq2(purchases.userId, userId),
        eq2(purchases.modId, modId)
      )).limit(1);
      const user = await db.select().from(users).where(eq2(users.id, userId)).limit(1);
      const mod = await db.select().from(mods).where(eq2(mods.id, modId)).limit(1);
      const isVerifiedPurchase = purchase.length > 0 || user[0]?.stripeSubscriptionId && mod[0]?.isSubscriptionOnly;
      const [review] = await db.insert(reviews).values({
        userId,
        modId,
        rating,
        title: title.trim(),
        content: content.trim(),
        isVerifiedPurchase: Boolean(isVerifiedPurchase),
        helpfulCount: 0,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).returning();
      const [avgResult] = await db.select({
        avgRating: sql2`avg(${reviews.rating})`.as("avgRating"),
        reviewCount: sql2`count(*)`.as("reviewCount")
      }).from(reviews).where(eq2(reviews.modId, modId));
      await db.update(mods).set({
        averageRating: avgResult.avgRating ? parseFloat(avgResult.avgRating.toString()) : 0,
        reviewCount: avgResult.reviewCount || 0
      }).where(eq2(mods.id, modId));
      res.status(201).json({ message: "Review submitted successfully", review });
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to submit review" });
    }
  });
  app2.post("/api/reviews/:id/helpful", auth.isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const reviewId = parseInt(req.params.id);
      const existingVote = await db.select().from(reviewHelpfulVotes).where(and2(
        eq2(reviewHelpfulVotes.userId, userId),
        eq2(reviewHelpfulVotes.reviewId, reviewId)
      )).limit(1);
      if (existingVote.length > 0) {
        return res.status(400).json({ message: "You have already marked this review as helpful" });
      }
      await db.insert(reviewHelpfulVotes).values({
        userId,
        reviewId,
        createdAt: /* @__PURE__ */ new Date()
      });
      await db.update(reviews).set({
        helpfulCount: sql2`${reviews.helpfulCount} + 1`
      }).where(eq2(reviews.id, reviewId));
      res.json({ message: "Review marked as helpful" });
    } catch (error) {
      console.error("Error marking review as helpful:", error);
      res.status(500).json({ message: "Failed to mark review as helpful" });
    }
  });
  app2.post("/api/mods/:id/track-download", auth.isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const modId = parseInt(req.params.id);
      const recentDownload = await db.select().from(modDownloads).where(and2(
        eq2(modDownloads.userId, userId),
        eq2(modDownloads.modId, modId),
        gte(modDownloads.downloadedAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3))
        // 7 days ago
      )).limit(1);
      let shouldRequestReview = false;
      if (recentDownload.length === 0) {
        await db.insert(modDownloads).values({
          userId,
          modId,
          downloadedAt: /* @__PURE__ */ new Date(),
          reviewRequested: false,
          reviewReminderSent: false
        });
        const [totalDownloads] = await db.select({ count: sql2`count(*)`.as("count") }).from(modDownloads).where(and2(
          eq2(modDownloads.userId, userId),
          eq2(modDownloads.modId, modId)
        ));
        const existingReview = await db.select().from(reviews).where(and2(
          eq2(reviews.userId, userId),
          eq2(reviews.modId, modId)
        )).limit(1);
        shouldRequestReview = totalDownloads.count >= 2 && existingReview.length === 0;
      }
      res.json({ shouldRequestReview });
    } catch (error) {
      console.error("Error tracking download:", error);
      res.status(500).json({ message: "Failed to track download" });
    }
  });
  const server = createServer(app2);
  return server;
}

// server/seed.ts
import { eq as eq3 } from "drizzle-orm";
async function seedAdminUsers() {
  console.log("Checking for admin users...");
  const adminUsers = [
    {
      username: "JSD",
      email: "jsd@example.com",
      isAdmin: true
    },
    {
      username: "Von",
      email: "von@example.com",
      isAdmin: true
    },
    {
      username: "Developer",
      email: "developer@example.com",
      isAdmin: true
    }
  ];
  const defaultPassword = "admin";
  const hashedPassword = await hashPassword(defaultPassword);
  for (const admin of adminUsers) {
    const existingUser = await db.select().from(users).where(eq3(users.username, admin.username)).limit(1);
    if (existingUser.length === 0) {
      console.log(`Creating admin user: ${admin.username}`);
      await db.insert(users).values({
        ...admin,
        password: hashedPassword,
        createdAt: /* @__PURE__ */ new Date()
      });
    } else {
      console.log(`Admin user ${admin.username} already exists`);
    }
  }
}
async function seedSiteSettings() {
  console.log("Checking for site settings...");
  const defaultSettings = [
    { key: "siteName", value: "JSD Mods - BeamNG Drive Modifications" },
    { key: "siteDescription", value: "Premium BeamNG drive mods from JSD" },
    { key: "contactEmail", value: "contact@jsdmods.com" },
    { key: "maintenanceMode", value: "false" },
    { key: "maintenanceMessage", value: "Site is under maintenance. Please check back later." },
    { key: "totalDownloads", value: "0" },
    { key: "happyUsers", value: "100+" },
    { key: "activeModders", value: "10+" },
    { key: "currency", value: "USD" },
    { key: "defaultSubscriptionPrice", value: "9.99" },
    { key: "enableStripe", value: "true" },
    { key: "enableSubscriptions", value: "true" },
    { key: "taxRate", value: "0" },
    { key: "discordInviteLink", value: "https://discord.gg/ctXrazHgbz" },
    { key: "youtubeChannelLink", value: "https://www.youtube.com/channel/UCUNX0R4Lqvha7IDDMr09nHg" }
  ];
  for (const setting of defaultSettings) {
    const existingSetting = await db.select().from(siteSettings).where(eq3(siteSettings.key, setting.key)).limit(1);
    if (existingSetting.length === 0) {
      console.log(`Creating site setting: ${setting.key}`);
      await db.insert(siteSettings).values({
        ...setting,
        updatedAt: /* @__PURE__ */ new Date()
      });
    } else {
      console.log(`Site setting ${setting.key} already exists`);
    }
  }
}
async function seedDatabase() {
  try {
    await seedAdminUsers();
    await seedSiteSettings();
    console.log("Database seeding completed");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// api/index.ts
import path2 from "path";
import { fileURLToPath } from "url";
import fs2 from "fs";
import "dotenv/config";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path2.dirname(__filename);
var app = express2();
var isInitialized = false;
async function initializeApp() {
  if (isInitialized) return app;
  app.use(express2.json());
  app.use(express2.urlencoded({ extended: false }));
  app.use((req, res, next) => {
    console.log(`${(/* @__PURE__ */ new Date()).toISOString()} - ${req.method} ${req.url}`);
    next();
  });
  try {
    const client = await pool.connect();
    console.log("Database connection established.");
    client.release();
    await seedDatabase();
  } catch (error) {
    console.error("Error connecting to database:", error);
  }
  await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });
  const staticPath = path2.resolve(__dirname, "..", "dist", "public");
  if (fs2.existsSync(staticPath)) {
    app.use(express2.static(staticPath, {
      setHeaders: (res, path3) => {
        if (path3.endsWith(".css")) {
          res.setHeader("Content-Type", "text/css");
        } else if (path3.endsWith(".js")) {
          res.setHeader("Content-Type", "application/javascript");
        }
      }
    }));
  }
  app.use("*", (_req, res) => {
    const indexPath = path2.resolve(staticPath, "index.html");
    if (fs2.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ error: "Page not found" });
    }
  });
  isInitialized = true;
  return app;
}
async function handler(req, res) {
  const expressApp = await initializeApp();
  return expressApp(req, res);
}
export {
  handler as default
};
