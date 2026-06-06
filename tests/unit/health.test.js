const request = require('supertest');
const app = require('../../app');

describe('Health API', () => {
  it('responds with 200 and correct payload for /api/v1/health', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        status: 'ok',
        service: 'EasyGo Web Backend',
        environment: expect.any(String),
        timestamp: expect.any(String),
      }),
    );
  });
});
