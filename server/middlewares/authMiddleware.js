import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import createError from '../utils/createError.js';
import User from '../models/user.model.js';



const authMiddleware = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(createError(401, 'Unauthorized: No token provided'));
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return next(createError(401, 'Not authorized, no token'));
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return next(createError(401, 'Unauthorized: User not found'));
        }   
        req.user = user;
        next();
    } catch (error) {
        return next(createError(401, 'Unauthorized: Invalid token'));
    }
})
export default authMiddleware;