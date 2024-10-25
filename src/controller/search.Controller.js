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
    });

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