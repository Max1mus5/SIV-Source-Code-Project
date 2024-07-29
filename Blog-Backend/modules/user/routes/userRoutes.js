// modules/user/routes.js
const express = require('express');
const router = express.Router();
const UserController = require('../controller/userController');

// Documentacion de la ruta
router.get('/docs', (req, res) => {
  //region:Documentation
  res.json({
    "/register": {
        description: 'Register',
        method: 'POST',
        params: {
            username: 'String',
            email: 'String',
            password: 'String',
            bio: 'String',
            role: 'String'
        }
    },
    "/username": {
        description: 'Get user by username',
        method: 'GET',
        params: {
            username: 'String'
        }
    },
    "/:username": {
        description: 'Update user',
        method: 'PUT',
        optional_params: {
            username: 'String',
            email: 'String',
            password: 'String',
            bio: 'String',
            role: 'String'
        }
    },
    "/deleteUser": {
        description: 'Delete user by username',
        method: 'DELETE',
        params: {
            id: 'String'
        }
              }
          });
});


// Crear usuario
router.post('/register', async (req, res) => {
    try {
        const user = await UserController.createUser(req.body);
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Obtener usuario por username
router.get('/:username', async (req, res) => {
    try {
        const user = await UserController.findUserByUsername(req.params.username);
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }   
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Actualizar usuario
router.put('/updateUser', async (req, res) => {
    try {
        const user = await UserController.updateUser(req.body);
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Eliminar usuario
router.delete('/delete/:username', async (req, res) => {
    try {
        await UserController.deleteUser(req.params.username);
        res.status(200).json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
