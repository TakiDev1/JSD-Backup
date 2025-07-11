import { storage } from "../server/storage";
import { db } from "../server/db";
import { subscriptionPlans, subscriptionBenefits } from "../shared/schema";

/**
 * Seeds subscription plans and benefits into the database
 */
async function seedSubscriptions() {
  try {
    console.log("Seeding subscription data...");
    
    // Check if we already have subscription plans
    const existingPlans = await storage.getSubscriptionPlans();
    if (existingPlans.length > 0) {
      console.log(`Found ${existingPlans.length} existing subscription plans. Skipping seed.`);
      return;
    }
    
    // Create subscription plans
    const plans = [
      {
        name: "Monthly Premium",
        description: "Access to all premium mods for one month",
        price: 5.99,
        interval: "month",
        features: [
          "Access to all premium mods",
          "Early access to new releases",
          "No download limits",
          "Premium support"
        ],
        isActive: true,
        isFeatured: false,
        sortOrder: 1
      },
      {
        name: "Quarterly Premium",
        description: "Access to all premium mods for three months",
        price: 14.99,
        interval: "quarter",
        features: [
          "Access to all premium mods",
          "Early access to new releases",
          "No download limits",
          "Premium support",
          "Save 17% compared to monthly"
        ],
        isActive: true,
        isFeatured: true,
        sortOrder: 2
      },
      {
        name: "Annual Premium",
        description: "Access to all premium mods for a full year",
        price: 39.99,
        interval: "year",
        features: [
          "Access to all premium mods",
          "Early access to new releases",
          "No download limits",
          "Premium support",
          "Save 45% compared to monthly",
          "Exclusive annual subscriber mod packs"
        ],
        isActive: true,
        isFeatured: false,
        sortOrder: 3
      }
    ];
    
    // Insert the plans
    for (const plan of plans) {
      await storage.createSubscriptionPlan(plan);
      console.log(`Created subscription plan: ${plan.name}`);
    }
    
    // Check if we already have subscription benefits
    const existingBenefits = await storage.getSubscriptionBenefits();
    if (existingBenefits.length > 0) {
      console.log(`Found ${existingBenefits.length} existing subscription benefits. Skipping seed.`);
      return;
    }
    
    // Create subscription benefits
    const benefits = [
      {
        title: "Premium Mods Access",
        description: "Access our entire library of premium quality BeamNG mods",
        icon: "Lock",
        sortOrder: 1
      },
      {
        title: "Early Access",
        description: "Get new mods before they're available to the public",
        icon: "Clock",
        sortOrder: 2
      },
      {
        title: "Unlimited Downloads",
        description: "No daily download limits for premium subscribers",
        icon: "Download",
        sortOrder: 3
      },
      {
        title: "Priority Support",
        description: "Get priority customer support and mod assistance",
        icon: "HeadphonesIcon",
        sortOrder: 4
      },
      {
        title: "No Advertisements",
        description: "Enjoy an ad-free browsing experience on our platform",
        icon: "Ban",
        sortOrder: 5
      },
      {
        title: "Exclusive Content",
        description: "Access to subscriber-only mod packs and special releases",
        icon: "Gift",
        sortOrder: 6
      }
    ];
    
    // Insert the benefits
    for (const benefit of benefits) {
      await storage.createSubscriptionBenefit(benefit);
      console.log(`Created subscription benefit: ${benefit.title}`);
    }
    
    console.log("Subscription data seeding completed!");
  } catch (error) {
    console.error("Error seeding subscription data:", error);
    throw error;
  }
}

// For ESM compatibility, always run the seed when this file is executed directly
seedSubscriptions()
  .then(() => {
    console.log("Subscription seeding completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Subscription seeding failed:", error);
    process.exit(1);
  });

export { seedSubscriptions };