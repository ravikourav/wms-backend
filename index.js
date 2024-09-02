import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import errorHandler from './src/middleware/errorHandler.js';
import connectDB from './src/db/db.js';
import cookieParser from 'cookie-parser';

import postRoutes from './src/routes/post.Routes.js';
import userRoutes from './src/routes/user.Routes.js';
import tagRoutes from './src/routes/tag.Routes.js';
import notificationRoutes from './src/routes/notification.Routes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Connect to database
connectDB();

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'https://wisemansaid.vercel.app',
    'https://wisemansaid-git-master-ravi-kouravs-projects.vercel.app', 
    'https://wisemansaid-qhjhqbmtq-ravi-kouravs-projects.vercel.app' 
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(cookieParser());

// Example of setting a cookie with appropriate attributes
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    res.cookie('authToken', req.cookies.authToken, {
      httpOnly: true,
      secure: true, // Ensures cookie is only sent over HTTPS
      sameSite: 'None', // Allows cookies to be sent with cross-site requests
    });
  }
  next();
});

// Routes
app.use('/api/user', userRoutes);
app.use('/api/post', postRoutes);
app.use('/api/tag' , tagRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handling middleware
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
