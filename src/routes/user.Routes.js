import express from 'express';
import { registerUser, loginUser, currentUser, getUser, followUser, unFollowUser, checkFollowingStatus , getfollowers , updateUser, getProfilePicture} from '../controller/user.Controller.js';
import validateToken from '../middleware/tokenValidationHandler.js';
import { upload } from '../middleware/multer.js';

const userRouter = express.Router();

userRouter.post('/register', upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'coverImg', maxCount: 1 }
]), registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/:username' , getUser);
userRouter.get('/:userId/getfollowers' , getfollowers);
userRouter.get('/:username/getProfilePicture', getProfilePicture);
userRouter.use(validateToken(['user' , 'admin']));

userRouter.put('/:id/update', upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'coverImg', maxCount: 1 }
]), updateUser);

userRouter.get('/current', currentUser);
userRouter.post('/:userId/follow', followUser);
userRouter.post('/:userId/unfollow' , unFollowUser);
userRouter.get('/:userId/isfollowing' , checkFollowingStatus)

export default userRouter;