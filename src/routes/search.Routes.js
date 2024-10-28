import express from 'express';
import { filterPosts, search } from '../controller/search.Controller.js';

const router = express.Router();

//Public Routes
router.put('/', search);
router.get('/filter' , filterPosts);

export default router;