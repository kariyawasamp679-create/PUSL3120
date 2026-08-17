import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'medipulse_super_secret_jwt_key_2026_pusl3120';

/**
 * Hashes a plain password using PBKDF2 with a secure random salt.
 * Output format: salt:hash
 */
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Compares a plain password with a stored hash (salt:hash).
 */
export function comparePassword(password, storedPassword) {
  if (!storedPassword || !password) return false;

  // Handle PBKDF2 salt:hash format
  if (storedPassword.includes(':')) {
    const [salt, originalHash] = storedPassword.split(':');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === originalHash;
  }

  // Direct comparison fallback for plain values if any
  return password === storedPassword;
}

/**
 * Generates a signed JWT token
 */
export function generateToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + (7 * 24 * 60 * 60); // 7 days

  const claimPayload = Buffer.from(JSON.stringify({
    ...payload,
    iat: issuedAt,
    exp: expiresAt
  })).toString('base64url');

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${claimPayload}`)
    .digest('base64url');

  return `${header}.${claimPayload}.${signature}`;
}

/**
 * Verifies and decodes a JWT token
 */
export function verifyToken(token) {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');

    if (signature !== expectedSignature) {
      return null;
    }

    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      return null; // Expired
    }

    return decoded;
  } catch (err) {
    return null;
  }
}
