const emailHelper = require('../middlewares/emailHelper');
const {generateToken} = require('../middlewares/JWTmiddleware');
const UserController = require('../../modules/user/controller/userController')
const { sequelize } = require('../db/database'); 
const { User } = require('../db/schemas/user-schema/userSchema');

async function sendPasswordResetEmail(email) {
    
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) throw new Error('No se encontró el usuario con ese correo electrónico.');
        // crea token aleatorio
        const token = generateToken({username:user.name, email:user.email}, process.env.JWT_SECRET, 1200 );
        
        // busca email del usuario
        
        if (!user) throw new Error('No se encontró el usuario con ese correo electrónico.');

        user.validationToken = token;
        user.tokenExpiration = (Date.now() + 1200).toString(); // 20 minutos
        let data = {
            "username": user.name,
            "validationToken": user.validationToken,
            "tokenExpiration": user.tokenExpiration
        }
        //actualizar en base de datos
        let dataUpdated = await UserController.updateUser(data);
        console.log('Token actualizado en la base de datos:', dataUpdated);

        let text = `Recibiste este correo porque tú (u otra persona) solicitó el restablecimiento de la contraseña de tu cuenta. Por favor, haz clic en el siguiente enlace o pégalo en tu navegador para completar el proceso dentro de 20 minutos: ${process.env.BACKEND_URL}/reset/${token}`;
        let info = await emailHelper(email, 'Restablecimiento de contraseña', text);
        console.log('Correo de restablecimiento de contraseña enviado');
        return info
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = sendPasswordResetEmail;
