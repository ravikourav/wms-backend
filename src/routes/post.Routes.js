import express from 'express';
import { getAllPosts, getUserPosts, createPost, getPost, updatePost, deletePost, likePost, unlikePost, addComment, likeComment, addReply, likeReply, unlikeComment, unlikeReply, deleteComment, deleteReply} from '../controller/post.Controller.js';
import validateToken from '../middleware/tokenValidationHandler.js';
import { upload } from '../middleware/multer.js';

const router = express.Router();

// Fetch all posts
router.get('/all', getAllPosts);

// Fetch posts by a specific user
router.get('/user/:userId', getUserPosts);

// featch Single Post By Id
router.get('/:id', getPost);

// Apply validateToken middleware to protect routes
router.use(validateToken(['user', 'admin']));

// Protected routes

//post routes
router.post('/create', upload.single('backgroundImage'), createPost);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);
router.post('/:postId/like', likePost);
router.post('/:postId/unlike', unlikePost);

//comment routes
router.post('/:postId/comment', addComment);
router.delete('/:postId/comment/:commentId' , deleteComment);
router.post('/:postId/comment/:commentId/like', likeComment);
router.post('/:postId/comment/:commentId/unlike' , unlikeComment)

//reply routes
router.post('/:postId/comment/:commentId/reply', addReply);
router.delete('/:postId/comment/:commentId/reply/:replyId' , deleteReply);
router.post('/:postId/comment/:commentId/reply/:replyId/like', likeReply);
router.post('/:postId/comment/:commentId/reply/:replyId/unlike', unlikeReply);

export default router;
