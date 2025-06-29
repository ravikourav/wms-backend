import expressAsyncHandler from "express-async-handler";
import { User } from "../models/userModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import uploadOnCloudinary from "../utils/Cloudinary.js";

//@desc Register a user
//@route POST/api/user/register
//@access public
export const registerUser = expressAsyncHandler(async (req, res) => {
    const {name, username, email, password , role } = req.body;

    const normalizedUsername = username.toLowerCase();
    const normalizedEmail = email.toLowerCase();

    if(!name || !username || !email || !password){
        res.status(400);
        throw new Error('All field are mandatory!');
    }

    if (role === 'admin') {
        res.status(403)
        throw new Error('Unauthorized');
    }

    const userExists = await User.findOne({
        $or: [{ email: normalizedEmail }, { username: normalizedUsername }]
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
        username: normalizedUsername,
        email: normalizedEmail,
        password: hashedPassword,
        profile: '',
        coverImg: '',
        bio: '',
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

    const normalizedUsername = username.toLowerCase();
    
    const user = await User.findOne({normalizedUsername});

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
    const { id } = req.user.id;
    const user = await User.findOne({_id: id});
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    user.password = undefined;
    user.notifications = undefined;
    res.status(200).json(user);
});

//@desc get user by Id
//@route GET/api/user/:id
//@access public 
export const getUser = expressAsyncHandler(async(req, res)=>{
    const { username } = req.params;

    const user = await User.findOne({ username })
        .populate({
            path: 'posts',
            populate: {
                path: 'owner_id', // Populate the author field in posts
                select: 'username name profile badge', // Only return username and profile for the author
            }
        })
        .populate({
            path: 'saved',
            populate: {
                path: 'owner_id', // Populate the author field in saved posts
                select: 'username name profile badge', // Only return username and profile for the author
            }
        });

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.notifications;
    res.status(200).json(userObj);
});

//@desc Get Populated Followers
//@route GET /api/user/:userId/followers
//@access Public
export const getPopulatedFollowers = expressAsyncHandler(async (req, res) => {
    const { userId } = req.params;
    const user = await User.findById(userId).populate({
        path: 'followers',
        select: 'username name profile badge'
    });

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    res.status(200).json(user.followers);
});

//@desc Get Populated Following
//@route GET /api/user/:userId/following
//@access Public
export const getPopulatedFollowing = expressAsyncHandler(async (req, res) => {
    const { userId } = req.params;
    const user = await User.findById(userId).populate({
        path: 'following',
        select: 'username name profile badge'
    });

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    res.status(200).json(user.following);
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

// @desc Follow User
// @route POST /api/user/:userId/follow
// @access Private
export const followUser = expressAsyncHandler(async (req, res) => {
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

    if (currentUserId === userIdToFollow) {
        res.status(400);
        throw new Error("You cannot follow yourself");
    }

    // Update following and followers lists
    currentUser.following.push(userIdToFollow);
    userToFollow.followers.push(currentUserId);

    // Create a notification for the user being followed
    const newNotification = {
        type: 'follow',
        sender : currentUserId,
        read: false,
    };
    userToFollow.notifications.unshift(newNotification);

    // Save the changes
    await currentUser.save();
    await userToFollow.save();

    res.status(200).json({ message: "User followed successfully", followers: userToFollow.followers });
});

//@desc Unfollow User
//@route POST/api/user/:id/unfollow
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

    // Remove the follow relationship using pull
    currentUser.following.pull(userIdToUnfollow);
    userToUnfollow.followers.pull(currentUserId);

    // Remove the notification related to the unfollow action
    userToUnfollow.notifications = userToUnfollow.notifications.filter(
        (notification) => !(notification.type === 'follow' && notification.sender == currentUserId)
    );

    await currentUser.save();
    await userToUnfollow.save();

    res.status(200).json({ message: "User unfollowed successfully" , followers: userToUnfollow.followers  });
});

//@desc update User
//@route PUT/api/user/:username/update
//@access private  
export const updateUser = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    const {name, bio, removeProfile, removeCoverImg} = req.body;

    const user = await User.findById(id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    let profileUrl = '';
    let coverImgUrl = '';

    if (req.files?.profile?.[0]?.path) {
        const profile = await uploadOnCloudinary(req.files.profile[0].path , user.username , 'profile');
        profileUrl = profile.secure_url;
    }

     if (req.files?.coverImg?.[0]?.path) {
        const coverImg = await uploadOnCloudinary(req.files.coverImg[0].path , user.username , 'cover');
        coverImgUrl = coverImg.secure_url;
    }

    if (name && name !== user.name) {
        user.name = req.body.name;
    }
    
    if (bio && bio !== user.bio) {
        user.bio = req.body.bio;
    }

    if(removeProfile || profileUrl)
        user.profile = profileUrl;
    if(removeCoverImg || coverImgUrl)
        user.coverImg = coverImgUrl;
    
    await user.save();
    user.password = undefined;
    user.notifications = undefined;
    res.status(200).json({ message: 'User updated successfully', user });
});
