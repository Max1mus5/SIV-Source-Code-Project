const { User } = require('../../../connection/db/schemas/user-schema/userSchema');

//search by token
async function searchByToken(token) {
    try {
        const user = await User.findOne({ 
            where: { 
                validationToken: token,
                isVerified: false 
            } 
        });

        if (!user) {
            throw new Error('Token no válido o cuenta ya verificada.');
        }

        const expirationDate = new Date(user.tokenExpiration);
        if (Date.now() > expirationDate) {
            await user.destroy();
            throw new Error('El token ha expirado y la cuenta ha sido eliminada. Por favor, regístrese nuevamente.');
        }

        return user;
    } catch (error) {
        throw new Error(error.message);
    }
}



module.exports = searchByToken;