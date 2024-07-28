// modules/user/routes.js
const express = require('express');
const router = express.Router();
const UserController = require('../controller/userControler');

// Documentacion de la ruta
router.get('/docs', (req, res) => {
  /* retornar un jason con cada metodo en la ruta o que paremtros necesita */
  res.json({
    register: {
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
    getUser: {
        description: 'Get user by username',
        method: 'GET',
        params: {
            username: 'String'
        }
    },
    updateUser: {
        description: 'Update user',
        method: 'PUT',
        params: {
            id: 'String',
            username: 'String',
            email: 'String',
            password: 'String',
            bio: 'String',
            role: 'String'
        }
    },
    deleteUser: {
        description: 'Delete user',
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


/* como seria un ejemplo de post para registe?
{
    "username": "test",
    "email": "
    "password": "Test1234",
    "bio": "Test bio",
    "role": "admin"
}


*/

// Obtener usuario por username
router.get('/:username', async (req, res) => {
    try {
        const user = await UserController.findUserByUsername(req.params.username);
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Actualizar usuario
router.put('/:id', async (req, res) => {
    try {
        const user = await UserController.updateUser(req.params.id, req.body);
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Eliminar usuario
router.delete('/:id', async (req, res) => {
    try {
        await UserController.deleteUser(req.params.id);
        res.status(200).json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
