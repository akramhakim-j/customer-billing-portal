/**
 * Token generator — for local development and Swagger testing only.
 * Usage: pnpm token:generate
 */
import { config } from 'dotenv';
import * as jwt from 'jsonwebtoken';

config();

const secret = process.env.JWT_SECRET;
if (!secret) {
  console.error('JWT_SECRET is not set in .env');
  process.exit(1);
}

const adminToken = jwt.sign({ sub: 'dev-admin', role: 'admin' }, secret, { expiresIn: '1d' });
const userToken = jwt.sign({ sub: 'dev-user', role: 'user' }, secret, { expiresIn: '1d' });

console.log('\n=== Development JWT Tokens (valid 24h) ===\n');
console.log('ADMIN token:');
console.log(adminToken);
console.log('\nUSER token:');
console.log(userToken);
console.log('\nPaste either token in Swagger → Authorize → Bearer <token>\n');
