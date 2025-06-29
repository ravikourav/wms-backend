import express from 'express';
import { getCategories, getCategoryNames, createCategory, updateCategory, deleteCategory, getPostsByCategory } from '../controller/category.Controller.js';
import validateToken from '../middleware/tokenValidationHandler.js';
import { upload } from '../middleware/multer.js';


const router = express.Router();

// Public
router.get('/all', getCategories);
router.get('/names', getCategoryNames);
router.get('/:id/posts' , getPostsByCategory);

router.use(validateToken(['admin']));

router.post('/create', upload.single('backgroundImage'), createCategory);
router.put('/:id', upload.single('backgroundImage'), updateCategory);
router.delete('/:id', deleteCategory);

export default router;
