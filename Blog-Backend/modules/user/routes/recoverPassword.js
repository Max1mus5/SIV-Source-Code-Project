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
    const token = req.params.token
    if(!PasswordController.verifyExpiration(token)){
        return res.status(400).json({ error: 'El token ha expirado, solicite de nuevo su contraseña.' });
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
        res.status(200).json({recoverUser, message: 'Contraseña restablecida exitosamente.'});
    } catch (error) {
        res.status(400).json({ "No fue posible reestrablecer tu contraseña":error.message });
    }
});

module.exports = router;
