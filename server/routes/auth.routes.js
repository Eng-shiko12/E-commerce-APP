import express from 'express';
import { 
    registerUser,
    loginUser, verifyOtp, 
    updateDetails, 
    updatePassword
} from'../controllers/auth.controller.js';

import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register/send-otp', registerUser);
router.post('/register/verify-otp', verifyOtp);
router.post('/login', loginUser);

router.get('/me', authMiddleware, getMe);

router.put('/updatedetails', authMiddleware, updateDetails);
router.put('/updatepassword', authMiddleware, updatePassword);
export default router;