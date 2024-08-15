import expressAsyncHandler from 'express-async-handler';
import { Post } from '../models/postModel.js';
import { User } from '../models/userModel.js';

// @desc Get all posts
// @route GET /api/post/all
// @access Public
export const getAllPosts = expressAsyncHandler(async (req, res) => {
  const posts = await Post.find({}).populate({
    path: 'owner_id',
    select: 'username followers', // Include followers in the population
    populate: {
      path: 'followers', // Populate the followers
      select: 'username' // Include follower usernames or other fields you need
    }
  });
  res.json(posts);
});

// @desc Get posts by a specific user
// @route GET /api/post/user/:userId
// @access Public
export const getUserPosts = expressAsyncHandler(async (req, res) => {
  const { userId } = req.params;
  const posts = await Post.find({ owner_id: userId });
  res.json(posts);
});

//@desc Create a new post
//@route POST/api/post/create
//@access private
export const createPost = expressAsyncHandler(async (req, res) => {
  const { title, content, author, category, tags, contentColor, authorColor, tintColor, backgroundImage } = req.body;
 
  if (!title || !content || !author || !category || !tags || !contentColor || !authorColor || !tintColor || !backgroundImage ) {
    res.status(400);
    throw new Error("Post validation failed");
  }

  const newPost = new Post({
    owner_id: req.user.id,
    title,
    content,
    author,
    category,
    tags,
    contentColor,
    authorColor,
    tintColor,
    backgroundImage,
    likes: [],
    comments: []
  });

  const savedPost = await newPost.save();

  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.posts.push(savedPost.id);
  await user.save();
  
  res.status(201).json(savedPost);
});

//@desc Get post by ID
//@route GET/api/post/:id
//@access private
export const getPost = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const post = await Post.findOne({ _id: id, owner_id: req.user.id });

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  res.status(200).json(post);
});

//@desc Update post by ID
//@route PUT/api/post/:id
//@access private
export const updatePost = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const post = await Post.findOne({ _id: id, owner_id: req.user.id });

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  Object.assign(post, updateData);
  const updatedPost = await post.save();

  res.status(200).json(updatedPost);
});

//@desc Delete a post by ID
//@route DELETE/api/post/:id
//@access private
export const deletePost = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await Post.findOne({ _id: id, owner_id: req.user.id });

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  await post.remove();
  res.status(200).json({ message: 'Post deleted' });
});

// @desc Like a post
// @route PUT /api/post/:id/like
// @access Private
export const likePost = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  if (post.likes.includes(req.user.id)) {
    res.status(400);
    throw new Error("You have already liked this post");
  }

  post.likes.push(req.user.id);
  await post.save();
  res.status(200).json(post);
});

// @desc Add a comment to a post
// @route POST /api/post/:postId/comments
// @access Private
export const addComment = expressAsyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { comment } = req.body;

  if (!comment) {
    res.status(400);
    throw new Error('Comment text is required');
  }

  const post = await Post.findById(postId);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  const newComment = {
    username: req.user.username, // Assuming req.user contains user info
    comment,
    likes: [],
    date: new Date()
  };
  post.comments.push(newComment);
  await post.save();
  res.status(201).json(post);
});

// @desc Like a comment
// @route PUT /api/post/:postId/comments/:commentId/like
// @access Private
export const likeComment = expressAsyncHandler(async (req, res) => {
  const { postId, commentId } = req.params;
  const post = await Post.findById(postId);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  const comment = post.comments.id(commentId);
  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }

  if (comment.likes.includes(req.user.id)) {
    res.status(400)
    throw new Error('You have already liked this comment');
  }

  comment.likes.push(req.user.id);
  await post.save();
  res.status(200).json(comment);
});

// @desc Add a reply to a comment
// @route POST /api/post/:postId/comments/:commentId/replies
// @access Private
export const addReply = expressAsyncHandler(async (req, res) => {
  const { postId, commentId } = req.params;
  const { reply } = req.body;

  if (!reply) {
    res.status(400);
    throw new Error('Reply text is required');
  }

  const post = await Post.findById(postId);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  const comment = post.comments.id(commentId);
  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }

  const newReply = {
    username: req.user.username, // Assuming req.user contains user info
    reply,
    likes: [],
    date: new Date()
  };

  comment.replies.push(newReply);
  await post.save();
  res.status(201).json(post);
});

// @desc Like a reply
// @route PUT /api/post/:postId/comments/:commentId/replies/:replyId/like
// @access Private
export const likeReply = expressAsyncHandler(async (req, res) => {
  const { postId, commentId, replyId } = req.params;
  const post = await Post.findById(postId);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  const comment = post.comments.id(commentId);
  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }

  const reply = comment.replies.id(replyId);
  if (!reply) {
    res.status(404);
    throw new Error("Reply not found");
  }

  if (reply.likes.includes(req.user.id)) {
    res.status(400);
    throw new Error("You have already liked this reply");
  }

  reply.likes.push(req.user.id);
  await post.save();
  res.status(200).json(reply);
});
