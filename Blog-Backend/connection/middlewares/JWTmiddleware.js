const jwt = require('jsonwebtoken');

// verify token
function authenticateToken(req, res, next, secretKey) {
    const token = req.headers['authorization'];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// create token
function generateToken(user, secretKey) {
    return jwt.sign(user, secretKey, { expiresIn: '24h' });
}

module.exports = {
    authenticateToken,
    generateToken
};
