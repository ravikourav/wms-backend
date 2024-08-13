import expressAsyncHandler from "express-async-handler";
import { User } from "../models/userModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

//@desc Register a user
//@route POST/api/user/register
//@access public
export const registerUser = expressAsyncHandler(async (req, res) => {
    const {name, username, email, password , role } = req.body;

    if(!name || !username || !email || !password){
        res.status(400);
        throw new Error('All field are mandatory!');
    }

    if (role === 'admin') {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    const userExists = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    //Hash Password 
    const hashedPassword = await bcrypt.hash(password, 8);

    // Create new user
    const newUser = new User({
        
        name,
        username,
        email,
        password: hashedPassword,
        followers: [],
        following: [],
        posts: [],
        saved: [],
        role: role || 'user'
    });

    // Save user to the database
    const createdUser = await newUser.save();
    const accessToken = jwt.sign(
    {
        user:{
            id: createdUser.id,
            name: createdUser.name,
            username: createdUser.username,
            email: createdUser.email,
            role : createdUser.role
        }
    },process.env.ACCESS_TOKEN_SECRET,{expiresIn:'7d'});

    res.status(201).json({_id: newUser.id , accessToken});
});

//@desc LogIn user
//@route POST/api/user/login
//@access public
export const loginUser = expressAsyncHandler(async (req, res) => {
    const { username , password } = req.body;

    if(!username || !password){
        res.status(400);
        throw new Error('All field are mandatory!');
    }
    
    const user = await User.findOne({username});

    if(user && (await bcrypt.compare(password, user.password))){
        const accessToken = jwt.sign(
            {
                user:{
                    id: user.id,
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    role : user.role
                }
            },process.env.ACCESS_TOKEN_SECRET,{expiresIn:'7d'});

        res.status(200).json({accessToken});
    }else{
        res.status(401);
        throw new Error('username or Password is not valid');
    }
});

//@desc current user
//@route POST/api/user/current
//@access private
export const currentUser = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = await User.findOne({_id: id});
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    user.password = undefined;
    res.status(200).json(user);
});

//@desc get user by Id
//@route GET/api/user/:id
//@access public 
export const getUser = expressAsyncHandler(async(req, res)=>{
    const { id } = req.params;
    const user = await User.findById(id)
        .populate('posts') // Populate posts
        .populate('saved'); // Populate saved posts
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    user.password = undefined;
    res.status(200).json(user);
});

//@desc Follow User
//@route POST/api/user/:id/getfollowers
//@access public
export const getfollowers = expressAsyncHandler(async(req, res)=>{
    const { userId } = req.params;
    const user = await User.findById(userId)
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    res.status(200).json(user.followers);
});

//@desc Follow User
//@route POST/api/user/:id/follow
//@access private
export const followUser = expressAsyncHandler(async (req , res) => {
    const userIdToFollow = req.params.userId;
    const currentUserId = req.user.id;

    const userToFollow = await User.findById(userIdToFollow);
    if (!userToFollow) {
        res.status(404);
        throw new Error("User not found");
    }

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
        res.status(404);
        throw new Error("Current user not found");
    }

    if (currentUser.following.includes(userIdToFollow)) {
        res.status(400);
        throw new Error("You are already following this user");
    }

    if (currentUserId === userIdToFollow){
        res.status(400);
        throw new Error("You cannot follow yourself");
    }

    currentUser.following.push(userIdToFollow);
    userToFollow.followers.push(currentUserId);

    await currentUser.save();
    await userToFollow.save();

    res.status(200).json({ message: "User followed successfully" });
});

//@desc Unfollow User
//@route DELETE/api/user/:id/Unfollow
//@access private
export const unFollowUser = expressAsyncHandler(async (req , res) => {
    const userIdToUnfollow = req.params.userId;
    const currentUserId = req.user.id;

    const userToUnfollow = await User.findById(userIdToUnfollow);
    if (!userToUnfollow) {
        res.status(404);
        throw new Error("User not found");
    }

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
        res.status(404);
        throw new Error("Current user not found");
    }

    if (!currentUser.following.includes(userIdToUnfollow)) {
        res.status(400);
        throw new Error("You are not following this user");
    }

    // Remove from following and followers lists
    currentUser.following = currentUser.following.filter(id => id.toString() !== userIdToUnfollow);
    userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== currentUserId);

    await currentUser.save();
    await userIdToUnfollow.save();

    res.status(200).json({ message: "User unfollowed successfully" });
});

//@desc isfollow User
//@route GET/api/user/:userId/isfollowing
//@access private  
export const checkFollowingStatus = expressAsyncHandler(async(req,res)=>{
    const userToCheck = req.params.userId;
    const currentUser = req.user.id;

    const user = await User.findById(currentUser);
    const isfollowing = user.following.includes(userToCheck);

    res.status(200).json({isfollowing});
});