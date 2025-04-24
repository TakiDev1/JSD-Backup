import { seedDatabase } from "../server/seed";

async function seedAll() {
  try {
    // First run the main database seeding (users, categories, settings)
    console.log("Running main database seeding...");
    await seedDatabase();
    
    // Then import and run forum seeding
    console.log("Running forum content seeding...");
    await import("./seed-forum");
    
    // Finally import and run reviews seeding
    console.log("Running reviews seeding...");
    await import("./seed-reviews");
    
    console.log("✅ All seeding completed successfully!");
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  }
}

seedAll();