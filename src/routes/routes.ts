import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { User } from '../model/User';
import { generateToken } from '../utils/jwtUtils';
import { authenticateJWT } from '../middleware/authMiddleware';
import multer from 'multer';


const router = express.Router();


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../public/images/profile/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Protected route example
router.get('/protected', authenticateJWT, (req: Request, res: Response) => {
    res.send('This is a protected route');
});


//test Method
router.post('/post', (req, res) => {
    res.send('Post API')
})

// Route to get users
router.get('/getusers', authenticateJWT, async (req: Request, res: Response) => {
    try {
        const userdata = await User.find();
        res.json(userdata);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching users.' });
    }
});

router.post('/register', upload.single('profileImage'), [
    body('name').notEmpty().withMessage('Name field is required'),
    body('email').notEmpty().withMessage('Email field is required').isEmail().withMessage('Email not valid'),
    body('username').notEmpty().withMessage('Username field is required'),
    body('password').notEmpty().withMessage('Password field is required'),
    body('age').notEmpty().withMessage('Age field is required'),
    body('password2').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
  ], async (req: Request, res: Response) => {
    const errors = validationResult(req);
    const { name, email, username, age, password } = req.body;
  
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const profileImage = req.file ? req.file.filename : 'default-profile.png';
  
      const newUser = new User({
        name,
        email,
        username,
        age,
        password: hashedPassword,
        profileImage
      });
  
      await newUser.save();
  
      const token = generateToken(newUser._id.toString());
      res.json({ token });
  
    } catch (error) {
      res.status(500).send('Server Error');
    }
  });
  



// src/routes/routes.ts
router.post('/login', [
    body('username').notEmpty().withMessage('Username field is required'),
    body('password').notEmpty().withMessage('Password field is required')
], async (req: Request, res: Response) => {
    const errors = validationResult(req);
    const { username, password } = req.body;

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(401).send('Invalid credentials');

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).send('Invalid credentials');

        const token = generateToken(user._id.toString());
        res.json({ token });

    } catch (error) {
        res.status(500).send('Server Error');
    }
});

export default router;
