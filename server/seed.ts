import { db } from "./db";
import { users, siteSettings } from "@shared/schema";
import { hashPassword } from "./auth";
import { eq } from "drizzle-orm";

export async function seedAdminUsers() {
  console.log("Checking for admin users...");
  
  // Default admin users
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
  
  const defaultPassword = "admin"; // They will be prompted to change on first login
  const hashedPassword = await hashPassword(defaultPassword);
  
  // Check and create admin users
  for (const admin of adminUsers) {
    const existingUser = await db.select().from(users).where(eq(users.username, admin.username)).limit(1);
    
    if (existingUser.length === 0) {
      console.log(`Creating admin user: ${admin.username}`);
      await db.insert(users).values({
        ...admin,
        password: hashedPassword,
        createdAt: new Date()
      });
    } else {
      console.log(`Admin user ${admin.username} already exists`);
    }
  }
}

// Forum categories removed

export async function seedSiteSettings() {
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
  
  // Check and create site settings
  for (const setting of defaultSettings) {
    const existingSetting = await db.select().from(siteSettings).where(eq(siteSettings.key, setting.key)).limit(1);
    
    if (existingSetting.length === 0) {
      console.log(`Creating site setting: ${setting.key}`);
      await db.insert(siteSettings).values({
        ...setting,
        updatedAt: new Date()
      });
    } else {
      console.log(`Site setting ${setting.key} already exists`);
    }
  }
}

export async function seedDatabase() {
  try {
    await seedAdminUsers();
    // Forum categories removed
    await seedSiteSettings();
    console.log("Database seeding completed");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}