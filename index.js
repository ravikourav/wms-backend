import express from 'express';
import dotenv from 'dotenv';
import errorHandler from './src/middleware/errorHandler.js'
import connectDB from './src/db/db.js';

import postRoutes from './src/routes/postRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import tagRoutes from './src/routes/tagRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Connect to database
connectDB();

// Middleware
app.use(express.json());

// Routes
app.use('/api/user', userRoutes);
app.use('/api/post', postRoutes);
app.use('/api/tag' , tagRoutes);

// Error handling middleware
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
