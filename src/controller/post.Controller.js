import expressAsyncHandler from 'express-async-handler';
import { Post } from '../models/postModel.js';
import { User } from '../models/userModel.js';
import { Tag }  from '../models/tagModel.js';
import uploadOnCloudinary from '../utils/Cloudnary.js';

// @desc Get all posts
// @route GET /api/post/all
// @access Public
export const getAllPosts = expressAsyncHandler(async (req, res) => {
  const posts = await Post.find({}).populate({
    path: 'owner_id',
    select: 'username avatar'
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
  const { title, content, author, category, tags, contentColor, authorColor, tintColor} = req.body;
 
  if (!title || !content || !author || !category || !tags || !contentColor || !authorColor || !tintColor ) {
    res.status(400);
    throw new Error("Post validation failed");
  }

  const backgroundImagePath = req.file?.path;

  if(!backgroundImagePath){
    res.status(400);
    throw new Error("image validation failed");
  }

  const tagsArray = tags.split(',').map(tag => tag.trim());

  const backgroundImageCloudnary = await uploadOnCloudinary(backgroundImagePath);
  const newPost = new Post({
    owner_id: req.user.id,
    title,
    content,
    author,
    category,
    tags: tagsArray,
    contentColor,
    authorColor,
    tintColor,
    backgroundImage: backgroundImageCloudnary.url,
    width:backgroundImageCloudnary.width,
    height: backgroundImageCloudnary.height,
    likes: [],
    comments: []
  });
  const savedPost = await newPost.save();

  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  
  for (let tagName of tagsArray) {
    let tag = await Tag.findOne({ tag: tagName });

    if (!tag) {
      throw new Error('tag not found' , tagName)
    } else {
      tag.posts.push(savedPost._id);
    }
    await tag.save();
  }

  user.posts.push(savedPost.id);
  await user.save();
  
  res.status(201).json(savedPost);
});

//@desc Get post by ID
//@route GET/api/post/:id
//@access public
export const getPost = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const post = await Post.findOne({ _id: id}).populate({
    path: 'owner_id',
    select: 'username followers avatar',
  });

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
// @route PUT /api/post/:postId/like
// @access Private
export const likePost = expressAsyncHandler(async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  const post = await Post.findById(postId);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  if (post.likes.includes(userId)) {
    res.status(400);
    throw new Error("You have already liked this post");
  }

  post.likes.push(req.user.id);
  await post.save();
  res.status(200).json({likes : post.likes});
});

// @desc Like a post
// @route POST/api/post/:postId/unlike
// @access Private
export const unlikePost = expressAsyncHandler(async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;
  const post = await Post.findById(postId);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  if (!post.likes.includes(userId)) {
    res.status(400);
    throw new Error("You have not liked this post");
  }

  post.likes = post.likes.filter(id=>id.toString() !== userId);
  await post.save();
  res.status(200).json({likes : post.likes});
});

// @desc Add a comment to a post
// @route POST /api/post/:postId/comment
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
    username: req.user.username,
    comment,
    likes: [],
    date: new Date()
  };

  post.comments.push(newComment);
  await post.save();
  res.status(201).json({comment: post.comments});
});


// @desc Add a reply to a comment
// @route POST /api/post/:postId/comment/:commentId/reply
// @access Private
export const addReply = expressAsyncHandler(async (req, res) => {
  const { postId, commentId } = req.params;
  const { comment } = req.body;

  if (!comment) {
    res.status(400);
    throw new Error('Reply text is required');
  }

  const post = await Post.findById(postId);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  const replyTo = post.comments.id(commentId);
  if (!replyTo) {
    res.status(404);
    throw new Error("Comment not found");
  }

  const newReply = {
    username: req.user.username,
    reply: comment,
    likes: [],
    date: new Date()
  };

  replyTo.replies.push(newReply);
  await post.save();
  res.status(201).json(post);
});

// @desc Like a comment
// @route PUT /api/post/:postId/comment/:commentId/like
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
  res.status(200).json({likes : comment.likes});
});

// @desc Like a post
// @route PUT /api/post/:postId/comment/:commentId/unlike
// @access Private
export const unlikeComment = expressAsyncHandler(async (req, res) => {
  const { postId, commentId } = req.params;
  const post = await Post.findById(postId);
  const userId = req.user.id;

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  const comment = post.comments.id(commentId);
  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }

  if (!comment.likes.includes(userId)) {
    res.status(400)
    throw new Error('You have not liked this comment');
  }

  comment.likes = comment.likes.filter(id=>id.toString() !== userId);
  await post.save();
  res.status(200).json({likes : comment.likes});
});

// @desc Like a reply
// @route PUT /api/post/:postId/comment/:commentId/reply/:replyId/like
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
  res.status(200).json({likes :reply.likes});
});

// @desc Unlike a reply
// @route PUT /api/post/:postId/comment/:commentId/reply/:replyId/unlike
// @access Private
export const unlikeReply = expressAsyncHandler(async (req, res) => {
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

  const userIndex = reply.likes.indexOf(req.user.id);
  if (userIndex === -1) {
    res.status(400);
    throw new Error("You have not liked this reply");
  }

  reply.likes.splice(userIndex, 1);
  await post.save();
  res.status(200).json({likes :reply.likes});
});
