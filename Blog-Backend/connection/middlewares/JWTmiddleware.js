const jwt = require('jsonwebtoken');

// verify token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const secretKey = process.env.JWT_SECRET;   
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// create token
function generateToken(user, secretKey, time) {
    return jwt.sign(user, secretKey, { expiresIn: `${time}s` });
}

module.exports = {
    authenticateToken,
    generateToken
};
