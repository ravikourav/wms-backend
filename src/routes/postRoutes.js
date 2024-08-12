import express from 'express';
import { getAllPosts, getUserPosts, createPost, getPost, updatePost, deletePost, likePost, addComment, likeComment, addReply, likeReply } from '../controller/postController.js';
import validateToken from '../middleware/tokenValidationHandler.js';

const router = express.Router();

// Fetch all posts
router.get('/all', getAllPosts);

// Fetch posts by a specific user
router.get('/user/:userId', getUserPosts);

// Apply validateToken middleware to protect routes
router.use(validateToken(['user', 'admin']));

// Protected routes

router.post('/create', createPost);
router.get('/:id', getPost);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);
router.put('/:postId/like', likePost);
router.post('/:postId/comments', addComment);
router.put('/:postId/comments/:commentId/like', likeComment);
router.post('/:postId/comments/:commentId/replies', addReply);
router.put('/:postId/comments/:commentId/replies/:replyId/like', likeReply);

export default router;
