import { seedDatabase } from "../server/seed";
import { seedSubscriptions } from "./seed-subscriptions";

async function seedAll() {
  try {
    // First run the main database seeding (users, categories, settings)
    console.log("Running main database seeding...");
    await seedDatabase();
    
    // Then import and run forum seeding
    console.log("Running forum content seeding...");
    await import("./seed-forum");
    
    // Run reviews seeding
    console.log("Running reviews seeding...");
    await import("./seed-reviews");
    
    // Run subscription plans and benefits seeding
    console.log("Running subscription data seeding...");
    await seedSubscriptions();
    
    console.log("✅ All seeding completed successfully!");
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  }
}

seedAll();