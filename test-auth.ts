import { config } from 'dotenv';
config();

import { storage } from './server/storage';
import { hashPassword } from './server/auth';

async function testAuth() {
  try {
    console.log('Testing authentication...');
    
    // Test getUserByUsername for JSD user
    const user = await storage.getUserByUsername('JSD');
    console.log('Found user:', user ? { id: user.id, username: user.username, isAdmin: user.isAdmin } : 'Not found');
    
    // Test if user has a password
    if (user && user.password) {
      console.log('User has password hash:', user.password.substring(0, 20) + '...');
    } else {
      console.log('User has no password set');
      
      // If no password, set a default password
      if (user) {
        console.log('Setting default password for admin user...');
        const hashedPassword = await hashPassword('admin123');
        await storage.updateUser(user.id, { password: hashedPassword });
        console.log('Password set successfully. Default password: admin123');
      }
    }
    
    // Test all users
    const allUsers = await storage.getAllUsers();
    console.log('\nAll users:');
    allUsers.forEach(u => {
      console.log(`- ${u.username} (ID: ${u.id}, Admin: ${u.isAdmin}, HasPassword: ${!!u.password})`);
    });
    
  } catch (error) {
    console.error('Auth test failed:', error);
  }
}

testAuth();