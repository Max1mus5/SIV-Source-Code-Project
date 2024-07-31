const jwt = require('jsonwebtoken');

// verify token
function authenticateToken(req, res, next) {
    const token = req.headers['token'];
    const secretKey = process.env.JWT_SECRET;   
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// create token
function generateToken(user, secretKey) {
    return jwt.sign(user, secretKey, { expiresIn: '4h' });
}

module.exports = {
    authenticateToken,
    generateToken
};
