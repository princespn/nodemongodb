import express, { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { authenticateJWT } from '../middleware/authMiddleware'; // Ensure this middleware exists and is correctly implemented

const router = express.Router();

// Define schemas and models if not already defined
const postSchema = new mongoose.Schema({
  title: String,
  body: String,
  category: String,
  date: { type: Date, default: Date.now },
  thumbimage: String,
  comments: [{
    title: String,
    name: String,
    body: String,
    date: { type: Date, default: Date.now }
  }]
});

const Post = mongoose.models.Post || mongoose.model('Post', postSchema);

const categorySchema = new mongoose.Schema({
  title: { type: String, required: true }
});

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

// Get posts by category
router.get('/show/:category', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const posts = await Post.find({ category: req.params.category });
    res.json({ title: req.params.category, posts });
  } catch (err) {
    next(err);
  }
});


// Handle add category 
router.post('/add', authenticateJWT, [
  body('title').notEmpty().withMessage('Title field is required')
], async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  const { title } = req.body;
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const category = new Category({ title });
    await category.save();
    res.status(201).json({ message: 'Category has been created.' });
  } catch (err) {
    next(err);
  }

});

export default router;
