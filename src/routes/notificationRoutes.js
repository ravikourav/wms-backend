import express from 'express';
import { getNotifications, addNotification, markAsRead } from '../controllers/notificationController.js';

const router = express.Router();

// Fetch all notifications
router.get('/', getNotifications);

// Add a new notification
router.post('/', addNotification);

// Mark a notification as read
router.put('/:id/read', markAsRead);

export default router;