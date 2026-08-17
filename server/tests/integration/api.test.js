import request from 'supertest';
import app from '../../src/app.js';

describe('MediPulse 360 API Integration Tests', () => {
  describe('GET /api/health', () => {
    it('should return 200 OK with system status', async () => {
      const res = await request(app).get('/api/health');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.status).toBe('healthy');
      expect(res.body.system).toContain('MediPulse 360');
    });
  });

  describe('GET /api/departments', () => {
    it('should return 200 OK and departments list format', async () => {
      const res = await request(app).get('/api/departments');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.departments)).toBe(true);
    });
  });

  describe('GET /api/users/doctors', () => {
    it('should return 200 OK and list of available doctors', async () => {
      const res = await request(app).get('/api/users/doctors');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.doctors)).toBe(true);
    });
  });

  describe('POST /api/auth/login with invalid data', () => {
    it('should return 400 if credentials are missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('404 Route Handler', () => {
    it('should return 404 for undefined endpoints', async () => {
      const res = await request(app).get('/api/nonexistent-route');

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toContain('Resource Not Found');
    });
  });
});
