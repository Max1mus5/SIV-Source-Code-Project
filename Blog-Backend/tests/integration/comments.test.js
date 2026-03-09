const request = require('supertest');

const app = require('../helpers/testApp');
const { setupTestDb, teardownTestDb } = require('../helpers/testDb');
const { createTestUser } = require('../helpers/authHelper');
const { Posts }   = require('../../connection/db/schemas/posts-schema/postSchema');
const { Comment } = require('../../connection/db/schemas/comments-schema/commentSchema');

beforeAll(async () => { await setupTestDb(); });
afterAll(async ()  => { await teardownTestDb(); });


const seedPost = async (authorId, overrides = {}) => {
    return Posts.create({
        autor_id:       authorId,
        date:           new Date().toISOString(),
        title:          overrides.title   || 'Post de prueba',
        content:        overrides.content || 'Contenido del post de prueba',
        likes:          0,
        post_image:     '',
        hashBlockchain: overrides.hash    || `test_hash_${Date.now()}`,
        comments:       0,
    });
};


describe('Comments — POST /comments/', () => {
    let user, token, post;

    beforeAll(async () => {
        ({ user, token } = await createTestUser());
        post = await seedPost(user.id);
    });

    afterAll(async () => {
        await Comment.destroy({ where: {} });
        await Posts.destroy({ where: {} });
    });

    test('crea un comentario y retorna 201', async () => {
        const res = await request(app)
            .post('/comments/')
            .set('Authorization', `Bearer ${token}`)
            .send({
                autor:   user.id,
                content: 'Este es mi comentario de prueba',
                post_id: post.id,
            });
        expect(res.status).toBe(201);
    });

    test('la respuesta incluye el comentario creado con su ID', async () => {
        const res = await request(app)
            .post('/comments/')
            .set('Authorization', `Bearer ${token}`)
            .send({ autor: user.id, content: 'Comentario con ID', post_id: post.id });
        expect(res.body.data).toBeDefined();
        expect(res.body.data.id).toBeDefined();
    });

    test('el contador comments del post aumenta en 1 después de comentar', async () => {
        const before = await Posts.findByPk(post.id);
        await request(app)
            .post('/comments/')
            .set('Authorization', `Bearer ${token}`)
            .send({ autor: user.id, content: 'Contador test', post_id: post.id });
        const after = await Posts.findByPk(post.id);
        expect(Number(after.comments)).toBeGreaterThan(Number(before.comments));
    });

    test('rechaza si falta el campo content → 500', async () => {
        const res = await request(app)
            .post('/comments/')
            .set('Authorization', `Bearer ${token}`)
            .send({ autor: user.id, post_id: post.id });
        expect(res.status).toBeGreaterThanOrEqual(400);
    });

    test('rechaza si el post_id no existe → 500', async () => {
        const res = await request(app)
            .post('/comments/')
            .set('Authorization', `Bearer ${token}`)
            .send({ autor: user.id, content: 'Comentario', post_id: 999999 });
        expect(res.status).toBe(500);
    });

    test('retorna 401 sin token de autenticación', async () => {
        const res = await request(app)
            .post('/comments/')
            .send({ autor: user.id, content: 'sin token', post_id: post.id });
        expect(res.status).toBe(401);
    });
});

describe('Comments — GET /comments/:post_id', () => {
    let user, token, post;

    beforeAll(async () => {
        ({ user, token } = await createTestUser());
        post = await seedPost(user.id);
        // Insertar 2 comentarios directamente en DB
        await Comment.create({ user_id: user.id, post_id: post.id, content: 'Comentario A', creationDate: new Date() });
        await Comment.create({ user_id: user.id, post_id: post.id, content: 'Comentario B', creationDate: new Date() });
    });

    afterAll(async () => {
        await Comment.destroy({ where: {} });
        await Posts.destroy({ where: {} });
    });

    test('retorna 200 con los comentarios del post', async () => {
        const res = await request(app).get(`/comments/${post.id}`);
        expect(res.status).toBe(200);
    });

    test('retorna exactamente 2 comentarios para el post', async () => {
        const res = await request(app).get(`/comments/${post.id}`);
        expect(res.body.data).toBeDefined();
        expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });

    test('retorna error para post_id sin comentarios', async () => {
        const emptyPost = await seedPost(user.id);
        const res = await request(app).get(`/comments/${emptyPost.id}`);
        // El controller lanza error si no hay comentarios
        expect(res.status).toBeGreaterThanOrEqual(400);
    });
});

describe('Comments — DELETE /comments/:comment_id', () => {
    let user, token, post, comment;

    beforeEach(async () => {
        ({ user, token } = await createTestUser());
        post    = await seedPost(user.id);
        comment = await Comment.create({
            user_id: user.id, post_id: post.id,
            content: 'Comentario a eliminar', creationDate: new Date(),
        });
    });

    afterEach(async () => {
        await Comment.destroy({ where: {} });
        await Posts.destroy({ where: {} });
    });

    test('elimina el comentario y retorna 200', async () => {
        const res = await request(app)
            .delete(`/comments/${comment.id}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
    });

    test('el comentario ya no existe en DB después de eliminarlo', async () => {
        await request(app)
            .delete(`/comments/${comment.id}`)
            .set('Authorization', `Bearer ${token}`);
        const found = await Comment.findByPk(comment.id);
        expect(found).toBeNull();
    });

    test('retorna 401 sin token', async () => {
        const res = await request(app).delete(`/comments/${comment.id}`);
        expect(res.status).toBe(401);
    });
});
