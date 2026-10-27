import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    otp: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: '0s' } // MongoDB TTL index to automatically delete expired documents
    },
    userData: {
        type: Object,
        required: true
    }
}, { timestamps: true });

const OTP = mongoose.model('OTP', otpSchema);
export default OTP;