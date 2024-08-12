import expressAsyncHandler from 'express-async-handler';
import { Notification } from '../models/notificationModel.js';

// @desc Get all notifications
// @route GET /api/notifications
// @access Private
export const getNotifications = expressAsyncHandler(async (req, res) => {
    const notifications = await Notification.find({}).sort({ timestamp: -1 });
    res.json(notifications);
});

// @desc Add a new notification
// @route POST /api/notifications
// @access Private
export const addNotification = expressAsyncHandler(async (req, res) => {
    const { id, type, title, message, timestamp, read } = req.body;

    if (!id || !type || !title || !message || !timestamp) {
        res.status(400);
        throw new Error('All fields are required');
    }

    const newNotification = new Notification({ id, type, title, message, timestamp, read });
    await newNotification.save();
    res.status(201).json(newNotification);
});

// @desc Mark a notification as read
// @route PUT /api/notifications/:id/read
// @access Private
export const markAsRead = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;

    const notification = await Notification.findById(id);

    if (!notification) {
        res.status(404);
        throw new Error('Notification not found');
    }

    notification.read = true;
    await notification.save();
    res.status(200).json(notification);
});
