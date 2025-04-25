import { and, count, eq, gt, like, sql, desc, asc } from "drizzle-orm";
import { db } from "./db";
import * as schema from "@shared/schema";
import { 
  users,
  siteSettings,
  mods,
  modVersions,
  purchases,
  reviews,
  forumCategories,
  forumThreads,
  forumReplies,
  cartItems,
  adminActivityLog
} from "@shared/schema";

// Define interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<schema.User | undefined>;
  getUserByUsername(username: string): Promise<schema.User | undefined>;
  getUserByDiscordId(discordId: string): Promise<schema.User | undefined>;
  getUserByPatreonId(patreonId: string): Promise<schema.User | undefined>;
  getAllUsers(): Promise<schema.User[]>;
  createUser(user: schema.InsertUser): Promise<schema.User>;
  updateUser(id: number, user: Partial<schema.InsertUser>): Promise<schema.User | undefined>;
  updateUserStripeInfo(id: number, stripeInfo: { stripeCustomerId: string, stripeSubscriptionId: string }): Promise<schema.User | undefined>;
  updateUserPatreonInfo(id: number, patreonInfo: { patreonId: string, patreonTier: string }): Promise<schema.User | undefined>;
  banUser(id: number, banned: boolean): Promise<schema.User | undefined>;
  
  // Site settings operations
  getSiteSettings(): Promise<Record<string, string>>;
  getSiteSetting(key: string): Promise<string | undefined>;
  setSiteSetting(key: string, value: string): Promise<schema.SiteSetting>;
  
  // Mod operations
  getMod(id: number): Promise<schema.Mod | undefined>;
  getMods(params?: { category?: string, searchTerm?: string, featured?: boolean, subscriptionOnly?: boolean, onlyPublished?: boolean, limit?: number, offset?: number }): Promise<schema.Mod[]>;
  getModsCount(params?: { category?: string, searchTerm?: string, featured?: boolean, subscriptionOnly?: boolean, onlyPublished?: boolean }): Promise<number>;
  createMod(mod: schema.InsertMod): Promise<schema.Mod>;
  updateMod(id: number, mod: Partial<schema.InsertMod>): Promise<schema.Mod | undefined>;
  deleteMod(id: number): Promise<boolean>;
  
  // Mod version operations
  getModVersions(modId: number): Promise<schema.ModVersion[]>;
  getLatestModVersion(modId: number): Promise<schema.ModVersion | undefined>;
  createModVersion(version: schema.InsertModVersion): Promise<schema.ModVersion>;
  
  // Purchase operations
  getPurchasesByUser(userId: number): Promise<schema.Purchase[]>;
  getModPurchase(userId: number, modId: number): Promise<schema.Purchase | undefined>;
  createPurchase(purchase: schema.InsertPurchase): Promise<schema.Purchase>;
  
  // Review operations
  getReviewsByMod(modId: number): Promise<schema.Review[]>;
  getUserReview(userId: number, modId: number): Promise<schema.Review | undefined>;
  createReview(review: schema.InsertReview): Promise<schema.Review>;
  updateReview(id: number, review: Partial<schema.InsertReview>): Promise<schema.Review | undefined>;
  updateModAverageRating(modId: number): Promise<number>;
  
  // Forum operations
  getForumCategories(): Promise<schema.ForumCategory[]>;
  getForumThreads(categoryId: number): Promise<schema.ForumThread[]>;
  getForumThread(id: number): Promise<schema.ForumThread | undefined>;
  getForumReplies(threadId: number): Promise<schema.ForumReply[]>;
  createForumThread(thread: schema.InsertForumThread): Promise<schema.ForumThread>;
  createForumReply(reply: schema.InsertForumReply): Promise<schema.ForumReply>;
  
  // Cart operations
  getCartItems(userId: number): Promise<schema.CartItem[]>;
  addToCart(item: schema.InsertCartItem): Promise<schema.CartItem>;
  removeFromCart(userId: number, modId: number): Promise<boolean>;
  clearCart(userId: number): Promise<boolean>;
  
  // Admin operations
  logAdminActivity(activity: schema.InsertAdminActivityLog): Promise<schema.AdminActivityLog>;
  getAdminActivity(limit?: number): Promise<schema.AdminActivityLog[]>;
  getAdminStats(): Promise<{
    users: number;
    mods: number;
    purchases: number;
    revenue: number;
    activeUsers: number;
    pendingReviews: number;
  }>;
}

// Implement storage with PostgreSQL via drizzle
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<schema.User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<schema.User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async getUserByDiscordId(discordId: string): Promise<schema.User | undefined> {
    const result = await db.select().from(users).where(eq(users.discordId, discordId));
    return result[0];
  }

  async createUser(user: schema.InsertUser): Promise<schema.User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: number, user: Partial<schema.InsertUser>): Promise<schema.User | undefined> {
    const result = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return result[0];
  }

  async updateUserStripeInfo(id: number, stripeInfo: { stripeCustomerId: string, stripeSubscriptionId: string }): Promise<schema.User | undefined> {
    const result = await db.update(users)
      .set({
        stripeCustomerId: stripeInfo.stripeCustomerId,
        stripeSubscriptionId: stripeInfo.stripeSubscriptionId
      })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }
  
  async getUserByPatreonId(patreonId: string): Promise<schema.User | undefined> {
    const result = await db.select().from(users).where(eq(users.patreonId, patreonId));
    return result[0];
  }
  
  async getAllUsers(): Promise<schema.User[]> {
    return await db.select().from(users).orderBy(users.username);
  }

  async updateUserPatreonInfo(id: number, patreonInfo: { patreonId: string, patreonTier: string }): Promise<schema.User | undefined> {
    const result = await db.update(users)
      .set({
        patreonId: patreonInfo.patreonId,
        patreonTier: patreonInfo.patreonTier
      })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async banUser(id: number, banned: boolean): Promise<schema.User | undefined> {
    const result = await db.update(users)
      .set({ isBanned: banned })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }
  
  // Site settings operations
  async getSiteSettings(): Promise<Record<string, string>> {
    const settings = await db.select().from(siteSettings);
    const result: Record<string, string> = {};
    
    for (const setting of settings) {
      result[setting.key] = setting.value;
    }
    
    return result;
  }
  
  async getSiteSetting(key: string): Promise<string | undefined> {
    const result = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    return result[0]?.value;
  }
  
  async setSiteSetting(key: string, value: string): Promise<schema.SiteSetting> {
    const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    
    if (existing.length > 0) {
      const result = await db.update(siteSettings)
        .set({ value })
        .where(eq(siteSettings.key, key))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(siteSettings)
        .values({ key, value })
        .returning();
      return result[0];
    }
  }

  // Mod operations
  async getMod(id: number): Promise<schema.Mod | undefined> {
    const result = await db.select().from(mods).where(eq(mods.id, id));
    return result[0];
  }

  async getMods(params?: { category?: string, searchTerm?: string, featured?: boolean, subscriptionOnly?: boolean, limit?: number, offset?: number }): Promise<schema.Mod[]> {
    let query = db.select().from(mods);
    
    if (params) {
      if (params.category) {
        query = query.where(eq(mods.category, params.category));
      }
      
      if (params.searchTerm) {
        query = query.where(
          sql`${mods.title} LIKE ${'%' + params.searchTerm + '%'} OR ${mods.description} LIKE ${'%' + params.searchTerm + '%'}`
        );
      }
      
      if (params.featured !== undefined) {
        query = query.where(eq(mods.isFeatured, params.featured));
      }
      
      if (params.subscriptionOnly !== undefined) {
        query = query.where(eq(mods.isSubscriptionOnly, params.subscriptionOnly));
      }
      
      // Removed filter for isPublished since we show all mods now
      
      if (params.limit) {
        query = query.limit(params.limit);
      }
      
      if (params.offset) {
        query = query.offset(params.offset);
      }
    }
    
    return await query;
  }

  async getModsCount(params?: { category?: string, searchTerm?: string, featured?: boolean, subscriptionOnly?: boolean }): Promise<number> {
    let query = db.select({ count: count() }).from(mods);
    
    if (params) {
      if (params.category) {
        query = query.where(eq(mods.category, params.category));
      }
      
      if (params.searchTerm) {
        query = query.where(
          sql`${mods.title} LIKE ${'%' + params.searchTerm + '%'} OR ${mods.description} LIKE ${'%' + params.searchTerm + '%'}`
        );
      }
      
      if (params.featured !== undefined) {
        query = query.where(eq(mods.isFeatured, params.featured));
      }
      
      if (params.subscriptionOnly !== undefined) {
        query = query.where(eq(mods.isSubscriptionOnly, params.subscriptionOnly));
      }
      
      // Removed filter for isPublished
    }
    
    const result = await query;
    return result[0]?.count || 0;
  }

  async createMod(mod: schema.InsertMod): Promise<schema.Mod> {
    const result = await db.insert(mods).values(mod).returning();
    return result[0];
  }

  async updateMod(id: number, mod: Partial<schema.InsertMod>): Promise<schema.Mod | undefined> {
    const result = await db.update(mods).set(mod).where(eq(mods.id, id)).returning();
    return result[0];
  }

  async deleteMod(id: number): Promise<boolean> {
    const result = await db.delete(mods).where(eq(mods.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Mod version operations
  async getModVersions(modId: number): Promise<schema.ModVersion[]> {
    return await db.select().from(modVersions).where(eq(modVersions.modId, modId));
  }

  async getLatestModVersion(modId: number): Promise<schema.ModVersion | undefined> {
    const result = await db.select().from(modVersions)
      .where(and(eq(modVersions.modId, modId), eq(modVersions.isLatest, true)));
    return result[0];
  }

  async createModVersion(version: schema.InsertModVersion): Promise<schema.ModVersion> {
    // First, set all existing versions to non-latest
    await db.update(modVersions)
      .set({ isLatest: false })
      .where(eq(modVersions.modId, version.modId));
    
    // Insert the new version
    const result = await db.insert(modVersions).values(version).returning();
    return result[0];
  }

  // Purchase operations
  async getPurchasesByUser(userId: number): Promise<schema.Purchase[]> {
    return await db.select().from(purchases).where(eq(purchases.userId, userId));
  }

  async getModPurchase(userId: number, modId: number): Promise<schema.Purchase | undefined> {
    const result = await db.select().from(purchases)
      .where(and(eq(purchases.userId, userId), eq(purchases.modId, modId)));
    return result[0];
  }

  async createPurchase(purchase: schema.InsertPurchase): Promise<schema.Purchase> {
    const result = await db.insert(purchases).values(purchase).returning();
    
    // Update download count for the mod
    await db.update(mods)
      .set({ downloadCount: sql`${mods.downloadCount} + 1` })
      .where(eq(mods.id, purchase.modId));
    
    return result[0];
  }

  // Review operations
  async getReviewsByMod(modId: number): Promise<schema.Review[]> {
    return await db.select().from(reviews).where(eq(reviews.modId, modId));
  }

  async getUserReview(userId: number, modId: number): Promise<schema.Review | undefined> {
    const result = await db.select().from(reviews)
      .where(and(eq(reviews.userId, userId), eq(reviews.modId, modId)));
    return result[0];
  }

  async createReview(review: schema.InsertReview): Promise<schema.Review> {
    const result = await db.insert(reviews).values(review).returning();
    
    // Update the average rating for the mod
    await this.updateModAverageRating(review.modId);
    
    return result[0];
  }

  async updateReview(id: number, review: Partial<schema.InsertReview>): Promise<schema.Review | undefined> {
    const result = await db.update(reviews).set(review).where(eq(reviews.id, id)).returning();
    
    if (result[0]) {
      // Update the average rating for the mod
      await this.updateModAverageRating(result[0].modId);
    }
    
    return result[0];
  }

  async updateModAverageRating(modId: number): Promise<number> {
    const avgRatingResult = await db.select({
      avgRating: sql`AVG(${reviews.rating})`
    }).from(reviews).where(eq(reviews.modId, modId));
    
    const avgRating = avgRatingResult[0]?.avgRating || 0;
    
    await db.update(mods)
      .set({ averageRating: avgRating })
      .where(eq(mods.id, modId));
    
    return avgRating;
  }

  // Forum operations
  async getForumCategories(): Promise<schema.ForumCategory[]> {
    return await db.select().from(forumCategories).orderBy(forumCategories.order);
  }

  async getForumThreads(categoryId: number): Promise<schema.ForumThread[]> {
    return await db.select().from(forumThreads)
      .where(eq(forumThreads.categoryId, categoryId))
      .orderBy(sql`${forumThreads.isPinned} DESC, ${forumThreads.updatedAt} DESC`);
  }

  async getForumThread(id: number): Promise<schema.ForumThread | undefined> {
    const result = await db.select().from(forumThreads).where(eq(forumThreads.id, id));
    
    if (result[0]) {
      // Increment view count
      await db.update(forumThreads)
        .set({ viewCount: sql`${forumThreads.viewCount} + 1` })
        .where(eq(forumThreads.id, id));
    }
    
    return result[0];
  }

  async getForumReplies(threadId: number): Promise<schema.ForumReply[]> {
    return await db.select().from(forumReplies)
      .where(eq(forumReplies.threadId, threadId))
      .orderBy(forumReplies.createdAt);
  }

  async createForumThread(thread: schema.InsertForumThread): Promise<schema.ForumThread> {
    const result = await db.insert(forumThreads).values(thread).returning();
    return result[0];
  }

  async createForumReply(reply: schema.InsertForumReply): Promise<schema.ForumReply> {
    const result = await db.insert(forumReplies).values(reply).returning();
    
    // Update the thread's updated timestamp
    await db.update(forumThreads)
      .set({ updatedAt: new Date() })
      .where(eq(forumThreads.id, reply.threadId));
    
    return result[0];
  }

  // Cart operations
  async getCartItems(userId: number): Promise<schema.CartItem[]> {
    return await db.select().from(cartItems).where(eq(cartItems.userId, userId));
  }

  async addToCart(item: schema.InsertCartItem): Promise<schema.CartItem> {
    // Check if item already exists in cart
    const existing = await db.select().from(cartItems)
      .where(and(eq(cartItems.userId, item.userId), eq(cartItems.modId, item.modId)));
    
    if (existing.length > 0) {
      return existing[0];
    }
    
    const result = await db.insert(cartItems).values(item).returning();
    return result[0];
  }

  async removeFromCart(userId: number, modId: number): Promise<boolean> {
    const result = await db.delete(cartItems)
      .where(and(eq(cartItems.userId, userId), eq(cartItems.modId, modId)));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async clearCart(userId: number): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.userId, userId));
    // For PostgreSQL, use rowCount instead of changes
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  // Admin operations
  async logAdminActivity(activity: schema.InsertAdminActivityLog): Promise<schema.AdminActivityLog> {
    const result = await db.insert(adminActivityLog).values(activity).returning();
    return result[0];
  }
  
  async getAdminActivity(limit?: number): Promise<schema.AdminActivityLog[]> {
    let query = db.select().from(adminActivityLog).orderBy(desc(adminActivityLog.timestamp));
    
    if (limit) {
      query = query.limit(limit);
    }
    
    return await query;
  }
  
  async getAdminStats(): Promise<{
    users: number;
    mods: number;
    purchases: number;
    revenue: number;
    activeUsers: number;
    pendingReviews: number;
  }> {
    // Get total users
    const usersResult = await db.select({ count: count() }).from(users);
    const totalUsers = usersResult[0]?.count || 0;
    
    // Get total mods
    const modsResult = await db.select({ count: count() }).from(mods);
    const totalMods = modsResult[0]?.count || 0;
    
    // Get total purchases
    const purchasesResult = await db.select({ count: count() }).from(purchases);
    const totalPurchases = purchasesResult[0]?.count || 0;
    
    // Get total revenue
    const revenueResult = await db.select({
      sum: sql`SUM(${purchases.price})`
    }).from(purchases);
    const totalRevenue = revenueResult[0]?.sum || 0;
    
    // Get active users (logged in within the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeUsersResult = await db.select({ count: count() })
      .from(users)
      .where(gt(users.lastLogin, thirtyDaysAgo));
    const activeUsers = activeUsersResult[0]?.count || 0;
    
    // Get pending reviews (added in the last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const pendingReviewsResult = await db.select({ count: count() })
      .from(reviews)
      .where(gt(reviews.createdAt, sevenDaysAgo));
    const pendingReviews = pendingReviewsResult[0]?.count || 0;
    
    return {
      users: totalUsers,
      mods: totalMods,
      purchases: totalPurchases,
      revenue: totalRevenue,
      activeUsers,
      pendingReviews
    };
  }
}

// Create storage instance
export const storage = new DatabaseStorage();
