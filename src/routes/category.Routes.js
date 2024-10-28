import express from 'express';
import { getCategories, getCategoryNames, createCategory, updateCategory, deleteCategory } from '../controller/category.Controller.js';
import validateToken from '../middleware/tokenValidationHandler.js';
import { upload } from '../middleware/multer.js';


const router = express.Router();

// Public
router.get('/all', getCategories);
router.get('/names', getCategoryNames);


router.use(validateToken(['admin']));

router.post('/create', upload.single('backgroundImage'), createCategory);
router.put('/:id', upload.single('backgroundImage'), updateCategory);
router.delete('/:id', validateToken(['admin']), deleteCategory);

export default router;
