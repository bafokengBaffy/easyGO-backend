const request = require('supertest');
const app = require('../../app');

describe('Auth routes', () => {
  it('returns 200 for valid login', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'demo@easygo.dev', password: 'password123' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({ success: true, user: expect.any(Object) }));
  });

  it('returns 401 for invalid login', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'wrong@easygo.dev', password: 'wrongpass' });

    expect(response.status).toBe(401);
    expect(response.body).toEqual(expect.objectContaining({ success: false }));
  });
});
