import expressAsyncHandler from 'express-async-handler';
import { Notification } from '../models/notificationModel.js';
import { User } from '../models/userModel.js';

// @desc Get all notifications
// @route GET /api/notifications
// @access Private
export const getNotifications = expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select('notifications');
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    res.status(200).json(user.notifications);
});

// @desc Add a new notification
// @route POST /api/notifications
// @access Private
export const addNotification = expressAsyncHandler(async (req, res) => {
    const { id, type, title, message } = req.body;

    const user = await User.findById(id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (!id || !type || !title || !message ) {
        res.status(400);
        throw new Error('All fields are required');
    }

    const newNotification = {
        type,
        title,
        message,
        read: false,
    };

    user.notifications.push(newNotification);
    await user.save();
    res.status(201).json(user.notifications);
});

// @desc Mark a notification as read
// @route PUT /api/notifications/:id/read
// @access Private
export const markAsRead = expressAsyncHandler(async (req, res) => {
    const { notificationId } = req.params;
    const user = await User.findById(req.user.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const notification = user.notifications.id(notificationId);
    if (!notification) {
        res.status(404);
        throw new Error('Notification not found');
    }

    notification.read = true;
    await user.save();

    res.status(200).json(user.notifications);
});
