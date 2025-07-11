import { pgTable, text, serial, integer, doublePrecision, boolean, timestamp, json, primaryKey, date, varchar, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
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
  operatingSystem: text("operating_system"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Site settings schema
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettings).omit({
  id: true,
  updatedAt: true,
});

// Mod schema
export const mods = pgTable("mods", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: doublePrecision("price").notNull(),
  discountPrice: doublePrecision("discount_price"),
  previewImageUrl: text("preview_image_url"),
  downloadUrl: text("download_url"),
  category: text("category").notNull(),
  tags: json("tags").$type<string[]>().default([]),
  features: json("features").$type<string[]>().default([]),
  isFeatured: boolean("is_featured").default(false),
  featured: boolean("featured").default(false), // Add featured column
  // Removed isPublished field as it's no longer needed
  downloadCount: integer("download_count").default(0),
  averageRating: doublePrecision("average_rating").default(0),
  reviewCount: integer("review_count").default(0), // Add reviewCount column
  isSubscriptionOnly: boolean("is_subscription_only").default(false),
  version: text("version").default("1.0.0"),
  releaseNotes: text("release_notes"),
  changelog: text("changelog").default(""),
  lockerFolder: text("locker_folder"), // Maps to mod locker folder name
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertModSchema = createInsertSchema(mods).omit({
  id: true,
  downloadCount: true,
  averageRating: true,
  createdAt: true,
  updatedAt: true,
});

// Mod version schema
export const modVersions = pgTable("mod_versions", {
  id: serial("id").primaryKey(),
  modId: integer("mod_id").notNull(),
  version: text("version").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size").notNull(),
  changelog: text("changelog"),
  isLatest: boolean("is_latest").default(true),
  releaseDate: timestamp("release_date").notNull().defaultNow(),
});

export const insertModVersionSchema = createInsertSchema(modVersions).omit({
  id: true,
  releaseDate: true,
});

// User purchases schema
export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  modId: integer("mod_id").notNull(),
  transactionId: text("transaction_id").notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  price: doublePrecision("price").notNull(),
  status: text("status").default("completed"),
  customerIpAddress: text("customer_ip_address"),
  purchaseDate: timestamp("purchase_date").notNull().defaultNow(),
});

export const insertPurchaseSchema = createInsertSchema(purchases).omit({
  id: true,
  purchaseDate: true,
});

// Note: Reviews, forum categories, forum threads, and forum replies have been removed

// Cart items schema
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  modId: integer("mod_id").notNull(),
  addedAt: timestamp("added_at").notNull().defaultNow(),
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  addedAt: true,
});

// Admin activity log
export const adminActivityLog = pgTable("admin_activity_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  action: text("action").notNull(),
  details: text("details"),
  ipAddress: text("ip_address"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertAdminActivityLogSchema = createInsertSchema(adminActivityLog).omit({
  id: true,
  timestamp: true,
});

// Reviews schema
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  modId: integer("mod_id").notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  title: text("title").notNull(),
  content: text("content").notNull(),
  isVerifiedPurchase: boolean("is_verified_purchase").default(false),
  helpfulCount: integer("helpful_count").default(0), // Change from isHelpful to helpfulCount
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Review helpful votes table
export const reviewHelpfulVotes = pgTable("review_helpful_votes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  reviewId: integer("review_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertReviewHelpfulVoteSchema = createInsertSchema(reviewHelpfulVotes).omit({
  id: true,
  createdAt: true,
});

// Mod downloads tracking
export const modDownloads = pgTable("mod_downloads", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  modId: integer("mod_id").notNull(),
  downloadedAt: timestamp("downloaded_at").notNull().defaultNow(),
  reviewRequested: boolean("review_requested").default(false),
  reviewReminderSent: boolean("review_reminder_sent").default(false),
});

export const insertModDownloadSchema = createInsertSchema(modDownloads).omit({
  id: true,
  downloadedAt: true,
});

// Define table relationships
export const usersRelations = relations(users, ({ many }) => ({
  purchases: many(purchases),
  cartItems: many(cartItems),
  adminLogs: many(adminActivityLog),
  reviews: many(reviews),
  modDownloads: many(modDownloads),
  reviewHelpfulVotes: many(reviewHelpfulVotes),
}));

export const modsRelations = relations(mods, ({ many }) => ({
  versions: many(modVersions),
  purchases: many(purchases),
  cartItems: many(cartItems),
  reviews: many(reviews),
  downloads: many(modDownloads),
}));

export const modVersionsRelations = relations(modVersions, ({ one }) => ({
  mod: one(mods, {
    fields: [modVersions.modId],
    references: [mods.id],
  }),
}));

export const purchasesRelations = relations(purchases, ({ one }) => ({
  user: one(users, {
    fields: [purchases.userId],
    references: [users.id],
  }),
  mod: one(mods, {
    fields: [purchases.modId],
    references: [mods.id],
  }),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id],
  }),
  mod: one(mods, {
    fields: [cartItems.modId],
    references: [mods.id],
  }),
}));

export const adminActivityLogRelations = relations(adminActivityLog, ({ one }) => ({
  user: one(users, {
    fields: [adminActivityLog.userId],
    references: [users.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one, many }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  mod: one(mods, {
    fields: [reviews.modId],
    references: [mods.id],
  }),
  helpfulVotes: many(reviewHelpfulVotes),
}));

export const reviewHelpfulVotesRelations = relations(reviewHelpfulVotes, ({ one }) => ({
  user: one(users, {
    fields: [reviewHelpfulVotes.userId],
    references: [users.id],
  }),
  review: one(reviews, {
    fields: [reviewHelpfulVotes.reviewId],
    references: [reviews.id],
  }),
}));

// Add modImages table for additional mod images
export const modImages = pgTable("mod_images", {
  id: serial("id").primaryKey(),
  modId: integer("mod_id").notNull(),
  imageUrl: text("image_url").notNull(),
  sortOrder: integer("sort_order").default(0),
  caption: text("caption"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertModImagesSchema = createInsertSchema(modImages).omit({
  id: true,
  createdAt: true,
});

export const modImagesRelations = relations(modImages, ({ one }) => ({
  mod: one(mods, {
    fields: [modImages.modId],
    references: [mods.id],
  }),
}));

// Add notification table for user notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").default("info"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Add mod requirements for compatibility information
export const modRequirements = pgTable("mod_requirements", {
  id: serial("id").primaryKey(),
  modId: integer("mod_id").notNull(),
  requirement: text("requirement").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertModRequirementsSchema = createInsertSchema(modRequirements).omit({
  id: true,
  createdAt: true,
});

export const modRequirementsRelations = relations(modRequirements, ({ one }) => ({
  mod: one(mods, {
    fields: [modRequirements.modId],
    references: [mods.id],
  }),
}));

// Subscription Plans schema
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: doublePrecision("price").notNull(),
  interval: text("interval").notNull().default("month"), // 'month' or 'year'
  features: jsonb("features").$type<string[]>().default([]),
  stripePriceId: text("stripe_price_id"),
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Subscription Plan Benefits schema
export const subscriptionBenefits = pgTable("subscription_benefits", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(), // Lucide icon name
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSubscriptionBenefitSchema = createInsertSchema(subscriptionBenefits).omit({
  id: true,
  createdAt: true,
});

// Define type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = z.infer<typeof insertSiteSettingsSchema>;

export type Mod = typeof mods.$inferSelect;
export type InsertMod = z.infer<typeof insertModSchema>;

export type ModVersion = typeof modVersions.$inferSelect;
export type InsertModVersion = z.infer<typeof insertModVersionSchema>;

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

export type AdminActivityLog = typeof adminActivityLog.$inferSelect;
export type InsertAdminActivityLog = z.infer<typeof insertAdminActivityLogSchema>;

export type ModImage = typeof modImages.$inferSelect;
export type InsertModImage = z.infer<typeof insertModImagesSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type ModRequirement = typeof modRequirements.$inferSelect;
export type InsertModRequirement = z.infer<typeof insertModRequirementsSchema>;

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;

export type SubscriptionBenefit = typeof subscriptionBenefits.$inferSelect;
export type InsertSubscriptionBenefit = z.infer<typeof insertSubscriptionBenefitSchema>;

// Role management schema
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  isSystem: boolean("is_system").default(false), // System roles can't be deleted
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertRoleSchema = createInsertSchema(roles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Permissions schema
export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  category: text("category").notNull(), // e.g., "users", "orders", "mods", "settings"
  action: text("action").notNull(), // e.g., "view", "create", "edit", "delete"
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPermissionSchema = createInsertSchema(permissions).omit({
  id: true,
  createdAt: true,
});

// Role permissions (many-to-many)
export const rolePermissions = pgTable("role_permissions", {
  roleId: integer("role_id").notNull(),
  permissionId: integer("permission_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.roleId, table.permissionId] }),
}));

export const insertRolePermissionSchema = createInsertSchema(rolePermissions).omit({
  createdAt: true,
});

// User roles (many-to-many)
export const userRoles = pgTable("user_roles", {
  userId: integer("user_id").notNull(),
  roleId: integer("role_id").notNull(),
  assignedBy: integer("assigned_by").notNull(), // Who assigned this role
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.roleId] }),
}));

export const insertUserRoleSchema = createInsertSchema(userRoles).omit({
  createdAt: true,
});

// Relations for role management
export const roleRelations = relations(roles, ({ many }) => ({
  rolePermissions: many(rolePermissions),
  userRoles: many(userRoles),
}));

export const permissionRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}));

export const rolePermissionRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id],
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
}));

export const userRoleRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
  assignedByUser: one(users, {
    fields: [userRoles.assignedBy],
    references: [users.id],
  }),
}));

// Support Tickets table
export const supportTickets = pgTable("support_tickets", {
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
  closedAt: timestamp("closed_at", { withTimezone: true }),
});

// Zod schemas for support tickets
export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Support tickets relations
export const supportTicketsRelations = relations(supportTickets, ({ one }) => ({
  user: one(users, {
    fields: [supportTickets.userId],
    references: [users.id],
  }),
  assignedToUser: one(users, {
    fields: [supportTickets.assignedTo],
    references: [users.id],
  }),
}));

// Export types for support tickets
export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;

// Export types for reviews
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type ReviewHelpfulVote = typeof reviewHelpfulVotes.$inferSelect;
export type InsertReviewHelpfulVote = z.infer<typeof insertReviewHelpfulVoteSchema>;

export type ModDownload = typeof modDownloads.$inferSelect;
export type InsertModDownload = z.infer<typeof insertModDownloadSchema>;

// Export types for role management (MISSING EXPORTS)
export type Role = typeof roles.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;

export type Permission = typeof permissions.$inferSelect;
export type InsertPermission = z.infer<typeof insertPermissionSchema>;

export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;

export type UserRole = typeof userRoles.$inferSelect;
export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;
