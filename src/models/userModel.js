import mongoose from "mongoose";
import { notificationSchema } from "./notificationModel.js";

const userSchema = new mongoose.Schema({
    name: {
        type : String,
        require: true
    },
    username: {
        type: String,
        required: [true, 'Please enter username'],
        unique: true
    },
    email: {
        type: String,
        required: [true, 'Please enter email'],
        match: [/.+@.+\..+/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Please enter password'],
        minlength: 6 
    },
    profile:{
        type: String
    },
    coverImg:{
        type: String
    },
    bio: {
        type: String,
        maxlength: 160
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    posts : [{
        type : mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }],
    saved : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Post'
    }],
    notifications: [notificationSchema],
    role : {
        type: String,
        enum: ['user' , 'admin'],
        default : 'user' 
    },
    badge: {
        type: String,
        enum: ['blue', 'green', 'gold', 'red', 'none'],
        default: 'none'
    }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
