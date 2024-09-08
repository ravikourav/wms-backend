import express from 'express';
import { getNotifications, markAsRead } from '../controller/notification.Controller.js';
import validateToken from '../middleware/tokenValidationHandler.js';

const router = express.Router();

// Apply validateToken middleware to protect routes
router.use(validateToken(['user', 'admin']));

// Fetch all notifications
router.get('/', getNotifications);

// Mark a notification as read
router.put('/:notificationId/read', markAsRead);

export default router;