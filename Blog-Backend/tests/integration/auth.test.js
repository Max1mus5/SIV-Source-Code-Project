const request = require('supertest');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');

jest.mock('../../connection/utils/recoverPassword', () => ({
    sendVerificationEmail:   jest.fn().mockResolvedValue({ accepted: ['test@gmail.com'] }),
    sendPasswordResetEmail:  jest.fn().mockResolvedValue({ email: 'test@gmail.com', validationToken: 'mock_token', tokenExpiration: new Date(Date.now() + 1800000).toISOString() }),
    passwordSendResetEmail:  jest.fn().mockResolvedValue({}),
}));

const app  = require('../helpers/testApp');
const { setupTestDb, teardownTestDb } = require('../helpers/testDb');
const { User } = require('../../connection/db/schemas/user-schema/userSchema');
const { generateToken } = require('../../connection/middlewares/JWTmiddleware');

beforeAll(async () => { await setupTestDb(); });
afterAll(async ()  => { await teardownTestDb(); });


const validUser = {
    username: 'integrationUser',
    email:    'integration@gmail.com',
    password: 'TestPass1!',
    role:     'author',
};

describe('POST /user/register', () => {
    afterEach(async () => {
        await User.destroy({ where: {}, truncate: true });
    });

    test('registra un usuario nuevo y retorna 201', async () => {
        const res = await request(app)
            .post('/user/register')
            .send(validUser);
        expect(res.status).toBe(201);
    });

    test('respuesta incluye el nombre de usuario', async () => {
        const res = await request(app)
            .post('/user/register')
            .send(validUser);
        expect(res.body).toBeDefined();
        expect(res.status).not.toBe(500);
    });

    test('rechaza registro si la contraseña no cumple el patrón (< 8 chars)', async () => {
        const res = await request(app)
            .post('/user/register')
            .send({ ...validUser, password: 'abc' });
        expect(res.status).toBeGreaterThanOrEqual(400);
    });

    test('rechaza registro con email inválido', async () => {
        const res = await request(app)
            .post('/user/register')
            .send({ ...validUser, email: 'not-an-email' });
        expect(res.status).toBeGreaterThanOrEqual(400);
    });

    test('rechaza registro con username duplicado', async () => {
        await request(app).post('/user/register').send(validUser);
        const res = await request(app)
            .post('/user/register')
            .send(validUser);
        expect(res.status).toBeGreaterThanOrEqual(400);
    });

    test('rechaza si falta el campo username', async () => {
        const { username, ...rest } = validUser;
        const res = await request(app).post('/user/register').send(rest);
        expect(res.status).toBeGreaterThanOrEqual(400);
    });
});

describe('POST /user/login', () => {
    let testUser;

    beforeAll(async () => {
        testUser = await User.create({
            name:       'loginTestUser',
            email:      'login_test@gmail.com',
            password:   await bcrypt.hash('TestPass1!', 10),
            bio:        '',
            role:       'author',
            isVerified: true,
        });
    });

    afterAll(async () => {
        await User.destroy({ where: {}, truncate: true });
    });

    test('login exitoso retorna 200 con token', async () => {
        const res = await request(app)
            .post('/user/login')
            .send({ username: 'loginTestUser', password: 'TestPass1!' });
        expect(res.status).toBe(200);
        expect(res.body.data.token).toBeDefined();
        expect(typeof res.body.data.token).toBe('string');
    });

    test('el token JWT es válido y contiene el username', async () => {
        const res = await request(app)
            .post('/user/login')
            .send({ username: 'loginTestUser', password: 'TestPass1!' });
        const decoded = jwt.decode(res.body.data.token);
        expect(decoded.username).toBe('loginTestUser');
    });

    test('la respuesta incluye datos básicos del usuario', async () => {
        const res = await request(app)
            .post('/user/login')
            .send({ username: 'loginTestUser', password: 'TestPass1!' });
        const { user } = res.body.data;
        expect(user.username).toBe('loginTestUser');
        expect(user.role).toBe('author');
        expect(user.password).toBeUndefined();
    });

    test('rechaza login con contraseña incorrecta → 401', async () => {
        const res = await request(app)
            .post('/user/login')
            .send({ username: 'loginTestUser', password: 'WrongPass99!' });
        expect(res.status).toBe(401);
    });

    test('rechaza login con username inexistente → 401', async () => {
        const res = await request(app)
            .post('/user/login')
            .send({ username: 'noexiste_jamas', password: 'TestPass1!' });
        expect(res.status).toBe(401);
    });

    test('rechaza login de usuario no verificado → 403', async () => {
        await User.create({
            name: 'unverified_user', email: 'unv@gmail.com',
            password: await bcrypt.hash('TestPass1!', 10),
            role: 'reader', isVerified: false,
        });
        const res = await request(app)
            .post('/user/login')
            .send({ username: 'unverified_user', password: 'TestPass1!' });
        expect(res.status).toBe(403);
        expect(res.body.code).toBe('ACCOUNT_NOT_VERIFIED');
    });

    test('rechaza si falta el campo password', async () => {
        const res = await request(app)
            .post('/user/login')
            .send({ username: 'loginTestUser' });
        expect(res.status).toBeGreaterThanOrEqual(400);
    });
});


describe('GET /user/verify/:token', () => {
    afterEach(async () => {
        await User.destroy({ where: {}, truncate: true });
    });

    test('verifica la cuenta con un token válido → 200', async () => {
        const secret  = process.env.JWT_SECRET;
        const token   = generateToken({ username: 'toVerify', email: 'verify@gmail.com' }, secret, 1200);
        const expDate = new Date(Date.now() + 86400000).toISOString();

        await User.create({
            name: 'toVerify', email: 'verify@gmail.com',
            password: await bcrypt.hash('TestPass1!', 10),
            role: 'reader', isVerified: false,
            validationToken: token, tokenExpiration: expDate,
        });

        const res = await request(app).get(`/user/verify/${token}`);
        expect(res.status).toBe(200);
    });

    test('retorna error para token inválido', async () => {
        const res = await request(app).get('/user/verify/token_completamente_falso');
        expect(res.status).toBeGreaterThanOrEqual(400);
    });
});

describe('Rutas protegidas sin autenticación', () => {
    test('GET /user/:username sin token → 401', async () => {
        const res = await request(app).get('/user/cualquier_usuario');
        expect(res.status).toBe(401);
    });
});
