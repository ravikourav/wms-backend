import express from 'express';
import { registerUser, loginUser, getUser, getUserPosts, getUserSavedPosts,getPopulatedFollowers, getPopulatedFollowing, followUser, unFollowUser, getfollowers, updateUser} from '../controller/user.Controller.js';
import validateToken from '../middleware/tokenValidationHandler.js';
import { upload } from '../middleware/multer.js';
import optionalToken from '../middleware/optinalToken.js';

const userRouter = express.Router();

userRouter.post('/register', upload.fields([
    { name: 'profile', maxCount: 1 },
    { name: 'coverImg', maxCount: 1 }
]), registerUser);
userRouter.post('/login', loginUser);

userRouter.get('/:username' , getUser);
userRouter.get('/:username/posts',optionalToken, getUserPosts);
userRouter.get('/:username/saved',optionalToken, getUserSavedPosts);

userRouter.get('/:userId/following', getPopulatedFollowing);
userRouter.get('/:userId/followers', getPopulatedFollowers);

userRouter.get('/:userId/getfollowers' , getfollowers);

userRouter.use(validateToken(['user' , 'admin']));

//private routes
userRouter.put('/:id/update', upload.fields([
    { name: 'profile', maxCount: 1 },
    { name: 'coverImg', maxCount: 1 }
]), updateUser);

userRouter.post('/:userId/follow', followUser);
userRouter.post('/:userId/unfollow' , unFollowUser);


export default userRouter;