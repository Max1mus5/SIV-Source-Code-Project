const emailHelper = require('../middlewares/emailHelper');
const {generateToken} = require('../middlewares/JWTmiddleware');
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
        return data;
    } catch (error) {
        throw new Error(error.message);
    }
}

async function sendVerificationEmail(email,token) {
    try {
        // set token in database
        let text = `Gracias por registrarte en nuestro blog. Por favor, haz clic en el siguiente enlace o pégalo en tu navegador para verificar tu cuenta: ${process.env.BACKEND_URL}/user/verify/${token}`;
        let info = await emailHelper(email, 'Verificación de cuenta', text);
        console.log('Correo de verificación enviado');
        return info
    } catch (error) {
        throw new Error(error.message);
    }
}

async function passwordSendResetEmail(email, token) {
        let text = `Recibiste este correo porque tú (u otra persona) solicitó el restablecimiento de la contraseña de tu cuenta. Por favor, haz clic en el siguiente enlace o pégalo en tu navegador para completar el proceso dentro de 20 minutos: ${process.env.BACKEND_URL}/reset/${token}`;
        let info = await emailHelper(email, 'Restablecimiento de contraseña', text);
        console.log('Correo de restablecimiento de contraseña enviado');
        return info;
}

module.exports = { sendPasswordResetEmail, sendVerificationEmail, passwordSendResetEmail};