import mongoose from 'mongoose';

const tagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true,
    },
    backgroundImage: { 
        type: String,
        required: true,
    },
    postCount:{
        type: Number,
    }
}, { timestamps: true });

export const Tag = mongoose.model('Tag', tagSchema);
