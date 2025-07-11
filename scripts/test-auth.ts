import { hashPassword, comparePasswords } from "../server/auth";

async function testPasswords() {
  try {
    console.log("Testing password hashing and comparison...");
    
    // Test with a known password
    const testPassword = "admin123";
    const hashedPassword = await hashPassword(testPassword);
    
    console.log("Original password:", testPassword);
    console.log("Hashed password:", hashedPassword);
    
    // Test comparison
    const isValid = await comparePasswords(testPassword, hashedPassword);
    console.log("Password comparison result:", isValid);
    
    // Test with wrong password
    const isInvalid = await comparePasswords("wrongpassword", hashedPassword);
    console.log("Wrong password comparison result:", isInvalid);
    
  } catch (error) {
    console.error("Error testing passwords:", error);
  }
}

testPasswords().catch(console.error);
