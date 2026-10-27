import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            name: {
                type: String,
                required: true
            },
            image: {
                type: String,
                required: true
            },
            price: {
                type: Number,
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            }
        }
    ],
    coupon: {
        code: {
            type: String,
            uppercase: true,
            default: null
        },
        discountType: {
            type: String,
            enum: ['percentage', 'fixed'],
            default: null
        },
        discountValue: {
            type: Number,
            default: 0
        }
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual: Compute subtotal (sum of price * quantity)
cartSchema.virtual('subtotal').get(function () {
    return this.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
});

// Virtual: Compute total number of units across all items
cartSchema.virtual('itemCount').get(function () {
    return this.items.reduce((acc, item) => acc + item.quantity, 0);
});

// Virtual: Compute discount amount based on coupon type and value
cartSchema.virtual('discountAmount').get(function () {
    if (!this.coupon || !this.coupon.code) return 0;
    const subtotal = this.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    
    if (this.coupon.discountType === 'percentage') {
        return (subtotal * this.coupon.discountValue) / 100;
    } else if (this.coupon.discountType === 'fixed') {
        return Math.min(this.coupon.discountValue, subtotal);
    }
    return 0;
});

// Virtual: Compute final total (subtotal minus discountAmount)
cartSchema.virtual('total').get(function () {
    const subtotal = this.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    let discount = 0;
    
    if (this.coupon && this.coupon.code) {
        if (this.coupon.discountType === 'percentage') {
            discount = (subtotal * this.coupon.discountValue) / 100;
        } else if (this.coupon.discountType === 'fixed') {
            discount = Math.min(this.coupon.discountValue, subtotal);
        }
    }
    
    return Math.max(0, subtotal - discount);
});

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;