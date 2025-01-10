const { User: UserSchema } = require('../../../connection/db/schemas/user-schema/userSchema'); 
const { generateToken } = require('../../../connection/middlewares/JWTmiddleware');
const bcrypt = require('bcryptjs');
class LoginController {
    async login(req, res) {
        const { username, password } = req.body;
        const secretKey = process.env.JWT_SECRET;

        try {
            const user = await UserSchema.findOne({ where: { name: username } });

            if (!user) {
                return res.status(401).json({ 
                    status: 'error', 
                    message: 'Nombre de usuario inválido' 
                }); 
            }
            
            const validPassword = await bcrypt.compareSync(password, user.password);

            if (!validPassword) {
                return res.status(401).json({ 
                    status: 'error', 
                    message: 'Contraseña inválida' 
                }); 
            }

            const token = generateToken({ id: user.id, username: user.username, role: user.role }, secretKey, 14400);
            
            return { token, user }; // Retorna un objeto con token y user
        } catch (error) {
            return res.status(500).json({ 
                status: 'error', 
                message: 'Error en el servidor' 
            }); 
        }
    }
}

module.exports = new LoginController();
