// recoverPassword.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../../connection/middlewares/JWTmiddleware'); // Importar el middleware JWT
const UserController = require('../controller/userController');
const searchByToken = require('../utils/passwordUtils');
const PasswordController = require('../controller/passwordController');

// Ruta para restablecer la contraseña
router.put('/:token', authenticateToken, async (req, res) => {
    const { newPassword } = req.body;
    const token = req.params.token;

    const { isValid, message } = await PasswordController.verifyExpiration(token);

    if (!isValid) {
        return res.status(400).json({ error: message });
    }

    try {
        if (!newPassword) {
            return res.status(400).json({ error: 'Nueva contraseña requerida.' });
        }

        let user = await searchByToken(token); // search the user by token
        let newUser = {
            username: user.name,
            password: newPassword
        };

        let recoverUser = await UserController.updateUser(newUser);
        res.status(200).json({ recoverUser, message: 'Contraseña restablecida exitosamente.' });
    } catch (error) {
        res.status(400).json({ "No fue posible reestablecer tu contraseña": error.message });
    }
});

module.exports = router;
