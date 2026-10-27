import mongoose from 'mongoose';
import slugify from 'slugify';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxLength: 200
    },
    slug: {
        type: String,
        unique: true
    },
    shortDescription: {
        type: String,
        required: true,
        maxLength: 500
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    discountPrice: {
        type: Number,
        default: 0
    },
    stock: {
        type: Number,
        required: true,
        min: 0
    },
    sku: {
        type: String,
        unique: true
    },
    images: [
        {
            url: {
                type: String,
                required: true
            },
            public_id: {
                type: String,
                required: true
            }
        }
    ],
    category: {
        type: String,
        lowercase: true,
        required: true
    },
    subcategory: {
        type: String,
        lowercase: true
    },
    brand: {
        type: String
    },
    tags: [
        { type: String }
    ],
    reviews: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            rating: {
                type: Number,
                required: true,
                min: 1,
                max: 5
            },
            comment: {
                type: String,
                required: true
            }
        }
    ],
    averageRating: {
        type: Number,
        default: 0
    },
    numReviews: {
        type: Number,
        default: 0
    },
    featured: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

productSchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
    next();
});

productSchema.methods.calcAverageRating = async function () {
    const product = this;
    
    if (product.reviews.length === 0) {
        product.averageRating = 0;
        product.numReviews = 0;
    } else {
        product.numReviews = product.reviews.length;
        const totalRating = product.reviews.reduce((acc, review) => acc + review.rating, 0);
        product.averageRating = totalRating / product.numReviews;
    }
    
    await product.save();
};

productSchema.index({ name: 'text', description: 'text', brand: 'text' });
productSchema.index({ category: 1, brand: 1, price: 1, averageRating: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;