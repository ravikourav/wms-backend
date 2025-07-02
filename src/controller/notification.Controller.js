import expressAsyncHandler from 'express-async-handler';
import { Notification } from '../models/notificationModel.js';
import { User } from '../models/userModel.js';

// @desc Get all notifications
// @route GET /api/notifications
// @access Private
export const getNotifications = expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).populate({
        path: 'notifications',
        populate: [
            {
                path: 'post',
                select: 'backgroundImage',
            },
            {
                path: 'sender', // Assuming you have a user field in the notification schema
                select: 'profile username name badge', // populate the user with their profile picture and username
            },
        ],
    });

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    res.status(200).json(user.notifications);
});

// @desc Mark all notifications as read
// @route PUT /api/notifications/mark-all-read
// @access Private
export const markAllAsRead = expressAsyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  let updated = false;
  user.notifications.forEach((notif) => {
    if (!notif.read) {
      notif.read = true;
      updated = true;
    }
  });

  if (updated) {
    await user.save();
  }

  res.status(200).json({ message: 'All notifications marked as read', notifications: user.notifications });
});