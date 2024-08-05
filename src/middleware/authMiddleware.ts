import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwtUtils';

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).send('Access Denied');

    try {
        const decoded = verifyToken(token);
        req.user = decoded; // Attach user info to request object
        next();
    } catch (error) {
        res.status(403).send('Invalid Token');
    }
};
