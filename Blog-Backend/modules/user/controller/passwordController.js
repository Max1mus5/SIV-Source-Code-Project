const { User } = require('../../../connection/db/schemas/user-schema/userSchema'); // Sequelize User schema4

class PasswordController {
    async verifyExpiration(token) {
        try {
            const user = await User.findOne({ where: { validationToken: token } });
            if (!user) {
                return { isValid: false, message: 'Token no válido' }; 
            }

            if (new Date(user.tokenExpiration) < new Date()) {
                return { isValid: false, message: 'Token expirado' }; 
            }

            return { isValid: true }; 
        } catch (error) {
            console.error('Error en verifyExpiration:', error);
            return { isValid: false, message: 'Error al verificar el token' }; 
        }
    }
}

module.exports = new PasswordController();