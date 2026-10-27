import User from '../models/user.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import createError from '../utils/createError.js';
import generateOtp from '../utils/generateOtp.js';
import OTP from '../models/OTP.model.js';
import sendEmail from '../utils/sendEmail.js';
import generateTokens from '../utils/generateTokens.js';
const registerUser = asyncHandler (async (req ,res ,next )=>{
    const {username ,email ,password} =req.body;
    const userExists = await User.findOne({email});
    if(userExists){
        return next(createError(400 , 'User already exists'));
    }
    const otp = await generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    const otpDocument = await OTP.create({
        email,
        otp,
        expiresAt: otpExpiry,
        userData: { username, email, password }
    });
    await sendEmail(email, otp);
    res.status(200).json({
        success: true,
        message: 'OTP sent to your email successfully. Please verify to complete registration.'
    });
})


const verifyOtp = asyncHandler (async (req ,res ,next )=>{
    const {email ,otp} =req.body;
    const otpDocument = await OTP.findOne({email ,otp});
    if(!otpDocument){
        return next(createError(400 , 'Invalid OTP'));
    }
    if(otpDocument.expiresAt < new Date()){
        await OTP.deleteOne({email ,otp});
        return next(createError(400 , 'OTP has expired'));
    }
    const {username ,password} =otpDocument.userData;
    const newUser = await User.create({username ,email ,password});
    await OTP.deleteOne({email ,otp});
    const accessToken = generateTokens(newUser);
    res.status(200).json({
        success: true,
        message: 'User registered successfully',
        accessToken
    });
});

const LoginUser =asyncHandler (async(req,res,next)=>{
    const {email ,password} =req.body;
    const user = await User.findOne({email}).select('+password');
    if(!user){
        return next(createError(400 , 'Invalid email or password'));
    }
    const isPasswordMatch = await user.comparePassword(currentPassword);
    if(!isPasswordMatch){
        return next(createError(400 , 'Invalid email or password'));
    }
    const accessToken = generateTokens(user);
    res.status(200).json({
        success: true,
        message: 'User logged in successfully',
        accessToken
    });
})
const getMe =asyncHandler(async(req,res,next)=>{
    res.status(200).json({
        success: true,
        user: req.user
    }); 
});

const updateDetails =asyncHandler(async(req,res,next)=>{
    const {username ,email} =req.body;
    req.user.username = username || req.user.username;
    req.user.email = email || req.user.email;
    await req.user.save();
    res.status(200).json({
        success: true,
        message: 'User details updated successfully',
        user: req.user
    }); 
})

const updatePassword =asyncHandler(async(req,res,next)=>{
    const {currentPassword ,newPassword} =req.body;
    const isMatch = await req.user.comparePassword(currentPassword);
    if(!isMatch){
        return next(createError(400 , 'Current password is incorrect'));
    }
    req.user.password = newPassword;
    await req.user.save();
    res.status(200).json({
        success: true,
        message: 'Password updated successfully'
    }); 
});

export {registerUser ,verifyOtp ,LoginUser, getMe, updateDetails, updatePassword};