jest.mock('axios');
const axios = require('axios');

const request = require('supertest');
const app = require('../helpers/testApp');
const { setupTestDb, teardownTestDb } = require('../helpers/testDb');
const { createTestUser } = require('../helpers/authHelper');
const { Posts } = require('../../connection/db/schemas/posts-schema/postSchema');

const setupAxiosMocks = () => {
    const mockBlockHash = `test_block_hash_${Date.now()}_${'a'.repeat(20)}`;
    const mockBlockIndex = Math.floor(Math.random() * 1000) + 1;

    axios.post.mockImplementation((url) => {
        if (url.includes('create-transaction')) {
            return Promise.resolve({
                data: { hash: mockBlockHash, transaction: { autor: 1, content: 'test' } }
            });
        }
        if (url.includes('mine-block')) {
            return Promise.resolve({
                data: {
                    index: mockBlockIndex,
                    block: { hash: mockBlockHash, index: mockBlockIndex }
                }
            });
        }
        return Promise.resolve({ data: {} });
    });

    axios.delete.mockResolvedValue({ data: { success: true } });

    axios.get.mockResolvedValue({
        data: { hash: mockBlockHash, from: 1, content: 'test content' }
    });

    return { mockBlockHash, mockBlockIndex };
};

const seedPost = async (authorId, overrides = {}) => {
    return Posts.create({
        autor_id:       authorId,
        date:           new Date().toISOString(),
        title:          overrides.title   || 'Post de integración',
        content:        overrides.content || 'Contenido de prueba del post',
        likes:          0,
        post_image:     '',
        hashBlockchain: overrides.hash    || `fixed_hash_${Date.now()}`,
        comments:       0,
    });
};

beforeAll(async () => { await setupTestDb(); });
afterAll(async ()  => { await teardownTestDb(); });

describe('Posts — POST /post/create-new-publication', () => {
    let user, token;

    beforeAll(async () => {
        ({ user, token } = await createTestUser());
    });

    beforeEach(() => {
        setupAxiosMocks();
    });

    afterEach(async () => {
        await Posts.destroy({ where: {} });
        jest.clearAllMocks();
    });

    test('crea un post y retorna 201', async () => {
        const res = await request(app)
            .post('/post/create-new-publication')
            .set('Authorization', `Bearer ${token}`)
            .send({
                autor:   user.id,
                title:   'Mi primer post',
                content: 'Contenido completo del post de prueba',
                image:   'https://example.com/image.jpg',
            });
        expect(res.status).toBe(201);
    });

    test('el post se guarda en la DB con el hash de blockchain', async () => {
        const { mockBlockHash } = setupAxiosMocks();
        await request(app)
            .post('/post/create-new-publication')
            .set('Authorization', `Bearer ${token}`)
            .send({
                autor:   user.id,
                title:   'Post con hash',
                content: 'Contenido',
                image:   'img.jpg',
            });
        const post = await Posts.findOne({ where: { autor_id: user.id } });
        expect(post).not.toBeNull();
        expect(post.hashBlockchain).toBeDefined();
        expect(post.hashBlockchain.length).toBeGreaterThan(0);
    });

    test('la respuesta incluye status success y los datos del post', async () => {
        const res = await request(app)
            .post('/post/create-new-publication')
            .set('Authorization', `Bearer ${token}`)
            .send({
                autor:   user.id,
                title:   'Título del post',
                content: 'Contenido del post',
                image:   'image.png',
            });
        expect(res.body.status).toBe('success');
        expect(res.body.data).toBeDefined();
    });

    test('rechaza creación sin el campo title → 500', async () => {
        const res = await request(app)
            .post('/post/create-new-publication')
            .set('Authorization', `Bearer ${token}`)
            .send({ autor: user.id, content: 'sin título', image: 'img.jpg' });
        expect(res.status).toBeGreaterThanOrEqual(400);
    });

    test('rechaza si el servidor blockchain falla (axios rechaza) → 500', async () => {
        axios.post.mockRejectedValue(new Error('Blockchain server unavailable'));
        const res = await request(app)
            .post('/post/create-new-publication')
            .set('Authorization', `Bearer ${token}`)
            .send({
                autor:   user.id,
                title:   'Post sin blockchain',
                content: 'contenido',
                image:   'img.jpg',
            });
        expect(res.status).toBe(500);
    });

    test('retorna 401 sin token', async () => {
        const res = await request(app)
            .post('/post/create-new-publication')
            .send({ autor: user.id, title: 'Test', content: 'Test', image: 'img.jpg' });
        expect(res.status).toBe(401);
    });
});

describe('Posts — GET /post/my-feed', () => {
    let user, token;

    beforeAll(async () => {
        ({ user, token } = await createTestUser());
        // Insertar posts directamente sin blockchain
        await seedPost(user.id, { title: 'Post 1' });
        await seedPost(user.id, { title: 'Post 2' });
        await seedPost(user.id, { title: 'Post 3' });
    });

    afterAll(async () => {
        await Posts.destroy({ where: {} });
    });

    test('retorna 200 con la lista de posts', async () => {
        const res = await request(app)
            .get('/post/my-feed')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
    });

    test('retorna al menos 3 posts en el feed', async () => {
        const res = await request(app)
            .get('/post/my-feed')
            .set('Authorization', `Bearer ${token}`);
        expect(res.body.data).toBeDefined();
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThanOrEqual(3);
    });

    test('los posts incluyen los campos básicos', async () => {
        const res = await request(app)
            .get('/post/my-feed')
            .set('Authorization', `Bearer ${token}`);
        const post = res.body.data[0];
        expect(post.title).toBeDefined();
        expect(post.content).toBeDefined();
        expect(post.hashBlockchain).toBeDefined();
        expect(post.autor_id).toBeDefined();
    });

    test('retorna 401 sin token', async () => {
        const res = await request(app).get('/post/my-feed');
        expect(res.status).toBe(401);
    });
});

describe('Posts — PUT /post/upload-image/:postId', () => {
    let user, token, post;

    beforeAll(async () => {
        ({ user, token } = await createTestUser());
        post = await seedPost(user.id);
    });

    afterAll(async () => {
        await Posts.destroy({ where: {} });
    });

    test('retorna 400 si no se envía ninguna imagen (sin archivo multipart)', async () => {
        const res = await request(app)
            .put(`/post/upload-image/${post.id}`)
            .set('Authorization', `Bearer ${token}`);
        // Sin archivo adjunto → multer no pone req.file → 400
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/No se proporcionó/i);
    });

    test('retorna 401 sin token', async () => {
        const res = await request(app).put(`/post/upload-image/${post.id}`);
        expect(res.status).toBe(401);
    });
});
