import expressAsyncHandler from "express-async-handler";
import { User } from "../models/userModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { BadgeAssignmentLog } from '../models/badgeAssignmentLogModel.js';
import { deleteImageFromCloudinary } from "../utils/Cloudinary.js";

// @desc Assign a badge to a user
// @route PUT /api/admin/assignBadge/:userId
// @access Admin
export const assignBadge = expressAsyncHandler(async (req, res) => {
    const { badge } = req.body;
    const { userId } = req.params;
    const adminId = req.user.id;

    // Check if the badge is valid
    const validBadges = ['blue', 'green', 'gold', 'red' , 'none'];
    if (!validBadges.includes(badge)) {
        res.status(400);
        throw new Error('Invalid badge type!');
    }

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
        res.status(404);
        throw new Error('User not found!');
    }

    // Update the user's badge
    user.badge = badge;
    await user.save();

    // Log the badge assignment
    await BadgeAssignmentLog.create({
        user: user._id,
        badge,
        assignedBy: adminId, // The ID of the admin making the assignment
    });

    res.status(200).json({
        message: `Badge ${badge} assigned to user ${user.username} successfully!`,
        user
    });
});

// @desc Login Admin
// @route Post /api/admin/login
// @access Public
export const adminLogin = expressAsyncHandler(async (req, res) => {
    const { username , password } = req.body;

    if(!username || !password){
        res.status(400);
        throw new Error('All field are mandatory!');
    }
    
    const user = await User.findOne({username});

    if(!user){
        res.status(404);
        throw new Error('Invalide username!');
    }

    if(await bcrypt.compare(password, user.password)){
        if(user.role === 'admin'){
            const accessToken = jwt.sign(
                {
                    user:{
                        id: user.id,
                        name: user.name,
                        username: user.username,
                        role : user.role
                    }
                },process.env.ACCESS_TOKEN_SECRET,{expiresIn:'7d'});

            res.status(200).json({accessToken});
        }else{
            res.status(401);
            throw new Error('User is not authorized as an admin!');
        }
    }else{
        res.status(401);
        throw new Error('Invalid password!');
    }
});

//@desc update User
//@route Get/api/admin/allUsers
//@access admin
export const getAllUsers = expressAsyncHandler(async (req, res) => {
    // Extract parameters for pagination, filtering, and sorting
  const page = Number(req.query.pageNumber) || 1;
  const pageSize = Number(req.query.pageSize) || 10; // Default 10 users per page
  const search = req.query.search || ''; // Search by username or email
  const sortBy = req.query.sortBy || 'createdAt'; // Sort by default createdAt
  const sortOrder = req.query.sortOrder || 'desc'; // Default sort order is descending

  const query = {
    $or: [
      { username: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ],
  };

  // Count total number of users matching the query
  const count = await User.countDocuments(query);

  // Fetch users with pagination, sorting, and filtering
  const users = await User.find(query)
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 });

  // Respond with the user data and pagination info
  res.json({
    users,
    page,
    pages: Math.ceil(count / pageSize),
    totalUsers: count,
  });
}); 

// @desc Delete a user
// @route DELETE /api/admin/:userId/delete
// @access Admin
export const deleteUser = expressAsyncHandler(async (req, res) => {
    const { userId } = req.params;
    const adminId = req.user.id;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
        res.status(404);
        throw new Error('User not found!');
    }

    // Check if the user is trying to delete themselves
    if (userId === adminId) {
        res.status(400);
        throw new Error('Admins cannot delete their own accounts!');
    }

    // Delete profile and cover images from Cloudinary
    if (user.profile) {
        await deleteImageFromCloudinary(user.profile);
    }

    if (user.coverImg) {
        await deleteImageFromCloudinary(user.coverImg);
    }

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.status(200).json({
        message: `User ${user.username} deleted successfully!`,
    });
});
