import express from 'express';
import { search } from '../controller/search.Controller.js';

const router = express.Router();

//Public Routes
router.put('/', search);

export default router;