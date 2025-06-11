import expressAsyncHandler from "express-async-handler";
import { User } from "../models/userModel.js";
import { Post } from "../models/postModel.js";

//@desc search
//@route PUT /api/search/
//@access public
export const search = expressAsyncHandler(async (req,res)=>{
    const { query } = req.body;

    if (!query) {
        res.status(400);
        throw new Error('Search query is required');
    }

    // Find users by username (case-insensitive, partial matching)
    const users = await User.find({
        username: { $regex: query, $options: 'i' }
    }).select('username name badge profile');
    // Note: You can also include other fields like email, etc. if needed

    // Find posts by content or title (full-text search)
    const posts = await Post.find({
        $text: { $search: query }
    }).populate('owner_id', 'username name badge profile');

    // Combine the search results
    const results = {
        users,
        posts
    };

    if (users.length === 0 && posts.length === 0) {
        return res.status(404).json({ message: 'No matching users or posts found' });
    }

    res.status(200).json(results);
});

// @desc Get posts by category and/or tag with pagination
// @route GET /api/search/filter
// @access public
export const filterPosts = expressAsyncHandler(async (req, res) => {
    const { categories, tags, page = 1, limit = 10 } = req.query; // Default page to 1 and limit to 10
  
    // Convert page and limit to integers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
  
    // Build the query for filtering posts
    const query = {};
  
    // Handle multiple categories
    if (categories) {
        query.category = { $in: categories.split(',').map(cat => cat.trim()) }; // Trim whitespace
    }
  
    // Handle multiple tags
    if (tags) {
        query.tags = { $in: tags.split(',').map(tag => tag.trim()) }; // Trim whitespace
    }
  
    // Fetch posts with pagination
    const posts = await Post.find(query)
        .populate('owner_id', 'username name badge profile')
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);
  
    // Get the total number of posts for the current filter
    const totalPosts = await Post.countDocuments(query);
  
    // Calculate the total pages
    const totalPages = Math.ceil(totalPosts / limitNumber);
  
    // Return the results
    res.status(200).json({
        posts,
        currentPage: pageNumber,
        totalPages,
        totalPosts,
    });
  });