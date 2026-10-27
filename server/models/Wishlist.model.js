import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },
    products: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        }
    ]
}, { timestamps: true });

// Pre-find hook to auto-populate product details
wishlistSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'products',
        select: 'name slug price discountPrice images category brand stock averageRating'
    });
    next();
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);
export default Wishlist;