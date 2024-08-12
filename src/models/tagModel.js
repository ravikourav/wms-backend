import mongoose from 'mongoose';

const tagSchema = new mongoose.Schema({
    tag: {
        type: String,
        required: true,
    },
    tagLine: {
        type: String,
        required: true,
    },
    imageURL: { 
        type: String,
        required: true,
    },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }]
}, { timestamps: true });

const Tag = mongoose.model('Tag', tagSchema);

export default Tag;
