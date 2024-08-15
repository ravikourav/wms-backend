import express from 'express';
import { createTag, deleteTag, getPostsByTag, getTagById, getTags, updateTag } from '../controller/tag.Controler.js';
import validateToken from '../middleware/tokenValidationHandler.js';

const router = express.Router();

//Public Routes
router.get('/all' , getTags);
router.get('/:id', getTagById);
router.get('/tags/:id/posts' , getPostsByTag);

router.use(validateToken(['admin']));

//Private Routes Admin Only
router.post('/create' , createTag);
router.put('/:id' , updateTag);
router.delete('/:id' , deleteTag);

export default router;