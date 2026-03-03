const { Notification } = require('../../../connection/db/schemas/notification-schema/notificationSchema');
const { Op } = require('sequelize');

/**
 * Crea una nueva notificación en la base de datos.
 * @param {object} notificationData - { user_id, type, message }
 */
const createNotification = async (notificationData) => {
    try {
        const notification = await Notification.create({
            user_id: notificationData.user_id,
            type: notificationData.type,
            message: notificationData.message,
            read: false,
            creationDate: new Date(),
        });
        return notification;
    } catch (error) {
        throw new Error(`Error al crear la notificación: ${error.message}`);
    }
};

/**
 * Marca una notificación específica como leída.
 * @param {number} notificationId
 * @param {number} userId
 */
const markAsRead = async (notificationId, userId) => {
    try {
        const [updatedRows] = await Notification.update(
            { read: true, readedDate: new Date() },
            {
                where: {
                    id: notificationId,
                    user_id: userId,
                },
            }
        );
        return updatedRows > 0;
    } catch (error) {
        throw new Error(`Error al marcar la notificación como leída: ${error.message}`);
    }
};

/**
 * Obtiene todas las notificaciones de un usuario con paginación.
 * @param {number} userId
 * @param {number} page
 * @param {number} limit
 */
const getAllNotifications = async (userId, page = 1, limit = 10) => {
    try {
        const offset = (page - 1) * limit;
        const result = await Notification.findAndCountAll({
            where: { user_id: userId },
            order: [['creationDate', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
            attributes: ['id', 'type', 'message', 'read', 'creationDate', 'readedDate'],
        });
        return {
            notifications: result.rows,
            totalCount: result.count,
            currentPage: parseInt(page),
            totalPages: Math.ceil(result.count / limit),
        };
    } catch (error) {
        throw new Error(`Error al obtener las notificaciones: ${error.message}`);
    }
};

/**
 * Obtiene las notificaciones no leídas de un usuario.
 * @param {number} userId
 */
const getUnreadNotifications = async (userId) => {
    try {
        const notifications = await Notification.findAll({
            where: { user_id: userId, read: false },
            order: [['creationDate', 'DESC']],
            attributes: ['id', 'type', 'message', 'read', 'creationDate'],
        });
        return {
            notifications,
            totalCount: notifications.length,
        };
    } catch (error) {
        throw new Error(`Error al obtener las notificaciones no leídas: ${error.message}`);
    }
};

/**
 * Obtiene el conteo de notificaciones no leídas.
 * @param {number} userId
 */
const getUnreadCount = async (userId) => {
    try {
        const count = await Notification.count({
            where: { user_id: userId, read: false },
        });
        return count;
    } catch (error) {
        throw new Error(`Error al obtener el conteo de notificaciones no leídas: ${error.message}`);
    }
};

/**
 * Obtiene notificaciones de un usuario filtradas por tipo.
 * @param {number} userId
 * @param {string} type
 * @param {number} page
 * @param {number} limit
 */
const getNotificationsByType = async (userId, type, page = 1, limit = 10) => {
    try {
        const offset = (page - 1) * limit;
        const result = await Notification.findAndCountAll({
            where: { user_id: userId, type },
            order: [['creationDate', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
            attributes: ['id', 'type', 'message', 'read', 'creationDate', 'readedDate'],
        });
        return {
            notifications: result.rows,
            totalCount: result.count,
            currentPage: parseInt(page),
            totalPages: Math.ceil(result.count / limit),
        };
    } catch (error) {
        throw new Error(`Error al obtener las notificaciones por tipo: ${error.message}`);
    }
};

module.exports = {
    createNotification,
    markAsRead,
    getAllNotifications,
    getUnreadNotifications,
    getUnreadCount,
    getNotificationsByType,
};