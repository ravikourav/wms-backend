import express from 'express';
import { getCategories, getCategoryNames, createCategory, updateCategory, deleteCategory } from '../controller/category.Controller.js';
import validateToken from '../middleware/tokenValidationHandler.js';


const router = express.Router();

// @desc Get all categories
// @route GET /api/category/all
// @access Public
router.get('/all', getCategories);

// @desc Get all category names
// @route GET /api/category/names
// @access Public
router.get('/names', getCategoryNames);

// @desc Create a new category
// @route POST /api/category/create
// @access Private Admin
router.post('/create', validateToken(['admin']), createCategory);

// @desc Update a category
// @route PUT /api/category/:id
// @access Private Admin
router.put('/:id', validateToken(['admin']), updateCategory);

// @desc Delete a category
// @route DELETE /api/category/:id
// @access Private Admin
router.delete('/:id', validateToken(['admin']), deleteCategory);

export default router;
