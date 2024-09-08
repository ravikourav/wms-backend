import mongoose from 'mongoose';

export const notificationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['follow', 'comment' , 'reply' , 'like' , 'mention'],
        required: true
    },
    post: {
        type : mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: function() {
            return this.type !== 'follow'
        }
    },
    sender :{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    data : {
        type : Object,
        default: {}
    },
    read: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const Notification = mongoose.model('Notification', notificationSchema);
