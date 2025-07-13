import { and, count, eq, gt, like, sql, desc, asc, isNull } from "drizzle-orm";
import { db } from "./db";
import * as schema from "@shared/schema";
import { 
  users,
  siteSettings,
  mods,
  modVersions,
  purchases,
  cartItems,
  adminActivityLog,
  subscriptionPlans,
  subscriptionBenefits,
  roles,
  permissions,
  rolePermissions,
  userRoles
} from "@shared/schema";

// Define interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<schema.User | undefined>;
  getUserByUsername(username: string): Promise<schema.User | undefined>;
  getUserByDiscordId(discordId: string): Promise<schema.User | undefined>;
  getUserByPatreonId(patreonId: string): Promise<schema.User | undefined>;
  getAllUsers(): Promise<schema.User[]>;
  getAllUsersWithTrackingInfo(): Promise<any[]>;
  createUser(user: schema.InsertUser): Promise<schema.User>;
  updateUser(id: number, user: Partial<schema.InsertUser>): Promise<schema.User | undefined>;
  updateUserStripeInfo(id: number, stripeInfo: { stripeCustomerId: string, stripeSubscriptionId: string }): Promise<schema.User | undefined>;
  updateUserPatreonInfo(id: number, patreonInfo: { patreonId: string, patreonTier: string }): Promise<schema.User | undefined>;
  updateUserTrackingInfo(id: number, trackingInfo: {
    lastIpAddress?: string;
    registrationIpAddress?: string;
    userAgent?: string;
    deviceType?: string;
    browser?: string;
    operatingSystem?: string;
    referrer?: string;
    country?: string;
    city?: string;
    region?: string;
    timezone?: string;
  }): Promise<schema.User | undefined>;
  incrementUserLogin(id: number): Promise<schema.User | undefined>;
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
  getPurchasesByMod(modId: number): Promise<schema.Purchase[]>;
  getAllPurchases(): Promise<schema.Purchase[]>;
  getModPurchase(userId: number, modId: number): Promise<schema.Purchase | undefined>;
  createPurchase(purchase: schema.InsertPurchase): Promise<schema.Purchase>;
  
  // Review and Forum operations removed
  
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
  
  // Subscription plans operations
  getSubscriptionPlans(): Promise<schema.SubscriptionPlan[]>;
  getSubscriptionPlan(id: number): Promise<schema.SubscriptionPlan | undefined>;
  createSubscriptionPlan(plan: schema.InsertSubscriptionPlan): Promise<schema.SubscriptionPlan>;
  updateSubscriptionPlan(id: number, plan: Partial<schema.InsertSubscriptionPlan>): Promise<schema.SubscriptionPlan | undefined>;
  deleteSubscriptionPlan(id: number): Promise<boolean>;
  
  // Subscription benefits operations
  getSubscriptionBenefits(): Promise<schema.SubscriptionBenefit[]>;
  getSubscriptionBenefit(id: number): Promise<schema.SubscriptionBenefit | undefined>;
  createSubscriptionBenefit(benefit: schema.InsertSubscriptionBenefit): Promise<schema.SubscriptionBenefit>;
  updateSubscriptionBenefit(id: number, benefit: Partial<schema.InsertSubscriptionBenefit>): Promise<schema.SubscriptionBenefit | undefined>;
  deleteSubscriptionBenefit(id: number): Promise<boolean>;

  // Role management operations
  getRoles(): Promise<schema.Role[]>;
  getRole(id: number): Promise<schema.Role | undefined>;
  createRole(role: schema.InsertRole): Promise<schema.Role>;
  updateRole(id: number, role: Partial<schema.InsertRole>): Promise<schema.Role | undefined>;
  deleteRole(id: number): Promise<boolean>;
  
  // Permission operations
  getPermissions(): Promise<schema.Permission[]>;
  getPermissionsByCategory(category: string): Promise<schema.Permission[]>;
  
  // Role permission operations
  getRolePermissions(roleId: number): Promise<schema.Permission[]>;
  assignPermissionsToRole(roleId: number, permissionIds: number[]): Promise<boolean>;
  removePermissionsFromRole(roleId: number, permissionIds: number[]): Promise<boolean>;
  
  // User role operations
  getUserRoles(userId: number): Promise<schema.Role[]>;
  getUserPermissions(userId: number): Promise<schema.Permission[]>;
  assignRolesToUser(userId: number, roleIds: number[], assignedBy: number): Promise<boolean>;
  removeRolesFromUser(userId: number, roleIds: number[]): Promise<boolean>;
  
  // Permission checking
  userHasPermission(userId: number, permissionName: string): Promise<boolean>;
  userHasAnyPermission(userId: number, permissionNames: string[]): Promise<boolean>;
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

  async getAllUsersWithTrackingInfo(): Promise<any[]> {
    const allUsers = await db.select().from(users).orderBy(users.username);
    
    // Calculate total spent for each user
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

  async updateUserTrackingInfo(id: number, trackingInfo: {
    lastIpAddress?: string;
    registrationIpAddress?: string;
    userAgent?: string;
    deviceType?: string;
    browser?: string;
    operatingSystem?: string;
    referrer?: string;
    country?: string;
    city?: string;
    region?: string;
    timezone?: string;
  }): Promise<schema.User | undefined> {
    const result = await db.update(users)
      .set(trackingInfo)
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async incrementUserLogin(id: number): Promise<schema.User | undefined> {
    const result = await db.update(users)
      .set({
        loginCount: sql`${users.loginCount} + 1`,
        lastLogin: new Date()
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
      result[setting.key] = setting.value || '';
    }
    
    return result;
  }
  
  async getSiteSetting(key: string): Promise<string | undefined> {
    const result = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    return result[0]?.value || undefined;
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

  async getMods(params?: { category?: string, searchTerm?: string, featured?: boolean, subscriptionOnly?: boolean, onlyPublished?: boolean, limit?: number, offset?: number }): Promise<schema.Mod[]> {
    let query = db.select().from(mods);
    
    const conditions = [];
    
    if (params) {
      if (params.category) {
        conditions.push(eq(mods.category, params.category));
      }
      
      if (params.searchTerm) {
        conditions.push(
          sql`${mods.title} LIKE ${'%' + params.searchTerm + '%'} OR ${mods.description} LIKE ${'%' + params.searchTerm + '%'}`
        );
      }
      
      if (params.featured !== undefined) {
        conditions.push(eq(mods.isFeatured, params.featured));
      }
      
      if (params.subscriptionOnly !== undefined) {
        conditions.push(eq(mods.isSubscriptionOnly, params.subscriptionOnly));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      if (params.limit) {
        query = query.limit(params.limit) as any;
      }
      
      if (params.offset) {
        query = query.offset(params.offset) as any;
      }
    }
    
    return await query;
  }

  async getModsCount(params?: { category?: string, searchTerm?: string, featured?: boolean, subscriptionOnly?: boolean }): Promise<number> {
    let query = db.select({ count: count() }).from(mods);
    
    const conditions = [];
    
    if (params) {
      if (params.category) {
        conditions.push(eq(mods.category, params.category));
      }
      
      if (params.searchTerm) {
        conditions.push(
          sql`${mods.title} LIKE ${'%' + params.searchTerm + '%'} OR ${mods.description} LIKE ${'%' + params.searchTerm + '%'}`
        );
      }
      
      if (params.featured !== undefined) {
        conditions.push(eq(mods.isFeatured, params.featured));
      }
      
      if (params.subscriptionOnly !== undefined) {
        conditions.push(eq(mods.isSubscriptionOnly, params.subscriptionOnly));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
    }
    
    const result = await query;
    return result[0]?.count || 0;
  }

  async createMod(mod: schema.InsertMod): Promise<schema.Mod> {
    // Ensure tags and features are properly typed as arrays
    const modData = {
      ...mod,
      tags: Array.isArray(mod.tags) ? mod.tags : (mod.tags ? [mod.tags] : []),
      features: Array.isArray(mod.features) ? mod.features : (mod.features ? [mod.features] : [])
    };
    
    const result = await db.insert(mods).values(modData).returning();
    return result[0];
  }

  async updateMod(id: number, mod: Partial<schema.InsertMod>): Promise<schema.Mod | undefined> {
    // Ensure tags and features are properly typed as arrays if they exist
    const modData: any = { ...mod };
    if (modData.tags) {
      modData.tags = Array.isArray(modData.tags) ? modData.tags : [modData.tags];
    }
    if (modData.features) {
      modData.features = Array.isArray(modData.features) ? modData.features : [modData.features];
    }
    
    const result = await db.update(mods).set(modData).where(eq(mods.id, id)).returning();
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

  async getPurchasesByMod(modId: number): Promise<schema.Purchase[]> {
    return await db.select().from(purchases).where(eq(purchases.modId, modId));
  }

  async getAllPurchases(): Promise<schema.Purchase[]> {
    return await db.select().from(purchases).orderBy(desc(purchases.purchaseDate));
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

  // Review operations and Forum operations removed

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
      query = query.limit(limit) as any;
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
      sum: sql`COALESCE(SUM(${purchases.price}), 0)`
    }).from(purchases);
    const totalRevenue = Number(revenueResult[0]?.sum) || 0;
    
    // Get active users (logged in within the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeUsersResult = await db.select({ count: count() })
      .from(users)
      .where(gt(users.lastLogin, thirtyDaysAgo));
    const activeUsers = activeUsersResult[0]?.count || 0;
    
    // Reviews system has been removed
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
  async getSubscriptionPlans(): Promise<schema.SubscriptionPlan[]> {
    return await db.select().from(subscriptionPlans).orderBy(subscriptionPlans.sortOrder);
  }
  
  async getSubscriptionPlan(id: number): Promise<schema.SubscriptionPlan | undefined> {
    const result = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id));
    return result[0];
  }
  
  async createSubscriptionPlan(plan: schema.InsertSubscriptionPlan): Promise<schema.SubscriptionPlan> {
    // Ensure features are properly typed as arrays
    const planData = {
      ...plan,
      features: Array.isArray(plan.features) ? plan.features : (plan.features ? [plan.features] : [])
    };
    
    const result = await db.insert(subscriptionPlans).values(planData).returning();
    return result[0];
  }
  
  async updateSubscriptionPlan(id: number, plan: Partial<schema.InsertSubscriptionPlan>): Promise<schema.SubscriptionPlan | undefined> {
    // Ensure features are properly typed as arrays if they exist
    const planData: any = { ...plan };
    if (planData.features) {
      planData.features = Array.isArray(planData.features) ? planData.features : [planData.features];
    }
    
    const result = await db.update(subscriptionPlans).set(planData).where(eq(subscriptionPlans.id, id)).returning();
    return result[0];
  }
  
  async deleteSubscriptionPlan(id: number): Promise<boolean> {
    const result = await db.delete(subscriptionPlans).where(eq(subscriptionPlans.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  // Subscription benefits operations
  async getSubscriptionBenefits(): Promise<schema.SubscriptionBenefit[]> {
    return await db.select().from(subscriptionBenefits).orderBy(subscriptionBenefits.sortOrder);
  }
  
  async getSubscriptionBenefit(id: number): Promise<schema.SubscriptionBenefit | undefined> {
    const result = await db.select().from(subscriptionBenefits).where(eq(subscriptionBenefits.id, id));
    return result[0];
  }
  
  async createSubscriptionBenefit(benefit: schema.InsertSubscriptionBenefit): Promise<schema.SubscriptionBenefit> {
    const result = await db.insert(subscriptionBenefits).values(benefit).returning();
    return result[0];
  }
  
  async updateSubscriptionBenefit(id: number, benefit: Partial<schema.InsertSubscriptionBenefit>): Promise<schema.SubscriptionBenefit | undefined> {
    const result = await db.update(subscriptionBenefits).set(benefit).where(eq(subscriptionBenefits.id, id)).returning();
    return result[0];
  }
  
  async deleteSubscriptionBenefit(id: number): Promise<boolean> {
    const result = await db.delete(subscriptionBenefits).where(eq(subscriptionBenefits.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Role management operations
  async getRoles(): Promise<schema.Role[]> {
    return await db.select().from(roles).orderBy(roles.name);
  }

  async getRole(id: number): Promise<schema.Role | undefined> {
    const result = await db.select().from(roles).where(eq(roles.id, id));
    return result[0];
  }

  async createRole(role: schema.InsertRole): Promise<schema.Role> {
    const result = await db.insert(roles).values(role).returning();
    return result[0];
  }

  async updateRole(id: number, role: Partial<schema.InsertRole>): Promise<schema.Role | undefined> {
    const result = await db.update(roles).set({
      ...role,
      updatedAt: new Date()
    }).where(eq(roles.id, id)).returning();
    return result[0];
  }

  async deleteRole(id: number): Promise<boolean> {
    // Don't allow deletion of system roles
    const roleToDelete = await this.getRole(id);
    if (roleToDelete?.isSystem) {
      return false;
    }
    
    // Remove all user assignments and role permissions first
    await db.delete(userRoles).where(eq(userRoles.roleId, id));
    await db.delete(rolePermissions).where(eq(rolePermissions.roleId, id));
    
    const result = await db.delete(roles).where(eq(roles.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Permission operations
  async getPermissions(): Promise<schema.Permission[]> {
    return await db.select().from(permissions).orderBy(permissions.category, permissions.action);
  }

  async getPermissionsByCategory(category: string): Promise<schema.Permission[]> {
    return await db.select().from(permissions).where(eq(permissions.category, category)).orderBy(permissions.action);
  }

  // Role permission operations
  async getRolePermissions(roleId: number): Promise<schema.Permission[]> {
    const result = await db.select({
      id: permissions.id,
      name: permissions.name,
      description: permissions.description,
      category: permissions.category,
      action: permissions.action,
      createdAt: permissions.createdAt
    })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(rolePermissions.roleId, roleId))
    .orderBy(permissions.category, permissions.action);
    
    return result;
  }

  async assignPermissionsToRole(roleId: number, permissionIds: number[]): Promise<boolean> {
    try {
      // Remove existing permissions first
      await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));
      
      // Add new permissions
      if (permissionIds.length > 0) {
        const assignments = permissionIds.map(permissionId => ({
          roleId,
          permissionId
        }));
        await db.insert(rolePermissions).values(assignments);
      }
      
      return true;
    } catch (error) {
      console.error('Error assigning permissions to role:', error);
      return false;
    }
  }

  async removePermissionsFromRole(roleId: number, permissionIds: number[]): Promise<boolean> {
    try {
      await db.delete(rolePermissions)
        .where(and(
          eq(rolePermissions.roleId, roleId),
          sql`${rolePermissions.permissionId} = ANY(${permissionIds})`
        ));
      return true;
    } catch (error) {
      console.error('Error removing permissions from role:', error);
      return false;
    }
  }

  // User role operations
  async getUserRoles(userId: number): Promise<schema.Role[]> {
    const result = await db.select({
      id: roles.id,
      name: roles.name,
      description: roles.description,
      isSystem: roles.isSystem,
      createdAt: roles.createdAt,
      updatedAt: roles.updatedAt
    })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userId, userId))
    .orderBy(roles.name);
    
    return result;
  }

  async getUserPermissions(userId: number): Promise<schema.Permission[]> {
    const result = await db.select({
      id: permissions.id,
      name: permissions.name,
      description: permissions.description,
      category: permissions.category,
      action: permissions.action,
      createdAt: permissions.createdAt
    })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .innerJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(userRoles.userId, userId))
    .orderBy(permissions.category, permissions.action);
    
    // Remove duplicates
    const uniquePermissions = result.filter((permission, index, self) =>
      index === self.findIndex(p => p.id === permission.id)
    );
    
    return uniquePermissions;
  }

  async assignRolesToUser(userId: number, roleIds: number[], assignedBy: number): Promise<boolean> {
    try {
      // Remove existing roles first
      await db.delete(userRoles).where(eq(userRoles.userId, userId));
      
      // Add new roles
      if (roleIds.length > 0) {
        const assignments = roleIds.map(roleId => ({
          userId,
          roleId,
          assignedBy
        }));
        await db.insert(userRoles).values(assignments);
      }
      
      return true;
    } catch (error) {
      console.error('Error assigning roles to user:', error);
      return false;
    }
  }

  async removeRolesFromUser(userId: number, roleIds: number[]): Promise<boolean> {
    try {
      await db.delete(userRoles)
        .where(and(
          eq(userRoles.userId, userId),
          sql`${userRoles.roleId} = ANY(${roleIds})`
        ));
      return true;
    } catch (error) {
      console.error('Error removing roles from user:', error);
      return false;
    }
  }

  // Permission checking
  async userHasPermission(userId: number, permissionName: string): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return userPermissions.some(permission => permission.name === permissionName);
  }

  async userHasAnyPermission(userId: number, permissionNames: string[]): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    const userPermissionNames = userPermissions.map(p => p.name);
    return permissionNames.some(permName => userPermissionNames.includes(permName));
  }
}

// Create storage instance
export const storage = new DatabaseStorage();
