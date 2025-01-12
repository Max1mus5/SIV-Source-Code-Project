const { User: UserSchema } = require('../../../connection/db/schemas/user-schema/userSchema'); 
const { generateToken } = require('../../../connection/middlewares/JWTmiddleware');
const bcrypt = require('bcryptjs');

class LoginController {
    async login(username, password) {
        try {
            const user = await UserSchema.findOne({ 
                where: { name: username },
                attributes: ['id', 'name', 'email', 'password', 'role', 'profileImage', 'isVerified']
            });

            if (!user) {
                throw { 
                    status: 401, 
                    message: 'Nombre de usuario inválido' 
                }; 
            }

            // Verificar si la cuenta está verificada primero
            if (!user.isVerified) {
                throw {
                    status: 403,
                    code: 'ACCOUNT_NOT_VERIFIED',
                    message: 'Por favor verifique su cuenta mediante el enlace enviado a su correo'
                };
            }
            
            const validPassword = await bcrypt.compareSync(password, user.password);

            if (!validPassword) {
                throw { 
                    status: 401, 
                    message: 'Contraseña inválida' 
                }; 
            }

            const secretKey = process.env.JWT_SECRET;
            const token = generateToken(
                { 
                    id: user.id, 
                    username: user.name, 
                    role: user.role 
                }, 
                secretKey, 
                14400
            );
            
            return {
                status: 200,
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    profileImage: user.profileImage,
                    isVerified: user.isVerified
                }
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new LoginController();