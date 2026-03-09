const jwt    = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../../connection/db/schemas/user-schema/userSchema');

const TEST_SECRET = process.env.JWT_SECRET || 'siv_test_jwt_secret_key_32characters!';

const generateTestToken = (payload = {}) => {
    const defaults = { id: 1, username: 'testuser', role: 'author' };
    return jwt.sign({ ...defaults, ...payload }, TEST_SECRET, { expiresIn: '1h' });
};

const createTestUser = async (overrides = {}) => {
    const user = await User.create({
        name:            overrides.name         || 'testuser_' + Date.now(),
        email:           overrides.email        || `test_${Date.now()}@example.com`,
        password:        await bcrypt.hash(overrides.rawPassword || 'TestPass1!', 10),
        bio:             overrides.bio          || '',
        role:            overrides.role         || 'author',
        profileImage:    overrides.profileImage || '',
        isVerified:      overrides.isVerified   !== undefined ? overrides.isVerified : true,
        favorites:       overrides.favorites    || null,
        posts:           overrides.posts        || null,
        validationToken: null,
        tokenExpiration: null,
    });
    const token = generateTestToken({ id: user.id, username: user.name, role: user.role });
    return { user, token };
};

module.exports = { generateTestToken, createTestUser, TEST_SECRET };
