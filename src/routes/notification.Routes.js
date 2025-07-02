import express from 'express';
import { getNotifications, markAllAsRead } from '../controller/notification.Controller.js';
import validateToken from '../middleware/tokenValidationHandler.js';

const router = express.Router();

// Apply validateToken middleware to protect routes
router.use(validateToken(['user', 'admin']));

// Fetch all notifications
router.get('/', getNotifications);

// Mark a notification as read
router.put('/mark-all-read', markAllAsRead);

export default router;