import Cart from '../models/Cart.model.js';
import Product from '../models/product.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import createError from '../utils/createError.js';

const addToCart = asyncHandler(async (req, res, next) => {
    const { productId, quantity = 1 } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
        return next(createError(404, 'Product not found'));
    }

    if (product.stock < quantity) {
        return next(createError(400, 'Product is out of stock or requested quantity not available'));
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
        item => item.product.toString() === productId
    );

    const productImage = product.images && product.images.length > 0 ? product.images[0].url : '';

    if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity += Number(quantity);
        cart.items[existingItemIndex].price = product.price;
        cart.items[existingItemIndex].name = product.name;
        cart.items[existingItemIndex].image = productImage;
    } else {
        cart.items.push({
            product: productId,
            name: product.name,
            image: productImage,
            price: product.price,
            quantity: Number(quantity)
        });
    }

    await cart.save();

    res.status(200).json({
        success: true,
        message: 'Item added to cart successfully',
        cart
    });
});

///get user cart
const getUserCart = asyncHandler(async(req,res,next)=>{
    const cart = await Cart.findOne({user: req.user._id}).populate('items.product');
    if(!cart){
        return next(createError(404, 'Cart not found'));
    }
    res.status(200).json({
        success: true,
        cart
    });
})


/// delete item from cart
const deleteCartItem = asyncHandler(async (req, res, next) => {
    const { productId } = req.params;
    const cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
        return next(createError(404, 'Cart not found'));
    }
    
    const itemIndex = cart.items.findIndex(
        item => item.product.toString() === productId
    );
    
    if (itemIndex === -1) {
        return next(createError(404, 'Item not found in cart'));
    }
    
    cart.items.splice(itemIndex, 1);
    await cart.save();
    
    res.status(200).json({
        success: true,
        message: 'Item removed from cart successfully',
        cart
    });
});


///delete user cart
const deleteUserCart = asyncHandler(async(req,res,next)=>{
    const cart = await Cart.findOne({user: req.user._id});
    if(!cart){
        return next(createError(404, 'Cart not found'));
    }
    await Cart.deleteOne({user: req.user._id});
    res.status(200).json({
        success: true,
        message: 'Cart deleted successfully'
    });
});

export {addToCart, getUserCart, deleteCartItem, deleteUserCart};