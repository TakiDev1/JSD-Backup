import { pgTable, text, serial, integer, doublePrecision, boolean, timestamp, json, primaryKey, date, varchar } from "drizzle-orm/pg-core";
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
  // Removed isPublished field as it's no longer needed
  downloadCount: integer("download_count").default(0),
  averageRating: doublePrecision("average_rating").default(0),
  isSubscriptionOnly: boolean("is_subscription_only").default(false),
  version: text("version").default("1.0.0"),
  releaseNotes: text("release_notes"),
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

// Define table relationships
export const usersRelations = relations(users, ({ many }) => ({
  purchases: many(purchases),
  cartItems: many(cartItems),
  adminLogs: many(adminActivityLog),
}));

export const modsRelations = relations(mods, ({ many }) => ({
  versions: many(modVersions),
  purchases: many(purchases),
  cartItems: many(cartItems),
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
