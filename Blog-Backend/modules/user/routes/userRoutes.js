const express = require('express');
const router = express.Router();
const Joi = require('joi');
const UserController = require('../controller/userController');
const LoginController = require('../controller/login');
const { authenticateToken, checkRole } = require('../../../connection/middlewares/JWTmiddleware');
const { sendPasswordResetEmail, passwordSendResetEmail } = require('../../../connection/utils/recoverPassword');
const { validateRequest } = require('../../../connection/middlewares/validationMiddleware');
const { rateLimiter } = require('../../../connection/middlewares/rateLimiter');

//#region DOCS
router.get('/docs', (req, res) => {
    res.json({
        version: '1.0',
        basePath: '/user',
        authentication: {
            type: 'Bearer Token',
            description: 'Se requiere token JWT para rutas protegidas'
        },
        endpoints: {
            auth: {
                register: {
                    path: '/register',
                    method: 'POST',
                    description: 'Registra un nuevo usuario y envía correo de verificación',
                    rateLimiting: '5 intentos por hora', 
                    body: {
                        username: { type: 'string', required: true, minLength: 3 },
                        email: { type: 'string', required: true, format: 'email' },
                        password: { type: 'string', required: true, minLength: 8 },
                        bio: { type: 'string', required: false },
                        role: { type: 'string', enum: ['reader', 'author'], default: 'reader' }
                    },
                    responses: {
                        201: { description: 'Usuario creado exitosamente' },
                        400: { description: 'Error de validación' }
                    }
                },
                verify: {
                    path: '/verify/:token',
                    method: 'GET',
                    description: 'Verifica la cuenta de usuario mediante el token enviado al correo electrónico',
                    notes: 'El token tiene una validez de 20 minutos.',
                    params: {
                        token: { type: 'string', required: true, description: 'Token de verificación' }
                    },
                    responses: {
                        200: { description: 'Cuenta verificada exitosamente' },
                        400: { description: 'Token inválido o expirado' }
                    }
                },
                login: {
                    path: '/login',
                    method: 'POST',
                    description: 'Inicio de sesión y generación de token',
                    body: {
                        username: { type: 'string', required: true },
                        password: { type: 'string', required: true }
                    },
                    responses: {
                        200: { description: 'Inicio de sesión exitoso', schema: { token: 'string' } }, 
                        401: { description: 'Credenciales inválidas' }
                    }
                }
            },
            user: { 
                get: {
                    path: '/:username', 
                    method: 'GET',
                    description: 'Obtiene la información de un usuario por su nombre de usuario',
                    security: 'Bearer Token', 
                    params: {
                        username: { type: 'string', required: true }
                    },
                    responses: {
                        200: { description: 'Información del usuario' },
                        404: { description: 'Usuario no encontrado' }
                    }
                },
                update: {
                    path: '/:username',
                    method: 'PUT',
                    description: 'Actualiza la información de un usuario',
                    security: 'Bearer Token',
                    params: {
                        username: { type: 'string', required: true }
                    },
                    body: {
                        username: { type: 'string', required: false, minLength: 3 },
                        email: { type: 'string', required: false, format: 'email' },
                        password: { type: 'string', required: false, minLength: 8 },
                        bio: { type: 'string', required: false },
                        role: { type: 'string', enum: ['reader', 'author'], required: false }
                    },
                    responses: {
                        200: { description: 'Usuario actualizado exitosamente' },
                        400: { description: 'Error de validación' }
                    }
                },
                delete: {
                    path: '/deleteUser', 
                    method: 'DELETE',
                    description: 'Elimina un usuario por su ID',
                    security: 'Bearer Token',
                    params: {
                        id: { type: 'string', required: true, description: 'ID del usuario' } 
                    },
                    responses: {
                        200: { description: 'Usuario eliminado exitosamente' },
                        404: { description: 'Usuario no encontrado' }
                    }
                }
            }
        }
    });
});

//#region ROUTES

// middleware de validación para el registro
const registerValidation = validateRequest(Joi.object({
    username: Joi.string().required().min(3),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
    bio: Joi.string().optional(),
    role: Joi.string().valid('reader', 'author').default('reader')
}));

// registro con rate limiting y validación
router.post('/register',
    rateLimiter({ windowMs: 60 * 60 * 1000, max: 5 }), // 5 intentos por hora
    registerValidation,
    async (req, res) => {
        try {
            const user = await UserController.createUser(req.body);
            res.status(201).json({
                status: 'success',
                message: 'Se ha enviado un correo de verificación a su email',
                data: {
                    userId: user.id,
                    email: user.email,
                    verificationDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                }
            });
        } catch (error) {
            res.status(400).json({
                status: 'error',
                error: error.message,
                code: error.code || 'REGISTRATION_ERROR'
            });
        }
    }
);

// Ruta de verificación
router.get('/verify/:token',
    rateLimiter({ windowMs: 60 * 60 * 1000, max: 10 }), // 10 verificaciones por hora
    async (req, res) => {
        try {
            const result = await UserController.verifyToken(req.params.token);
            res.status(200).json({
                status: 'success',
                message: result,
                redirectUrl: `${process.env.FRONTEND_URL}/login`
            });
        } catch (error) {
            res.status(400).json({
                status: 'error',
                error: error.message,
                code: error.code || 'VERIFICATION_ERROR'
            });
        }
    }
);

//#region Ruta de login 
// Configuración del rate limiter
const loginLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 intentos
    message: {
        status: 'error',
        code: 'TOO_MANY_REQUESTS',
        message: 'Demasiados intentos de inicio de sesión. Por favor, intente nuevamente en 15 minutos.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Esquema de validación
const loginSchema = Joi.object({
    username: Joi.string()
        .required()
        .min(3)
        .max(30)
        .messages({
            'string.empty': 'El nombre de usuario es requerido',
            'string.min': 'El nombre de usuario debe tener al menos 3 caracteres',
            'string.max': 'El nombre de usuario no debe exceder los 30 caracteres'
        }),
    password: Joi.string()
        .required()
        .min(6)
        .messages({
            'string.empty': 'La contraseña es requerida',
            'string.min': 'La contraseña debe tener al menos 6 caracteres'
        })
});

router.post('/login',
    loginLimiter,
    validateRequest(loginSchema),
    async (req, res) => {
        try {
            const { username, password } = req.body;
            const result = await LoginController.login(username, password);

            // Log del inicio de sesión exitoso
            console.log(`Login exitoso para el usuario: ${username} en ${new Date().toISOString()}`);

            // Configurar headers de seguridad
            res.set({
                'Content-Security-Policy': "default-src 'self'",
                'X-Content-Type-Options': 'nosniff',
                'X-Frame-Options': 'DENY'
            });

            return res.status(200).json({
                status: 'success',
                data: {
                    token: result.token,
                    user: {
                        id: result.user.id,
                        username: result.user.name,
                        email: result.user.email,
                        role: result.user.role,
                        profileImage: result.user.profileImage
                    },
                    expiresIn: 14400 // 4 horas en segundos
                }
            });

        } catch (error) {
            // Manejar diferentes tipos de errores
            let errorResponse = {
                status: 'error',
                code: error.code || 'AUTHENTICATION_ERROR',
                message: error.message || 'Error de autenticación'
            };

            // Log del error para debugging
            console.error('Error en login:', error);

            return res.status(error.status || 500).json(errorResponse);
        }
    }
);

// Ruta de recuperación de contraseña
router.post('/recover-password',
    rateLimiter({ windowMs: 60 * 60 * 1000, max: 3 }), // 3 intentos por hora
    validateRequest(Joi.object({
        email: Joi.string().email().required()
    })),
    async (req, res) => {
        try {
            const { email } = req.body;
            const data = await sendPasswordResetEmail(email);
            await UserController.updateUser(data);
            await passwordSendResetEmail(email, data.validationToken);

            res.status(200).json({
                status: 'success',
                message: 'Se ha enviado un enlace de recuperación a su correo',
                expiresIn: '30 minutos'
            });
        } catch (error) {
            res.status(400).json({
                status: 'error',
                error: error.message,
                code: 'PASSWORD_RESET_ERROR'
            });
        }
    }
);

//#region CRUD

router.get('/:username', authenticateToken, async (req, res) => {
    try {
        const { username } = req.params;
        const user = await UserController.getUserByUsername(username);

        if (!user) {
            return res.status(404).json({ 
                status: 'error', 
                message: 'Usuario no encontrado' 
            });
        }

        res.status(200).json({
            status: 'success',
            data: user
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error', 
            message: 'Error al obtener el usuario' 
        });
    }
});

// Ruta protegida para actualizar perfil
router.put('/profile/:username',
    authenticateToken,
    validateRequest(Joi.object({
        username: Joi.string().min(3).optional(),
        email: Joi.string().email().optional(),
        bio: Joi.string().optional()
    })),
    async (req, res) => {
        try {
            const { username } = req.params; // Obtener el nombre de usuario de los parámetros

            // Construir el objeto de actualización con los datos del cuerpo de la solicitud
            const updateData = {
                ...req.body,
                username: username // Asegurarse de que el nombre de usuario sea el correcto
            };

            const user = await UserController.updateUser(updateData);
            res.status(200).json({
                status: 'success',
                data: user
            });
        } catch (error) {
            res.status(400).json({
                status: 'error',
                error: error.message,
                code: 'UPDATE_ERROR'
            });
        }
    }
);

// Ruta protegida para eliminar cuenta
router.delete('/account',
    authenticateToken,
    async (req, res) => {
        try {
            await UserController.deleteUser(req.query.email);
            res.status(200).json({
                status: 'success',
                message: 'Cuenta eliminada exitosamente'
            });
        } catch (error) {
            res.status(400).json({
                status: 'error',
                error: error.message,
                code: 'DELETE_ERROR'
            });
        }
    }
);

module.exports = router;