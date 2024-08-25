import express from 'express';
import { createTag, deleteTag, getPostsByTag, getTags, getTagsName, updateTag } from '../controller/tag.Controler.js';
import validateToken from '../middleware/tokenValidationHandler.js';

const router = express.Router();

//Public Routes
router.get('/all' , getTags);
router.get('/name' , getTagsName);
router.get('/:id/posts' , getPostsByTag);

router.use(validateToken('admin'));

//Private Routes Admin Only
router.post('/create' , createTag);
router.put('/:id' , updateTag);
router.delete('/:id' , deleteTag);

export default router;