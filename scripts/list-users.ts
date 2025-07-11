import { db } from "../server/db";
import { users } from "../shared/schema";

async function listUsers() {
  try {
    console.log("Listing all users in the database:");
    
    const allUsers = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      isAdmin: users.isAdmin,
      createdAt: users.createdAt
    }).from(users);
    
    console.log(`Found ${allUsers.length} users:`);
    allUsers.forEach(user => {
      console.log(`- ${user.username} (${user.email}) - Admin: ${user.isAdmin} - Created: ${user.createdAt}`);
    });
  } catch (error) {
    console.error("Error listing users:", error);
  }
}

// Run the function
listUsers().catch(console.error);
