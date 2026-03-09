const request = require('supertest');

const app = require('../helpers/testApp');
const { setupTestDb, teardownTestDb } = require('../helpers/testDb');
const { createTestUser } = require('../helpers/authHelper');
const { Notification } = require('../../connection/db/schemas/notification-schema/notificationSchema');

beforeAll(async () => { await setupTestDb(); });
afterAll(async ()  => { await teardownTestDb(); });

const seedNotification = async (userId, overrides = {}) => {
    return Notification.create({
        user_id:      userId,
        type:         overrides.type    || 'system',
        message:      overrides.message || 'Test notification message',
        read:         overrides.read    !== undefined ? overrides.read : false,
        creationDate: overrides.creationDate || new Date(),
    });
};

describe('Notifications — GET /notifications/', () => {
    let user, token;

    beforeAll(async () => {
        ({ user, token } = await createTestUser());
        await seedNotification(user.id, { message: 'Notif 1' });
        await seedNotification(user.id, { message: 'Notif 2' });
        await seedNotification(user.id, { message: 'Notif 3', read: true });
    });

    afterAll(async () => {
        await Notification.destroy({ where: {} });
    });

    test('retorna 200 con la lista de notificaciones', async () => {
        const res = await request(app)
            .get('/notifications/')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
    });

    test('la respuesta incluye la propiedad notifications', async () => {
        const res = await request(app)
            .get('/notifications/')
            .set('Authorization', `Bearer ${token}`);
        expect(res.body.notifications).toBeDefined();
        expect(Array.isArray(res.body.notifications)).toBe(true);
    });

    test('retorna exactamente 3 notificaciones para el usuario', async () => {
        const res = await request(app)
            .get('/notifications/')
            .set('Authorization', `Bearer ${token}`);
        expect(res.body.notifications.length).toBe(3);
    });

    test('respeta parámetro limit en paginación', async () => {
        const res = await request(app)
            .get('/notifications/?page=1&limit=2')
            .set('Authorization', `Bearer ${token}`);
        expect(res.body.notifications.length).toBeLessThanOrEqual(2);
    });

    test('retorna 401 sin token de autenticación', async () => {
        const res = await request(app).get('/notifications/');
        expect(res.status).toBe(401);
    });
});

describe('Notifications — GET /notifications/unread', () => {
    let user, token;

    beforeAll(async () => {
        ({ user, token } = await createTestUser());
        await seedNotification(user.id, { read: false, message: 'Unread 1' });
        await seedNotification(user.id, { read: false, message: 'Unread 2' });
        await seedNotification(user.id, { read: true,  message: 'Already read' });
    });

    afterAll(async () => {
        await Notification.destroy({ where: {} });
    });

    test('retorna solo notificaciones no leídas', async () => {
        const res = await request(app)
            .get('/notifications/unread')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        // Todas deben tener read = false
        if (res.body.notifications) {
            res.body.notifications.forEach(n => {
                expect(n.read).toBe(false);
            });
        }
    });

    test('retorna 401 sin token', async () => {
        const res = await request(app).get('/notifications/unread');
        expect(res.status).toBe(401);
    });
});

describe('Notifications — PUT /notifications/:id/read', () => {
    let user, token, notif;

    beforeEach(async () => {
        ({ user, token } = await createTestUser());
        notif = await seedNotification(user.id, { read: false });
    });

    afterEach(async () => {
        await Notification.destroy({ where: {} });
    });

    test('marca una notificación como leída → 200', async () => {
        const res = await request(app)
            .put(`/notifications/${notif.id}/read`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
    });

    test('la notificación queda con read=true en la DB', async () => {
        await request(app)
            .put(`/notifications/${notif.id}/read`)
            .set('Authorization', `Bearer ${token}`);
        const updated = await Notification.findByPk(notif.id);
        expect(updated.read).toBe(true);
    });

    test('retorna 404 para ID de notificación inexistente', async () => {
        const res = await request(app)
            .put('/notifications/999999/read')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(404);
    });

    test('retorna 401 sin token', async () => {
        const res = await request(app).put(`/notifications/${notif.id}/read`);
        expect(res.status).toBe(401);
    });
});

describe('Notifications — PUT /notifications/read-all', () => {
    let user, token;

    beforeEach(async () => {
        ({ user, token } = await createTestUser());
        await seedNotification(user.id, { read: false });
        await seedNotification(user.id, { read: false });
        await seedNotification(user.id, { read: false });
    });

    afterEach(async () => {
        await Notification.destroy({ where: {} });
    });

    test('marca todas las notificaciones como leídas → 200', async () => {
        const res = await request(app)
            .put('/notifications/read-all')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
    });

    test('todas las notificaciones quedan con read=true en la DB', async () => {
        await request(app)
            .put('/notifications/read-all')
            .set('Authorization', `Bearer ${token}`);
        const unread = await Notification.count({
            where: { user_id: user.id, read: false }
        });
        expect(unread).toBe(0);
    });
});

describe('Notifications — DELETE /notifications/:id', () => {
    let user, token, notif;

    beforeEach(async () => {
        ({ user, token } = await createTestUser());
        notif = await seedNotification(user.id);
    });

    afterEach(async () => {
        await Notification.destroy({ where: {} });
    });

    test('elimina una notificación existente → 200', async () => {
        const res = await request(app)
            .delete(`/notifications/${notif.id}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
    });

    test('la notificación ya no existe en DB después de eliminarla', async () => {
        await request(app)
            .delete(`/notifications/${notif.id}`)
            .set('Authorization', `Bearer ${token}`);
        const found = await Notification.findByPk(notif.id);
        expect(found).toBeNull();
    });

    test('retorna 404 para ID inexistente', async () => {
        const res = await request(app)
            .delete('/notifications/999999')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(404);
    });

    test('un usuario no puede eliminar notificaciones ajenas → 404', async () => {
        const { token: otherToken } = await createTestUser();
        const res = await request(app)
            .delete(`/notifications/${notif.id}`)
            .set('Authorization', `Bearer ${otherToken}`);
        // La query usa { user_id: otherUserId } así que no encontrará la notif
        expect(res.status).toBe(404);
    });

    test('retorna 401 sin token', async () => {
        const res = await request(app).delete(`/notifications/${notif.id}`);
        expect(res.status).toBe(401);
    });
});
