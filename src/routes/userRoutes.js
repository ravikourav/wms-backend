import express from 'express';
import { registerUser, loginUser, currentUser, getUser, followUser, unFollowUser, checkFollowingStatus , getfollowers} from '../controller/userController.js';
import validateToken from '../middleware/tokenValidationHandler.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/:id' , getUser);
userRouter.get('/:userId/getfollowers' , getfollowers);

userRouter.use(validateToken(['user' , 'admin']));

userRouter.get('/current', currentUser);
userRouter.post('/:userId/follow', followUser);
userRouter.delete('/:userId/unfollow' , unFollowUser);
userRouter.get('/:userId/isfollowing' , checkFollowingStatus)

export default userRouter;