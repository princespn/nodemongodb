import express, { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import { authenticateJWT } from '../middleware/authMiddleware';
import { Post as PostModel, PostDocument } from '../model/Post';
import { Categories, CategoriesDocument } from '../model/Categories';

const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

// Fetch all posts
router.get('/posts', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const posts = await PostModel.find({}).populate('category');
    res.json({ posts });
  } catch (err) {
    next(err);
  }
});

// Fetch a specific post by ID
router.get('/show/:id', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = await PostModel.findById(req.params.id).populate('category');
    if (!post) return res.status(404).send('Post not found');
    res.json({ post });
  } catch (err) {
    next(err);
  }
});

// Add a comment to a post
router.post('/addcomment', authenticateJWT, [
  body('title').notEmpty().withMessage('Title field is required'),
  body('name').notEmpty().withMessage('Name field is required'),
  body('body').notEmpty().withMessage('Body field is required')
], async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  const { title, name, postId, body } = req.body;

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const post = await PostModel.findById(postId);
    if (!post) return res.status(404).send('Post not found');
    post.comments.push({ title, name, body, date: new Date() });
    await post.save();
    res.status(201).json({ message: 'Comment created', post });
  } catch (err) {
    next(err);
  }
});

// Add a new post
router.post('/add', authenticateJWT, upload.single('thumbimage'), [
  body('title').notEmpty().withMessage('Title field is required'),
  body('body').notEmpty().withMessage('Body field is required'),
  body('categories').notEmpty().withMessage('Category field is required')
], async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  const { title, body, categories } = req.body;
  const thumbimage = req.file ? req.file.filename : 'noimage.png';

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Validate that the category exists
    const categoryExists = await Categories.findById(categories);
    if (!categoryExists) {
      return res.status(400).json({ message: `Category with id ${categories} not found` });
    }

    const newPost = new PostModel({ title, body, categories, date: new Date(), thumbimage });
    await newPost.save();
    res.status(201).json({ message: 'Post created', newPost });
  } catch (err) {
    next(err);
  }
});

// Edit an existing post
router.put('/edit/:id', authenticateJWT, upload.single('thumbimage'), [
  body('title').notEmpty().withMessage('Title field is required'),
  body('body').notEmpty().withMessage('Body field is required'),
  body('category').notEmpty().withMessage('Category field is required')
], async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  const { title, body, category } = req.body;
  const thumbimage = req.file ? req.file.filename : req.body.prevImage;

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Validate that the category exists
    const categoryExists = await Categories.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: `Category with id ${category} not found` });
    }

    const updatedPost = await PostModel.findByIdAndUpdate(
      req.params.id,
      { title, body, category, date: new Date(), thumbimage },
      { new: true }
    );
    if (!updatedPost) return res.status(404).send('Post not found');
    res.status(200).json({ message: 'Post updated', updatedPost });
  } catch (err) {
    next(err);
  }
});

// Delete a post
router.delete('/delete/:id', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deletedPost = await PostModel.findByIdAndDelete(req.params.id);
    if (!deletedPost) return res.status(404).send('Post not found');
    res.status(200).json({ message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
