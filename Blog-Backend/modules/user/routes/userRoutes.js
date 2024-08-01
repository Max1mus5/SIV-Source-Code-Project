// modules/user/routes.js
const express = require('express');
const router = express.Router();
const UserController = require('../controller/userController');
const LoginController = require('../controller/login');
const { authenticateToken } = require('../../../connection/middlewares/JWTmiddleware');
const  emailHelper = require('../../../connection/middlewares/emailHelper');
const sendPasswordResetEmail = require('../../../connection/utils/recoverPassword')

// Documentacion de la ruta
router.get('/docs', (req, res) => {
  //region Documentation
  res.json({
    "/recoverPassword": {
        description: 'send Email for recover password',
        method: 'POST',
        params: {
            email: 'String'
        }
    },
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
    "/login": {
        description: 'Login and token generation',
        method: 'POST',
        params: {
            username: 'String',
            password: 'String'
        },
        returns: "access Token"
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

/* // send mail
router.post("/sendEmail", async (req, res) => {
    const { to, subject, text } = req.body;
  
    try {
      let info = await emailHelper(to, subject, text);
      res.status(200).send(`Email sent: ${info.response}`);
    } catch (error) {
      res.status(500).send("Error sending email");
    }
  }); */

// recover password
router.post("/recoverPassword", async (req, res) => {
    try {
      const  email = req.body.email;
      let info = await sendPasswordResetEmail(email);
      console.log(info);
      res.status(200).send(`Recover password link sended to Email sent: ${info.response}`);
    } catch (error) {
      res.status(500).json({"Error sending email":error.message});
    }
  }
);

// Crear usuario
router.post('/register', async (req, res) => {
    try {
        const user = await UserController.createUser(req.body);
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Iniciar sesion
router.post('/login', async (req, res) => {
    try {
        const token = await LoginController.login(req, res);
        if  (token) {
            res.status(200).json({token: token});
        }
        else {
            res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }
    } catch (token) {
        res.status(400).json({ error: token });
    }
});

// Obtener usuario por username
router.get('/:username', authenticateToken, async (req, res) => {
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
router.put('/updateUser', authenticateToken, async (req, res) => {
    try {
        const user = await UserController.updateUser(req.body);
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Eliminar usuario
router.delete('/delete/:username', authenticateToken, async (req, res) => {
    try {
        await UserController.deleteUser(req.params.username);
        res.status(200).json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
