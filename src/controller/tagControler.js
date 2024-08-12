import expressAsyncHandler from 'express-async-handler';
import Tag from '../models/tagModel.js';

// @desc Get all tags
// @route GET /api/tag/all
// @access Public
export const getTags = expressAsyncHandler(async (req, res) => {
    const tags = await Tag.find().populate('posts');
    res.status(200).json(tags);
});

// @desc Get tag by id
// @route GET /api/tag/:id
// @access Public
export const getTagById = expressAsyncHandler(async (req, res) => {
    const tag = await Tag.findById(req.params.id).populate('posts');
    if (!tag) {
        res.status(404);
        throw new Error('Tag not found');
    }
    res.status(200).json(tag);
});

// @desc Get All posts By tag
// @route GEt /api/tag/:id/posts
// @access Public
export const getPostsByTag = expressAsyncHandler(async (req, res) => {
    const tagId = req.params.id;
    // Find the tag and populate posts
    const tag = await Tag.findById(tagId).populate('posts');
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
    const { tag, tagLine, imageURL } = req.body;
    const newTag = new Tag({ tag, tagLine, imageURL });
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