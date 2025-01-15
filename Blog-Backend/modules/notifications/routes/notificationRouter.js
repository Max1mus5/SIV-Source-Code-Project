const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { authenticateToken } = require('../../../connection/middlewares/JWTmiddleware');
const { validateRequest } = require('../../../connection/middlewares/validationMiddleware');
const { rateLimiter } = require('../../../connection/middlewares/rateLimiter');
const NotificationController = require('../controller/notificationController');

//#region DOCS
router.get('/docs', (req, res) => {
    res.json({
        version: '1.0',
        basePath: '/notifications',
        authentication: {
            type: 'Bearer Token',
            description: 'Se requiere token JWT para todas las rutas'
        },
        endpoints: {
            notifications: {
                getAll: {
                    path: '/',
                    method: 'GET',
                    description: 'Obtiene todas las notificaciones del usuario autenticado',
                    security: 'Bearer Token',
                    query: {
                        page: { type: 'number', required: false, default: 1 },
                        limit: { type: 'number', required: false, default: 10 }
                    },
                    responses: {
                        200: { description: 'Lista de notificaciones' },
                        401: { description: 'No autorizado' }
                    }
                },
                getUnread: {
                    path: '/unread',
                    method: 'GET',
                    description: 'Obtiene las notificaciones no leídas del usuario',
                    security: 'Bearer Token',
                    responses: {
                        200: { description: 'Lista de notificaciones no leídas' },
                        401: { description: 'No autorizado' }
                    }
                },
                markAsRead: {
                    path: '/:id/read',
                    method: 'PUT',
                    description: 'Marca una notificación específica como leída',
                    security: 'Bearer Token',
                    params: {
                        id: { type: 'number', required: true }
                    },
                    responses: {
                        200: { description: 'Notificación marcada como leída' },
                        404: { description: 'Notificación no encontrada' }
                    }
                },
                markAllAsRead: {
                    path: '/read-all',
                    method: 'PUT',
                    description: 'Marca todas las notificaciones del usuario como leídas',
                    security: 'Bearer Token',
                    responses: {
                        200: { description: 'Todas las notificaciones marcadas como leídas' },
                        401: { description: 'No autorizado' }
                    }
                },
                delete: {
                    path: '/:id',
                    method: 'DELETE',
                    description: 'Elimina una notificación específica',
                    security: 'Bearer Token',
                    params: {
                        id: { type: 'number', required: true }
                    },
                    responses: {
                        200: { description: 'Notificación eliminada' },
                        404: { description: 'Notificación no encontrada' }
                    }
                }
            }
        }
    });
});

//#region ROUTES

// Esquema de validación para parámetros de paginación
const paginationSchema = Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10)
});

// Obtener todas las notificaciones (paginadas)
router.get('/',
    authenticateToken,
    validateRequest(paginationSchema, 'query'),
    async (req, res) => {
        try {
            const { page, limit } = req.query;
            const notifications = await NotificationController.getAllNotifications(req.user.id, page, limit);
            
            res.status(200).json({
                status: 'success',
                data: notifications
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
);

// Obtener notificaciones no leídas
router.get('/unread',
    authenticateToken,
    async (req, res) => {
        try {
            const notifications = await NotificationController.getUnreadNotifications(req.user.id);
            
            res.status(200).json({
                status: 'success',
                data: notifications
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
);

// Marcar una notificación como leída
router.put('/:id/read',
    authenticateToken,
    async (req, res) => {
        try {
            const notification = await NotificationController.markAsRead(req.params.id, req.user.id);
            
            if (!notification) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Notificación no encontrada'
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'Notificación marcada como leída',
                data: notification
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
);

// Marcar todas las notificaciones como leídas
router.put('/read-all',
    authenticateToken,
    async (req, res) => {
        try {
            await NotificationController.markAllAsRead(req.user.id);
            
            res.status(200).json({
                status: 'success',
                message: 'Todas las notificaciones han sido marcadas como leídas'
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
);

// Eliminar una notificación
router.delete('/:id',
    authenticateToken,
    async (req, res) => {
        try {
            const result = await NotificationController.deleteNotification(req.params.id, req.user.id);
            
            if (!result) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Notificación no encontrada'
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'Notificación eliminada exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
);

router.get('/:id',
    authenticateToken,
    async (req, res) => {
        try {
            const notification = await NotificationController.getNotificationById(req.params.id, req.user.id);
            
            if (!notification) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Notificación no encontrada'
                });
            }

            res.status(200).json({
                status: 'success',
                data: notification
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
);

router.get('/type/:type',
    authenticateToken,
    validateRequest(paginationSchema, 'query'),
    async (req, res) => {
        try {
            const { page, limit } = req.query;
            const notifications = await NotificationController.getNotificationsByType(
                req.user.id, 
                req.params.type,
                page,
                limit
            );
            
            res.status(200).json({
                status: 'success',
                data: notifications
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
);

module.exports = router;