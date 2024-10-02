import expressAsyncHandler from 'express-async-handler';
import { Tag } from '../models/tagModel.js';
import uploadOnCloudinary from '../utils/Cloudnary.js';

// @desc Get all tags
// @route GET /api/tag/all
// @access Public
export const getTags = expressAsyncHandler(async (req, res) => {
    const tags = await Tag.find();
    res.status(200).json(tags);
});

// @desc Get all tags
// @route GET /api/tag/name
// @access Public
export const getTagsName = expressAsyncHandler(async (req, res) => {
    const tags = await Tag.find({}, 'tag');
    const tagNames = tags.map(tag => tag.tag);
    res.status(200).json({ names: tagNames });
});

// @desc Get All posts By tag
// @route GEt /api/tag/:id/posts
// @access Public
export const getPostsByTag = expressAsyncHandler(async (req, res) => {
    const tagId = req.params.id;
    // Find the tag and populate posts
    const tag = await Tag.findById(tagId).populate({
        path: 'posts',
        populate: {
            path: 'owner_id',
            select: 'username name avatar badge'
        }
    });

    if (!tag) {
        res.status(404);
        throw new Error('Tag not found');
    }
    // Send the populated posts as a response
    res.json(tag.posts);
});

// @desc Create a new tag
// @route POST /api/tag/create
// @access Private Admin
export const createTag = expressAsyncHandler(async (req, res) => {
    const { tag, tagLine} = req.body;
    const existingTag = await Tag.findOne({ tag });
    
    const backgroundImagePath = req.file.path;

    if(!backgroundImagePath){
        res.status(400);
        throw new Error("image is required");
    }

    const backgroundImageCloudnary = await uploadOnCloudinary(backgroundImagePath);

    if (existingTag) {
        res.status(400);
        throw new Error('Tag already exists');
    }
    const newTag = new Tag({ tag, tagLine, backgroundImage: backgroundImageCloudnary.url , posts : []});
    await newTag.save();
    res.status(201).json(newTag);
});

// @desc Update tag
// @route PUT /api/tag/:id
// @access Private Admin
export const updateTag = expressAsyncHandler(async (req, res) => {
    const { tag, tagLine } = req.body;
    const updatedTag = await Tag.findByIdAndUpdate(
        req.params.id,
        { tag, tagLine },
        { new: true }
    ).populate('posts');
    if (!updatedTag) {
        res.status(404);
        throw new Error('Tag not found');
    }
    res.status(200).json(updatedTag);
});

// @desc Delete Tag
// @route DELETE /api/tag/:id
// @access Private Admin
export const deleteTag = expressAsyncHandler(async (req, res) => {
    const deletedTag = await Tag.findByIdAndDelete(req.params.id);
    if (!deletedTag) {
        res.status(404);
        throw new Error('Tag not found');
    }
    res.status(200).json({ message: 'Tag deleted successfully' });
});