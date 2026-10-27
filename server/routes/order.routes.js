import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import adminOnly from '../middlewares/adminOnly.js';
import {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus
} from '../controllers/order.controller.js';

const router = express.Router();

router.use(authMiddleware); // جميع مسارات الطلبات تتطلب تسجيل الدخول

router.route('/')
    .post(createOrder)
    .get(adminOnly(['admin']), getAllOrders); // المشرف فقط يمكنه جلب كل الطلبات

router.get('/myorders', getMyOrders);
router.get('/:orderId', getOrderById);
router.put('/:orderId/status', adminOnly(['admin']), updateOrderStatus); // المشرف فقط يمكنه تحديث حالة الطلب

export default router;