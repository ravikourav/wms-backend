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
    select: 'username name avatar'
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

//@desc Update post by ID
//@route PUT /api/post/:id
//@access private
export const updatePost = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const backgroundImagePath = req.file?.path;  // Optional new image

  const post = await Post.findOne({ _id: id, owner_id: req.user.id });

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  // Update the post fields dynamically
  Object.keys(updateData).forEach(key => {
    post[key] = updateData[key];
  });

  // If a new image is provided, upload it and update the image fields
  if (backgroundImagePath) {
    const backgroundImageCloudinary = await uploadOnCloudinary(backgroundImagePath);
    post.backgroundImage = backgroundImageCloudinary.url;
    post.width = backgroundImageCloudinary.width;
    post.height = backgroundImageCloudinary.height;
  }

  const updatedPost = await post.save();
  res.status(200).json(updatedPost);
});


//@desc Get post by ID
//@route GET/api/post/:id
//@access public
export const getPost = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const post = await Post.findOne({ _id: id}).populate({
    path: 'owner_id',
    select: 'username followers avatar',
  })
  .populate({
    path: 'comments.comment_author',
    select: 'username avatar',
  })
  .populate({
    path: 'comments.replies.reply_author',
    select: 'username avatar',
  });

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  res.status(200).json(post);
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

  await post.deleteOne()
  // Remove related notifications
  await Notification.deleteMany({ postId: id });

  res.status(200).json({ message: 'Post deleted' });
});

//@desc Delete a post by ID
//@route PUT/api/post/:postId/save
//@access private
export const savePost = expressAsyncHandler(async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check if the post is already in the saved list
  if (user.saved.includes(postId)) {
    return res.status(400).json({ message: 'Post already saved' });
  }
  else{
    //add postId to user saved array
    user.saved.push(postId);

    await user.save();
    res.status(200).json({ message: 'Post Saved' });
  }
});

//@desc Unsave a post by ID
//@route PUT /api/post/:postId/unsave
//@access private
export const unsavePost = expressAsyncHandler(async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check if the post is in the saved list
  if (!user.saved.includes(postId)) {
    return res.status(400).json({ message: 'Post not found in saved list' });
  } else {
    // Remove postId from user saved array
    user.saved = user.saved.filter((id) => id != postId);

    await user.save();
    res.status(200).json({ message: 'Post Unsaved' });
  }
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

  //handle notification
  if(userId != post.owner_id){
    const postOwner = await User.findById(post.owner_id);
    const notification ={
      type: 'like',
      post: postId,
      sender: userId,
      data: {
        context : 'post'
      },
      read: false
    }
    postOwner.notifications.unshift(notification);
    await postOwner.save();
  }

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

  // Remove the notification
  if(userId != post.owner_id){
    const postOwner = await User.findById(post.owner_id);
    postOwner.notifications = postOwner.notifications.filter(
    (notification) => !(
      notification.type === 'like' &&
      notification.post == postId &&
      notification.sender == userId && 
      notification.data.context === 'post'
    ))
    await postOwner.save();
  };

  await post.save();
  res.status(200).json({likes : post.likes});
});

// @desc Add a comment to a post
// @route POST /api/post/:postId/comment
// @access Private
export const addComment = expressAsyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { comment } = req.body;
  const userId = req.user.id;

  if (!comment || comment.length < 1) {
    res.status(400);
    throw new Error('Comment text is required');
  }

  const post = await Post.findById(postId);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  const newComment = {
    comment_author: userId,
    comment,
    likes: []
  };

  post.comments.push(newComment);

  //handle notification
  if(userId != post.owner_id){
    const postOwner = await User.findById(post.owner_id);
    const notification = {
      type: 'comment',
      post: postId,
      sender: userId,
      data : {
        comment
      },
      read: false,
    }
    postOwner.notifications.unshift(notification);
    await postOwner.save();
  }

  await post.save();
  const commentFromDb = post.comments[post.comments.length - 1];
  await Post.populate(commentFromDb, {
    path: 'comment_author',
    select: 'username avatar'
  });
  res.status(201).json({ comment: commentFromDb });
});

// @desc Delete a comment from a post
// @route DELETE /api/post/:postId/comment/:commentId
// @access Private
export const deleteComment = expressAsyncHandler(async (req, res) => {
  const { postId, commentId } = req.params;
  const userId = req.user.id;

  const post = await Post.findById(postId);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  // Find the comment
  const comment = post.comments.id(commentId);

  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  // Check if the user is the author of the comment or the post owner
  if (comment.comment_author != userId && post.owner_id != userId) {
    res.status(403);
    throw new Error('You are not authorized to delete this comment');
  }

  // Remove the comment
  post.comments.pull(commentId);

  await post.save();

  res.status(200).json({ message: 'Comment deleted successfully' });
});

// @desc Like a comment
// @route PUT /api/post/:postId/comment/:commentId/like
// @access Private
export const likeComment = expressAsyncHandler(async (req, res) => {
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

  if (comment.likes.includes(userId)) {
    res.status(400)
    throw new Error('You have already liked this comment');
  }

  comment.likes.push(userId);

  //handle notification
  if(userId != comment.comment_author ){
    const commentAuthor = await User.findById(comment.comment_author);
    const notification ={
      type: 'like',
      post: postId,
      sender: userId,
      data : {
        context: 'comment',
        itemId: commentId,
        comment: comment.comment
      },
      read: false
    }
    commentAuthor.notifications.unshift(notification);
    await commentAuthor.save();
  }

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

  // Remove the notification
  if(userId != comment.comment_author){
    const commentAuthor = await User.findById(comment.comment_author);
    commentAuthor.notifications = commentAuthor.notifications.filter(
    (notification) => !(
      notification.type === 'like' &&
      notification.post == postId &&
      notification.sender == userId && 
      notification.data.context === 'comment' &&
      notification.data.itemId == commentId
    ))
    await commentAuthor.save();
  };

  await post.save();
  res.status(200).json({likes : comment.likes});
});


// @desc Add a reply to a comment
// @route POST /api/post/:postId/comment/:commentId/reply
// @access Private
export const addReply = expressAsyncHandler(async (req, res) => {
  const { postId, commentId } = req.params;
  const { comment } = req.body;
  const userId = req.user.id;

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
    reply_author: userId,
    reply: comment,
    likes: []
  };
  
  replyTo.replies.push(newReply);

  // Create notification for the comment author
  if (userId != replyTo.comment_author) {
    const commentAuthor = await User.findById(replyTo.comment_author);
    const notification = {
      type: 'reply',
      post: postId,
      sender: userId,
      data: {
        comment
      },
      read: false
    };
    commentAuthor.notifications.unshift(notification);
    await commentAuthor.save();
  }

  await post.save();
  const replyFromDb = replyTo.replies[replyTo.replies.length - 1];
  await Post.populate(replyFromDb, {
    path: 'reply_author',
    select: 'username avatar'
  });
  res.status(201).json({ reply: replyFromDb });
});

// @desc Like a reply
// @route PUT /api/post/:postId/comment/:commentId/reply/:replyId/like
// @access Private
export const likeReply = expressAsyncHandler(async (req, res) => {
  const { postId, commentId, replyId } = req.params;
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

  const reply = comment.replies.id(replyId);
  if (!reply) {
    res.status(404);
    throw new Error("Reply not found");
  }

  if (reply.likes.includes(userId)) {
    res.status(400);
    throw new Error("You have already liked this reply");
  }

  reply.likes.push(userId);

  //handle notification
  if(userId != reply.reply_author){
    const replyAuthor = await User.findById(reply.reply_author);
    const notification ={
      type: 'like',
      post: postId,
      sender: userId,
      data : {
        context: 'reply',
        itemId: replyId,
        comment: reply.comment
      },
      read: false
    }
    replyAuthor.notifications.unshift(notification);
    await replyAuthor.save();
  }

  await post.save();
  res.status(200).json({likes :reply.likes});
});

// @desc Unlike a reply
// @route PUT /api/post/:postId/comment/:commentId/reply/:replyId/unlike
// @access Private
export const unlikeReply = expressAsyncHandler(async (req, res) => {
  const { postId, commentId, replyId } = req.params;
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
  
  // Remove the notification
  if(userId != reply.reply_author){
    const replyAuthor = await User.findById(reply.reply_author);
    replyAuthor.notifications = reply.notifications.filter(
    (notification) => !(
      notification.type === 'like' &&
      notification.post == postId &&
      notification.sender == userId && 
      notification.data.context === 'reply' &&
      notification.data.itemId == replyId
    ))
    await replyAuthor.save();
  };

  await post.save();
  res.status(200).json({likes :reply.likes});
});

// @desc Delete a reply from a comment
// @route DELETE /api/post/:postId/comment/:commentId/reply/:replyId
// @access Private
export const deleteReply = expressAsyncHandler(async (req, res) => {
  const { postId, commentId, replyId } = req.params;
  const userId = req.user.id;

  const post = await Post.findById(postId);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  // Find the comment
  const comment = post.comments.id(commentId);

  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  // Find the reply
  const reply = comment.replies.id(replyId);

  if (!reply) {
    res.status(404);
    throw new Error('Reply not found');
  }

  // Check if the user is the author of the reply, comment, or post owner
  if (reply.reply_author.toString() !== userId && 
      comment.comment_author.toString() !== userId && 
      post.owner_id.toString() !== userId) {
    res.status(403);
    throw new Error('You are not authorized to delete this reply');
  }

  // Remove the reply
  comment.replies.pull(replyId);

  await post.save();
  res.status(200).json({ message: 'Reply deleted successfully' });
});