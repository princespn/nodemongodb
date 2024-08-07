import express, { Request, Response, NextFunction } from 'express';
import { Book, BookDocument } from '../model/Book';
import { Categories } from '../model/Categories';  // Assuming this is the correct import for Category model
import multer from 'multer';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/book/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Get all books
router.get('/', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const books = await Book.find({}).populate('category');
    res.json({ books });
  } catch (err) {
    next(err);
  }
});

// Get a single book by ID
router.get('/:id', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const book = await Book.findById(req.params.id).populate('category');
    if (!book) return res.status(404).send('Book not found');
    res.json({ book });
  } catch (err) {
    next(err);
  }
});

// Add a new book
router.post('/add', authenticateJWT, upload.single('cover'), async (req: Request, res: Response, next: NextFunction) => {
  const { title, categories, description, author, publisher, price } = req.body;
  const cover = req.file ? req.file.filename : 'nocover.png';
  
  // Debugging output
  console.log('Request Body:', req.body);

  try {
    // Validate if the category exists
    const categoryExists = await Categories.findById(categories);
    if (!categoryExists) {
      return res.status(404).json({ message: `Category with id ${categories} not found` });
    }

    const newBook = new Book({ title, categories, description, author, publisher, price, cover });
    await newBook.save();
    res.status(201).json({ message: 'Book created', newBook });
  } catch (err) {
    next(err);
  }
});

// Update an existing book
router.put('/:id', authenticateJWT, upload.single('cover'), async (req: Request, res: Response, next: NextFunction) => {
  const { title, categories, description, author, publisher, price } = req.body;
  const cover = req.file ? req.file.filename : req.body.prevCover;

  // Debugging output
  console.log('Request Body:', req.body);

  try {
    // Validate if the category exists
    const categoryExists = await Categories.findById(categories);
    if (!categoryExists) {
      return res.status(404).json({ message: `Category with id ${categories} not found` });
    }

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      { title, categories, description, author, publisher, price, cover },
      { new: true }
    );
    if (!updatedBook) return res.status(404).send('Book not found');
    res.status(200).json({ message: 'Book updated', updatedBook });
  } catch (err) {
    next(err);
  }
});

// Delete a book
router.delete('/:id', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    if (!deletedBook) return res.status(404).send('Book not found');
    res.status(200).json({ message: 'Book deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
