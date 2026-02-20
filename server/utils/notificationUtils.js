import User from '../models/userModel.js';
import Notification from '../models/notificationModel.js';
import { getIO } from '../socket.js';

/**
 * Creates a notification for all admins.
 * @param {string} title - Notification title
 * @param {string} message - Notification message body
 * @param {string} type - 'info' | 'success' | 'warning' | 'error'
 * @param {string} link - Optional link to navigate to
 */
export const notifyAdmins = async (title, message, type = 'info', link = null) => {
    try {
        const admins = await User.find({ role: 'admin' });

        if (admins.length === 0) return;

        const notifications = admins.map(admin => ({
            userId: admin._id,
            title,
            message,
            type,
            link,
            read: false,
            createdAt: new Date()
        }));

        await Notification.insertMany(notifications);

        // Real-time: Emit to all admins
        const io = getIO();
        admins.forEach(admin => {
            io.to(admin._id.toString()).emit('notification_created', {
                title,
                message,
                type,
                link,
                createdAt: new Date()
            });
        });

        console.log(`[Notification] Sent to ${admins.length} admins: ${title}`);
    } catch (error) {
        console.error('[Notification] Failed to notify admins:', error);
    }
};

/**
 * Creates a notification for a specific user.
 */
export const notifyUser = async (userId, title, message, type = 'info', link = null) => {
    try {
        const notification = await Notification.create({
            userId,
            title,
            message,
            type,
            link
        });

        // Real-time: Emit to the target user
        const io = getIO();
        io.to(userId.toString()).emit('notification_created', notification);

        return notification;
    } catch (error) {
        console.error('[Notification] Failed to notify user:', error);
    }
};
