import mongoose from 'mongoose';

export const notificationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['follow', 'comment', 'like', 'mention'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const Notification = mongoose.model('Notification', notificationSchema);
