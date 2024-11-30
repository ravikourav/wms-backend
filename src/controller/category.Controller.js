import expressAsyncHandler from 'express-async-handler';
import { Category } from '../models/categoryModel.js';
import { Post } from '../models/postModel.js';
import uploadOnCloudinary from '../utils/Cloudinary.js';

// @desc Get all categories
// @route GET /api/category/all
// @access Public
export const getCategories = expressAsyncHandler(async (req, res) => {
    const categories = await Category.find();
    res.status(200).json(categories);
});

// @desc Get all category names
// @route GET /api/category/names
// @access Public
export const getCategoryNames = expressAsyncHandler(async (req, res) => {
    const categories = await Category.find({}, 'name');
    const categoryNames = categories.map(category => category.name);
    res.status(200).json({ names: categoryNames });
});

// @desc Get all posts by category
// @route GET /api/category/:id/posts
// @access Public
export const getPostsByCategory = expressAsyncHandler(async (req, res) => {
    const categoryId = req.params.id;
    
    // Fetch posts that match the category ID
    const posts = await Post.find({ category: categoryId }).populate({
        path: 'owner_id',
        select: 'username name profile badge'
    });

    if (!posts.length) {
        res.status(404);
        throw new Error('No posts found for this category');
    }

    res.json(posts);
});

// @desc Create a new category
// @route POST /api/category/create
// @access Private Admin
export const createCategory = expressAsyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const existingCategory = await Category.findOne({ name });

    const imagePath = req.file?.path; // Using optional chaining

    if (!imagePath) {
        res.status(400);
        throw new Error("Image is required");
    }

    // Upload category image to Cloudinary
    const imageCloudinary = await uploadOnCloudinary(imagePath, null, 'categories', name);

    if (existingCategory) {
        res.status(400);
        throw new Error('Category already exists');
    }

    const newCategory = new Category({
        name,
        description,
        backgroundImage: imageCloudinary.secure_url, // Using backgroundImage to match your schema
    });

    await newCategory.save();
    res.status(201).json(newCategory);
});

// @desc Update category
// @route PUT /api/category/:id
// @access Private Admin
export const updateCategory = expressAsyncHandler(async (req, res) => {
    const { name, description } = req.body;

    const categoryToUpdate = await Category.findById(req.params.id);

    if (!categoryToUpdate) {
        res.status(404);
        throw new Error('Category not found');
    }

    categoryToUpdate.name = name || categoryToUpdate.name;
    categoryToUpdate.description = description || categoryToUpdate.description;

    const imagePath = req.file?.path; // Using optional chaining
    if (imagePath) {
        const imageCloudinary = await uploadOnCloudinary(imagePath, null, 'categories', name);
        categoryToUpdate.backgroundImage = imageCloudinary.secure_url; // Using backgroundImage
    }

    const updatedCategory = await categoryToUpdate.save();
    res.status(200).json(updatedCategory);
});

// @desc Delete category
// @route DELETE /api/category/:id
// @access Private Admin
export const deleteCategory = expressAsyncHandler(async (req, res) => {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);
    if (!deletedCategory) {
        res.status(404);
        throw new Error('Category not found');
    }
    res.status(200).json({ message: 'Category deleted successfully' });
});