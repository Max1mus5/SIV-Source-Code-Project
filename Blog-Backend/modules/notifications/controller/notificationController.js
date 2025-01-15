const { Notification } = require('../../../connection/db/schemas/notification-schema/notificationSchema');
const { User } = require('../../../connection/db/schemas/user-schema/userSchema');
const { createNotification, markAsRead } = require('../utils/notificationUtils');

class NotificationController {
    async getUserNotifications(userId, page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;
            
            const notifications = await Notification.findAndCountAll({
                where: { userId },
                include: [{
                    model: User,
                    as: 'sender',
                    attributes: ['id', 'name', 'profileImage']
                }],
                order: [['createdAt', 'DESC']],
                limit,
                offset,
                attributes: ['id', 'type', 'content', 'isRead', 'createdAt']
            });

            return {
                status: 200,
                notifications: notifications.rows,
                totalCount: notifications.count,
                currentPage: page,
                totalPages: Math.ceil(notifications.count / limit)
            };
        } catch (error) {
            throw {
                status: 500,
                message: 'Error al obtener las notificaciones',
                error: error.message
            };
        }
    }

    async createNewNotification(senderId, receiverId, type, content) {
        try {
            const notification = await createNotification({
                senderId,
                userId: receiverId,
                type,
                content
            });

            return {
                status: 201,
                notification
            };
        } catch (error) {
            throw {
                status: 500,
                message: 'Error al crear la notificación',
                error: error.message
            };
        }
    }

    async markNotificationAsRead(notificationId, userId) {
        try {
            const result = await markAsRead(notificationId, userId);
            
            if (!result) {
                throw {
                    status: 404,
                    message: 'Notificación no encontrada'
                };
            }

            return {
                status: 200,
                message: 'Notificación marcada como leída'
            };
        } catch (error) {
            throw error;
        }
    }

    async markAllAsRead(userId) {
        try {
            await Notification.update(
                { isRead: true },
                { where: { userId, isRead: false } }
            );

            return {
                status: 200,
                message: 'Todas las notificaciones han sido marcadas como leídas'
            };
        } catch (error) {
            throw {
                status: 500,
                message: 'Error al marcar las notificaciones como leídas',
                error: error.message
            };
        }
    }

    async deleteNotification(notificationId, userId) {
        try {
            const deleted = await Notification.destroy({
                where: {
                    id: notificationId,
                    userId
                }
            });

            if (!deleted) {
                throw {
                    status: 404,
                    message: 'Notificación no encontrada'
                };
            }

            return {
                status: 200,
                message: 'Notificación eliminada exitosamente'
            };
        } catch (error) {
            throw error;
        }
    }

    async getNotificationById(notificationId, userId) {
        try {
            const notification = await Notification.findOne({
                where: { 
                    id: notificationId,
                    userId 
                },
                include: [{
                    model: User,
                    as: 'sender',
                    attributes: ['id', 'name', 'profileImage']
                }],
                attributes: ['id', 'type', 'content', 'isRead', 'createdAt']
            });
    
            if (!notification) {
                throw {
                    status: 404,
                    message: 'Notificación no encontrada'
                };
            }
    
            return {
                status: 200,
                notification
            };
        } catch (error) {
            throw error.status ? error : {
                status: 500,
                message: 'Error al obtener la notificación',
                error: error.message
            };
        }
    }
    
    async getNotificationByType(userId, type, page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;
            
            const notifications = await Notification.findAndCountAll({
                where: { userId, type },
                include: [{
                    model: User,
                    as: 'sender',
                    attributes: ['id', 'name', 'profileImage']
                }],
                order: [['createdAt', 'DESC']],
                limit,
                offset,
                attributes: ['id', 'type', 'content', 'isRead', 'createdAt']
            });

            return {
                status: 200,
                notifications: notifications.rows,
                totalCount: notifications.count,
                currentPage: page,
                totalPages: Math.ceil(notifications.count / limit)
            };
        } catch (error) {
            throw {
                status: 500,
                message: 'Error al obtener las notificaciones',
                error: error.message
            };
        }
    }
}

module.exports = new NotificationController();