import crypto from 'crypto';
import { promisify } from 'util';

// Password to hash
const password = 'admin123';

// Promisify scrypt
const scryptAsync = promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = await scryptAsync(password, salt, 64);
  return `${derivedKey.toString('hex')}.${salt}`;
}

// Hash the password and print it
hashPassword(password).then(hash => {
  console.log('Hashed password for insertion:');
  console.log(hash);
});