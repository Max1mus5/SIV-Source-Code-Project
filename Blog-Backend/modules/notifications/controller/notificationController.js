const { Notification } = require('../../../connection/db/schemas/notification-schema/notificationSchema');
const {
    createNotification,
    markAsRead,
    getAllNotifications,
    getUnreadNotifications,
    getNotificationsByType,
} = require('../utils/notifications');

class NotificationController {

    /**
     * Obtiene todas las notificaciones paginadas del usuario.
     * Llamado por: GET /notifications/
     */
    async getAllNotifications(userId, page = 1, limit = 10) {
        try {
            const data = await getAllNotifications(userId, page, limit);
            return { status: 200, ...data };
        } catch (error) {
            throw { status: 500, message: 'Error al obtener las notificaciones', error: error.message };
        }
    }

    /**
     * Obtiene las notificaciones no leídas del usuario.
     * Llamado por: GET /notifications/unread
     */
    async getUnreadNotifications(userId) {
        try {
            const data = await getUnreadNotifications(userId);
            return { status: 200, ...data };
        } catch (error) {
            throw { status: 500, message: 'Error al obtener las notificaciones no leídas', error: error.message };
        }
    }

    /**
     * Crea una nueva notificación para un usuario.
     * @param {number} receiverId - ID del usuario que recibe la notificación
     * @param {string} type       - Tipo ('comment', 'reaction', 'post', 'system')
     * @param {string} message    - Texto descriptivo
     */
    async createNewNotification(receiverId, type, message) {
        try {
            const notification = await createNotification({
                user_id: receiverId,
                type,
                message,
            });
            return { status: 201, notification };
        } catch (error) {
            throw { status: 500, message: 'Error al crear la notificación', error: error.message };
        }
    }

    /**
     * Marca una notificación específica como leída.
     * Llamado por: PUT /notifications/:id/read
     */
    async markAsRead(notificationId, userId) {
        try {
            const result = await markAsRead(notificationId, userId);
            if (!result) {
                throw { status: 404, message: 'Notificación no encontrada' };
            }
            return { status: 200, message: 'Notificación marcada como leída' };
        } catch (error) {
            throw error.status ? error : { status: 500, message: error.message };
        }
    }

    /**
     * Marca todas las notificaciones del usuario como leídas.
     * Llamado por: PUT /notifications/read-all
     */
    async markAllAsRead(userId) {
        try {
            await Notification.update(
                { read: true, readedDate: new Date() },
                { where: { user_id: userId, read: false } }
            );
            return { status: 200, message: 'Todas las notificaciones han sido marcadas como leídas' };
        } catch (error) {
            throw { status: 500, message: 'Error al marcar las notificaciones como leídas', error: error.message };
        }
    }

    /**
     * Elimina una notificación específica del usuario.
     * Llamado por: DELETE /notifications/:id
     */
    async deleteNotification(notificationId, userId) {
        try {
            const deleted = await Notification.destroy({
                where: { id: notificationId, user_id: userId },
            });
            if (!deleted) {
                throw { status: 404, message: 'Notificación no encontrada' };
            }
            return { status: 200, message: 'Notificación eliminada exitosamente' };
        } catch (error) {
            throw error.status ? error : { status: 500, message: error.message };
        }
    }

    /**
     * Obtiene una notificación por ID.
     * Llamado por: GET /notifications/:id
     */
    async getNotificationById(notificationId, userId) {
        try {
            const notification = await Notification.findOne({
                where: { id: notificationId, user_id: userId },
                attributes: ['id', 'type', 'message', 'read', 'creationDate', 'readedDate'],
            });
            if (!notification) {
                throw { status: 404, message: 'Notificación no encontrada' };
            }
            return { status: 200, notification };
        } catch (error) {
            throw error.status ? error : { status: 500, message: 'Error al obtener la notificación', error: error.message };
        }
    }

    /**
     * Obtiene notificaciones del usuario filtradas por tipo.
     * Llamado por: GET /notifications/type/:type
     */
    async getNotificationsByType(userId, type, page = 1, limit = 10) {
        try {
            const data = await getNotificationsByType(userId, type, page, limit);
            return { status: 200, ...data };
        } catch (error) {
            throw { status: 500, message: 'Error al obtener las notificaciones por tipo', error: error.message };
        }
    }
}

module.exports = new NotificationController();