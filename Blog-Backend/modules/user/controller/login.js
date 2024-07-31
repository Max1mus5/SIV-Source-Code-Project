// Modules/users/Login.js
const { User: UserSchema } = require('../../../connection/db/schemas/user-schema/userSchema'); 
const { generateToken } = require('../../../connection/middlewares/JWTmiddleware');
const bcrypt = require('bcryptjs');

class LoginController {
    async login(req, res) {
        const { username, password } = req.body;
        const secretKey = process.env.JWT_SECRET;

        try {
            const user = await UserSchema.findOne({ where: { name : username } });

            if (!user) {
                return res.status(401).json({ message: 'Invalid username' });
            }
            
            const validPassword = await bcrypt.compareSync(password, user.password);

            if (!validPassword) {
                return res.status(401).json({ message: 'Invalid password' });
            }

            const token = generateToken({ id: user.id, username: user.username, role: user.role }, secretKey);

            return token;
        } catch (error) {
            return error.message;
        }
    }
}

module.exports = new LoginController();
