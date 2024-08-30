import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import errorHandler from '../src/middleware/errorHandler.js';
import connectDB from '../src/db/db.js';
import cookieParser from 'cookie-parser';

import postRoutes from '../src/routes/post.Routes.js';
import userRoutes from '../src/routes/user.Routes.js';
import tagRoutes from '../src/routes/tag.Routes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Connect to database
connectDB();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'https://wisemansaid-git-master-ravi-kouravs-projects.vercel.app/' , 'https://wisemansaid-qhjhqbmtq-ravi-kouravs-projects.vercel.app'], // Allow local and Vercel URLs
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/user', userRoutes);
app.use('/api/post', postRoutes);
app.use('/api/tag' , tagRoutes);

// Error handling middleware
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
