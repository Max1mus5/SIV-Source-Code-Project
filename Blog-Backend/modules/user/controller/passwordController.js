const { User } = require('../../../connection/db/schemas/user-schema/userSchema'); // Sequelize User schema4

class PasswordController {
    async verifyExpiration(token) {
        const user = await User.findOne({ where: { validationToken: token } });
        if (!user) {
            throw new Error('Token no valido');
        }

        if (user.tokenExpiration < new Date().toISOString()) {
           return false;
        }

        return true;
    }

}

module.exports = new PasswordController();