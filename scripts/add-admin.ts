import { db } from "../server/db";
import { users } from "../shared/schema";
import { hashPassword } from "../server/auth";

async function addAdminUser() {
  try {
    console.log("Creating admin user: Camoz");
    
    // Hash the password
    const password = "Admin123";
    const hashedPassword = await hashPassword(password);
    
    // Insert the new admin user
    const newUser = await db.insert(users).values({
      username: "Camoz",
      email: "camoz@example.com",
      password: hashedPassword,
      isAdmin: true,
      createdAt: new Date()
    }).returning();
    
    console.log("Admin user created successfully:", newUser[0].username);
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
}

// Run the function
addAdminUser().catch(console.error);