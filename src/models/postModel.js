import mongoose, { model } from "mongoose";

// Define the reply schema
const replySchema = new mongoose.Schema({
    reply_author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reply: {
        type: String,
        required: true
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }]
}, { timestamps: true });

// Define the comment schema
const commentSchema = new mongoose.Schema({
    comment_author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    replies: [replySchema]
},{ timestamps : true });

const postSchema = new mongoose.Schema({
    owner_id: {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : "User"
    },
    title : {
        type: String,
    },
    content :{
        type: String,
        required : true
    },
    author : {
        type: String,
        required : true
    },
    category: {
        type: String,
        required: true
    },
    tags: [{
        type: String,
        required: true
    }],
    contentColor: {
        type: String,
        required: true
    },
    authorColor: {
        type: String,
        required: true
    },
    tintColor: {
        type: String,
        required: true
    },
    backgroundImage: {
        type: String,
        required: true
    },
    width : {
        type : Number,
    },
    height : {
        type : Number,
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    comments: [commentSchema]

},{timestamps: true})

postSchema.index({ content: 'text' });

export const Post = model('Post' , postSchema);