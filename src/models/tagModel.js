import mongoose from 'mongoose';

const tagSchema = new mongoose.Schema({
    tag: {
        type: String,
        required: true,
        unique: true
    },
    tagLine: {
        type: String,
        required: true,
    },
    backgroundImage: { 
        type: String,
        required: true,
    },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }]
}, { timestamps: true });

export const Tag = mongoose.model('Tag', tagSchema);
