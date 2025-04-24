import crypto from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = await scryptAsync(password, salt, 64);
  return `${derivedKey.toString('hex')}.${salt}`;
}

async function generateHash() {
  const password = 'testpassword'; // The password we want to hash
  const hashed = await hashPassword(password);
  console.log(`Password: ${password}`);
  console.log(`Hashed: ${hashed}`);
}

generateHash();
