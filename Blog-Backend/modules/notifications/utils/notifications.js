const { Notification } = require('../../../../connection/db/schemas/notification-schema/notificationSchema');

const createNotification = async (notificationData) => {
    try {
        const notification = await Notification.create({
            senderId: notificationData.senderId,
            userId: notificationData.userId,
            type: notificationData.type,
            content: notificationData.content,
            isRead: false
        });

        return notification;
    } catch (error) {
        throw new Error(`Error al crear la notificación: ${error.message}`);
    }
};

const markAsRead = async (notificationId, userId) => {
    try {
        const [updatedRows] = await Notification.update(
            { isRead: true },
            { 
                where: { 
                    id: notificationId,
                    userId 
                }
            }
        );

        return updatedRows > 0;
    } catch (error) {
        throw new Error(`Error al marcar la notificación como leída: ${error.message}`);
    }
};

const getUnreadCount = async (userId) => {
    try {
        const count = await Notification.count({
            where: {
                userId,
                isRead: false
            }
        });

        return count;
    } catch (error) {
        throw new Error(`Error al obtener el conteo de notificaciones no leídas: ${error.message}`);
    }
};

module.exports = {
    createNotification,
    markAsRead,
    getUnreadCount
};