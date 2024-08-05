import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key'; // Store this in .env

export const generateToken = (userId: string) => {
    return jwt.sign({ id: userId }, SECRET_KEY, { expiresIn: '1h' });
};

export const verifyToken = (token: string) => {
    return jwt.verify(token, SECRET_KEY);
};
