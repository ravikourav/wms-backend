import expressAsyncHandler from 'express-async-handler';
import { Tag } from '../models/tagModel.js';
import { Post } from '../models/postModel.js';
import { deleteImageFromCloudinary } from '../utils/Cloudinary.js';
import uploadOnCloudinary from '../utils/Cloudinary.js';

// @desc Get all tags
// @route GET /api/tag/all
// @access Public
export const getTags = expressAsyncHandler(async (req, res) => {
    const tags = await Tag.find();
    res.status(200).json(tags);
});

// @desc Get all tag names
// @route GET /api/tag/names
// @access Public
export const getTagsName = expressAsyncHandler(async (req, res) => {
    const tags = await Tag.find({}, 'name'); // Query only 'name' field
    const tagNames = tags.map(tag => tag.name);
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

    // Fetch posts that match the tag name (instead of tag)
    const posts = await Post.find({ tags: tag.name }).populate({
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
    const { name, description } = req.body;
    const existingTag = await Tag.findOne({ name });

    if (existingTag) {
        res.status(400);
        throw new Error('Tag already exists');
    }

    const backgroundImagePath = req.file?.path;

    if (!backgroundImagePath) {
        res.status(400);
        throw new Error("Image is required");
    }

    // Upload tag image to Cloudinary
    const backgroundImageCloudinary = await uploadOnCloudinary(backgroundImagePath, null, 'tag', name);

    const newTag = new Tag({
        name,
        description,
        backgroundImage: backgroundImageCloudinary.secure_url,
        postCount: 0  // Initialize postCount to 0
    });

    await newTag.save();
    res.status(201).json(newTag);
});

// @desc Update tag
// @route PUT /api/tag/:id
// @access Private Admin
export const updateTag = expressAsyncHandler(async (req, res) => {
    const { name, description } = req.body;

    // Find the tag by ID
    const tagToUpdate = await Tag.findById(req.params.id);

    if (!tagToUpdate) {
        res.status(404);
        throw new Error('Tag not found');
    }

    // Update the tag fields
    tagToUpdate.name = name || tagToUpdate.name;
    tagToUpdate.description = description || tagToUpdate.description;

    // Check if there's an image to upload
    const backgroundImagePath = req.file?.path;
    if (backgroundImagePath) {
        // Upload the new image to Cloudinary
        const backgroundImageCloudinary = await uploadOnCloudinary(backgroundImagePath, null, 'tag', name);

        // Update the image URL in the tag
        tagToUpdate.backgroundImage = backgroundImageCloudinary.secure_url;
    }

    // Save the updated tag
    const updatedTag = await tagToUpdate.save();

    res.status(200).json(updatedTag);
});

// @desc Delete Tag
// @route DELETE /api/tag/:id
// @access Private Admin
export const deleteTag = expressAsyncHandler(async (req, res) => {
    const tagToDelete = await Tag.findById(req.params.id);
    if (!tagToDelete) {
        res.status(404);
        throw new Error('Tag not found');
    }

    // Delete the image from Cloudinary
    await deleteImageFromCloudinary(tagToDelete.backgroundImage);

    // Delete the tag
    await Tag.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Tag deleted successfully' });
});