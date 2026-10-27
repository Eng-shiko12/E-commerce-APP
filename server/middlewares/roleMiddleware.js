import createError from '../utils/createError.js';
const adminOnly = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(createError(403, 'You are not authorized to access this resource'));
        }
        next();
    };
};

export default adminOnly;