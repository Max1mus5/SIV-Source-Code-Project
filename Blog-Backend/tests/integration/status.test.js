const request = require('supertest');
const app     = require('../helpers/testApp');
const { setupTestDb, teardownTestDb } = require('../helpers/testDb');

beforeAll(async () => { await setupTestDb(); });
afterAll(async ()  => { await teardownTestDb(); });

describe('GET /status', () => {
    test('responde 200 con status OK', async () => {
        const res = await request(app).get('/status');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('OK');
    });

    test('responde con el mensaje del servicio', async () => {
        const res = await request(app).get('/status');
        expect(res.body.message).toMatch(/running/i);
    });
});

describe('GET /ruta-inexistente', () => {
    test('responde 404 para rutas no definidas', async () => {
        const res = await request(app).get('/this-does-not-exist');
        expect(res.status).toBe(404);
    });
});
