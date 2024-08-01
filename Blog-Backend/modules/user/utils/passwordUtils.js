const {User} = require('../../../connection/db/schemas/user-schema/userSchema');
const { sequelize } = require('../../../connection/db/database');

//search by token
async function resetPassword(token) {
    try {
        //search by token
        const user = await User.findOne({ where: { validationToken: token } });
        if (!user) throw new Error('Token no válido.');
        return user;
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = resetPassword;