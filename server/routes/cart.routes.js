import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import {
    addToCart,
    getUserCart,
    deleteCartItem,
    deleteUserCart
} from '../controllers/cart.controller.js';

const router = express.Router();

router.use(authMiddleware); // جميع مسارات العربة تتطلب تسجيل الدخول

router.route('/')
    .get(getUserCart)
    .post(addToCart)
    .delete(deleteUserCart);

router.delete('/item/:productId', deleteCartItem);

export default router;