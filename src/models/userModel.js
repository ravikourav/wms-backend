import mongoose from "mongoose";

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
        minlength: 6 // Example validation
    },
    avatar:{
        type: String
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
    role : {
        type: String,
        enum: ['user' , 'admin'],
        default : 'user' 
    }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
