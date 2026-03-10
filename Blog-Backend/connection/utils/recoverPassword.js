const emailHelper = require('../middlewares/emailHelper');
const {generateToken} = require('../middlewares/JWTmiddleware');
const { User } = require('../db/schemas/user-schema/userSchema');
const fs = require('fs');
const path = require('path');

async function sendPasswordResetEmail(email) {
    
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) throw new Error('No se encontró el usuario con ese correo electrónico.');
        // crea token aleatorio
        const token = generateToken({username:user.name, email:user.email}, process.env.JWT_SECRET, 1800 );
        
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

async function sendVerificationEmail(email, token) {
    try {
        const verificationLink = `${process.env.FRONTEND_URL}/verify/${token}`;
        
        // Plain text fallback
        const text = `
Gracias por registrarte en SIV.

Por favor, verifica tu cuenta haciendo clic en el siguiente enlace:
${verificationLink}

IMPORTANTE: Este enlace expirará en 24 horas. Si no verificas tu cuenta dentro de este período,
tu cuenta será eliminada automáticamente y necesitarás registrarte nuevamente.

Si no creaste esta cuenta, puedes ignorar este correo.

Saludos,
Equipo SIV
        `;

        // Load HTML template
        const templatePath = path.join(__dirname, '../templates/email-verification.html');
        let html = fs.readFileSync(templatePath, 'utf8');
        html = html.replace(/{{VERIFICATION_LINK}}/g, verificationLink);

        let info = await emailHelper(email, 'Verifica tu cuenta - SIV Blog', text, html);
        console.log('Correo de verificación enviado');
        return info;
    } catch (error) {
        throw new Error('Error al enviar el correo de verificación: ' + error.message);
    }
}



async function passwordSendResetEmail(email, token) {
    try {
        const resetLink = `${process.env.FRONTEND_URL}/reset/${token}`;
        
        // Plain text fallback
        const text = `
Recibiste este correo porque tú (u otra persona) solicitó el restablecimiento de la contraseña de tu cuenta.

Por favor, haz clic en el siguiente enlace para crear una nueva contraseña:
${resetLink}

IMPORTANTE: Este enlace expirará en 20 minutos por seguridad.

Si no solicitaste este cambio, ignora este correo. Tu contraseña actual no será modificada.

Saludos,
Equipo SIV
        `;

        // Load HTML template
        const templatePath = path.join(__dirname, '../templates/email-password-reset.html');
        let html = fs.readFileSync(templatePath, 'utf8');
        html = html.replace(/{{RESET_LINK}}/g, resetLink);

        let info = await emailHelper(email, 'Restablecer contraseña - SIV Blog', text, html);
        console.log('Correo de restablecimiento de contraseña enviado');
        return info;
    } catch (error) {
        throw new Error('Error al enviar el correo de restablecimiento: ' + error.message);
    }
}

module.exports = { sendPasswordResetEmail, sendVerificationEmail, passwordSendResetEmail};