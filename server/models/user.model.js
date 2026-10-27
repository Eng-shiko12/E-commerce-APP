import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true 
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        select: false,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    avatar: {
        type: String,
        trim: true,
        default: 'https://icon-library.com/images/default-profile-icon/default-profile-icon-24.jpg'
    },
    role: {
        type: String,
        enum: ["admin", "customer"],
        default: "customer"
    },
    addresses: [
        {
            fullName: String,
            phone: String,
            country: String,
            city: String,
            address: String,
            postalCode: String
        }
    ],
    wishlist: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        }
    ],
    isVerified: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpire: {
        type: Date
    }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;