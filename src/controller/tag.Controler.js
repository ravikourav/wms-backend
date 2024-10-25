import expressAsyncHandler from 'express-async-handler';
import { Tag } from '../models/tagModel.js';
import uploadOnCloudinary from '../utils/Cloudinary.js';

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

// @desc Get all posts by tag
// @route GET /api/tag/:id/posts
// @access Public
export const getPostsByTag = expressAsyncHandler(async (req, res) => {
    const tagId = req.params.id;
    const tag = await Tag.findById(tagId);

    if (!tag) {
        res.status(404);
        throw new Error('Tag not found');
    }

    // Fetch posts that match the tag
    const posts = await Post.find({ tags: tag.tag }).populate({
        path: 'owner_id',
        select: 'username name profile badge'
    });

    if (!posts.length) {
        res.status(404);
        throw new Error('No posts found for this tag');
    }

    res.json(posts);
});

// @desc Create a new tag
// @route POST /api/tag/create
// @access Private Admin
export const createTag = expressAsyncHandler(async (req, res) => {
    const { tag, tagLine } = req.body;
    const existingTag = await Tag.findOne({ tag });

    const backgroundImagePath = req.file?.path; // Using optional chaining

    if (!backgroundImagePath) {
        res.status(400);
        throw new Error("Image is required");
    }

    // Upload tag image to Cloudinary
    const backgroundImageCloudinary = await uploadOnCloudinary(backgroundImagePath, null, 'tag', tag);

    if (existingTag) {
        res.status(400);
        throw new Error('Tag already exists');
    }

    const newTag = new Tag({ 
        tag,
        tagLine,
        backgroundImage: backgroundImageCloudinary.url
    });

    await newTag.save();
    res.status(201).json(newTag);
});

// @desc Update tag
// @route PUT /api/tag/:id
// @access Private Admin
export const updateTag = expressAsyncHandler(async (req, res) => {
    const { tag, tagLine } = req.body;

    // Find the tag by ID
    const tagToUpdate = await Tag.findById(req.params.id);

    if (!tagToUpdate) {
        res.status(404);
        throw new Error('Tag not found');
    }

    // Update the tag fields
    tagToUpdate.tag = tag || tagToUpdate.tag;
    tagToUpdate.tagLine = tagLine || tagToUpdate.tagLine;
    
    // Check if there's an image to upload
    const backgroundImagePath = req.file?.path;
    if (backgroundImagePath) {
        // Upload the new image to Cloudinary
        const backgroundImageCloudinary = await uploadOnCloudinary(backgroundImagePath, null, 'tag', tag);
        
        // Update the image URL in the tag
        tagToUpdate.backgroundImage = backgroundImageCloudinary.url;
    }

    // Save the updated tag
    const updatedTag = await tagToUpdate.save();

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