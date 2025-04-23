import { sqliteTable, text, integer, real, blob } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  email: text("email"),
  discordId: text("discord_id").unique(),
  discordUsername: text("discord_username"),
  discordAvatar: text("discord_avatar"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  isAdmin: integer("is_admin", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  lastLogin: integer("last_login", { mode: "timestamp" }),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Mod schema
export const mods = sqliteTable("mods", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: real("price").notNull(),
  discountPrice: real("discount_price"),
  thumbnail: text("thumbnail").notNull(),
  category: text("category").notNull(),
  tags: text("tags", { mode: "json" }).$type<string[]>().default([]),
  featured: integer("featured", { mode: "boolean" }).default(false),
  downloadCount: integer("download_count").default(0),
  averageRating: real("average_rating").default(0),
  isSubscriptionOnly: integer("is_subscription_only", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const insertModSchema = createInsertSchema(mods).omit({
  id: true,
  downloadCount: true,
  averageRating: true,
  createdAt: true,
  updatedAt: true,
});

// Mod version schema
export const modVersions = sqliteTable("mod_versions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  modId: integer("mod_id").notNull(),
  version: text("version").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size").notNull(),
  changelog: text("changelog"),
  isLatest: integer("is_latest", { mode: "boolean" }).default(true),
  releaseDate: integer("release_date", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const insertModVersionSchema = createInsertSchema(modVersions).omit({
  id: true,
  releaseDate: true,
});

// User purchases schema
export const purchases = sqliteTable("purchases", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  modId: integer("mod_id").notNull(),
  transactionId: text("transaction_id").notNull(),
  price: real("price").notNull(),
  purchaseDate: integer("purchase_date", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const insertPurchaseSchema = createInsertSchema(purchases).omit({
  id: true,
  purchaseDate: true,
});

// Reviews schema
export const reviews = sqliteTable("reviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  modId: integer("mod_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Forum categories schema
export const forumCategories = sqliteTable("forum_categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  order: integer("order").default(0),
});

export const insertForumCategorySchema = createInsertSchema(forumCategories).omit({
  id: true,
});

// Forum threads schema
export const forumThreads = sqliteTable("forum_threads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  categoryId: integer("category_id").notNull(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isPinned: integer("is_pinned", { mode: "boolean" }).default(false),
  isLocked: integer("is_locked", { mode: "boolean" }).default(false),
  viewCount: integer("view_count").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const insertForumThreadSchema = createInsertSchema(forumThreads).omit({
  id: true,
  viewCount: true,
  createdAt: true,
  updatedAt: true,
});

// Forum replies schema
export const forumReplies = sqliteTable("forum_replies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  threadId: integer("thread_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const insertForumReplySchema = createInsertSchema(forumReplies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Cart items schema
export const cartItems = sqliteTable("cart_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  modId: integer("mod_id").notNull(),
  addedAt: integer("added_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  addedAt: true,
});

// Define type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Mod = typeof mods.$inferSelect;
export type InsertMod = z.infer<typeof insertModSchema>;

export type ModVersion = typeof modVersions.$inferSelect;
export type InsertModVersion = z.infer<typeof insertModVersionSchema>;

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type ForumCategory = typeof forumCategories.$inferSelect;
export type InsertForumCategory = z.infer<typeof insertForumCategorySchema>;

export type ForumThread = typeof forumThreads.$inferSelect;
export type InsertForumThread = z.infer<typeof insertForumThreadSchema>;

export type ForumReply = typeof forumReplies.$inferSelect;
export type InsertForumReply = z.infer<typeof insertForumReplySchema>;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
