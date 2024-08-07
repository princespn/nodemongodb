import express, { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateJWT } from '../middleware/authMiddleware'; // Ensure this middleware exists and is correctly implemented
import { Categories } from '../model/Categories'; // Adjust the path if necessary

const router = express.Router();

// Get categories by title (assuming title is used as the category name)
router.get('/show/:category',authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await Categories.find({ title: req.params.category });
    res.json({ title: req.params.category, categories });
  } catch (err) {
    next(err);
  }
});

// Add a new category
router.post('/add', authenticateJWT, [
  body('title').notEmpty().withMessage('Title field is required')
], async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  const { title } = req.body;

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const category = new Categories({ title });
    await category.save();
    res.status(201).json({ message: 'Category has been created.' });
  } catch (err) {
    next(err);
  }
});




export default router;
