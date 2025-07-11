import { db } from "../server/db";
import { users } from "../shared/schema";
import { hashPassword } from "../server/auth";
import { eq } from "drizzle-orm";

async function resetAdminPassword() {
  try {
    console.log("Resetting admin password...");
    
    const newPassword = "admin123";
    const hashedPassword = await hashPassword(newPassword);
    
    // Update the admin user's password
    const result = await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.username, "admin"))
      .returning();
    
    if (result.length > 0) {
      console.log("Admin password reset successfully!");
      console.log("Username: admin");
      console.log("Password: admin123");
    } else {
      console.log("Admin user not found");
    }
  } catch (error) {
    console.error("Error resetting admin password:", error);
  }
}

resetAdminPassword().catch(console.error);
