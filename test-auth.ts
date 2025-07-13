import { config } from 'dotenv';
config();

import { storage } from './server/storage.js';

async function testAuth() {
  try {
    console.log('Testing authentication...');
    
    // Test getUserByUsername
    const user = await storage.getUserByUsername('admin');
    console.log('Found user:', user ? { id: user.id, username: user.username, isAdmin: user.isAdmin } : 'Not found');
    
    // Test if user has a password
    if (user && user.password) {
      console.log('User has password hash:', user.password.substring(0, 20) + '...');
    } else {
      console.log('User has no password set');
    }
    
  } catch (error) {
    console.error('Auth test failed:', error);
  }
}

testAuth();