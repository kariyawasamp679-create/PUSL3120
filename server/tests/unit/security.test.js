import { hashPassword, comparePassword, generateToken, verifyToken } from '../../src/utils/security.js';

describe('Security Utility Unit Tests', () => {
  describe('Password Hashing', () => {
    it('should hash a plain text password with salt', () => {
      const plain = 'SecurePassword123!';
      const hashed = hashPassword(plain);

      expect(hashed).toBeDefined();
      expect(hashed).toContain(':');
      expect(hashed).not.toBe(plain);
    });

    it('should correctly verify valid password against hash', () => {
      const plain = 'SecretKey2026';
      const hashed = hashPassword(plain);

      expect(comparePassword(plain, hashed)).toBe(true);
    });

    it('should reject invalid password against hash', () => {
      const plain = 'SecretKey2026';
      const wrong = 'WrongKey2026';
      const hashed = hashPassword(plain);

      expect(comparePassword(wrong, hashed)).toBe(false);
    });
  });

  describe('JWT Token Handling', () => {
    it('should generate and verify a valid JWT token payload', () => {
      const payload = { id: 'user_123', name: 'Dr. Jenkins', role: 'doctor' };
      const token = generateToken(payload);

      expect(token).toBeDefined();
      expect(token.split('.').length).toBe(3);

      const decoded = verifyToken(token);
      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(payload.id);
      expect(decoded.name).toBe(payload.name);
      expect(decoded.role).toBe(payload.role);
    });

    it('should return null for malformed or tampered token', () => {
      const token = 'invalid.token.signature';
      const decoded = verifyToken(token);
      expect(decoded).toBeNull();
    });
  });
});
