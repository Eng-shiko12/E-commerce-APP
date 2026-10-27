import Order from '../models/order.model.js';
import Cart from '../models/Cart.model.js';
import Product from '../models/product.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import createError from '../utils/createError.js';


const createOrder = asyncHandler(async(req,res,next)=>{
    const cart = await Cart.findOne({user:req.user._id}); //get the user cart 
    if(!cart || cart.items.length === 0){
        return next(createError(400,'Cart is empty'));
    }/// check if the product is in stock
    //// check if the product is in stock
    for(const item of cart.items){
        const product = await Product.findById(item.product);
        if(!product){
            return next(createError(404,`Product ${item.name} not found`));
        }
        if(product.stock < item.quantity){
            return next(createError(400,`Product ${item.name} is out of stock or requested quantity not available`));
        }
    }
    const {shippingAddress,shippingFee,tax} = req.body;
    const subtotal = cart.subtotal;
    const totalPrice = subtotal + shippingFee + tax;
    const order = await Order.create({
        user:req.user._id,
        items:cart.items,
        shippingAddress,
        shippingFee,
        tax,
        subtotal,
        totalPrice
    });
    /// update the product stock 
    for(const item of cart.items){
        const product = await Product.findById(item.product);
        product.stock -= item.quantity;
        await product.save();
    }
    /// delete the cart
    await Cart.findOneAndDelete({user:req.user._id});
    res.status(201).json({
        success:true,
        message:'Order created successfully',
        order
    })
});


const getMyOrders = asyncHandler(async(req, res, next) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    
    if (!orders || orders.length === 0) {
        return next(createError(404, "You don't have any orders")); 
    }
    
    res.status(200).json({
        success: true,
        orders
    });
});

const getOrderById = asyncHandler(async(req, res, next) => {
    const { orderId } = req.params; 
    const order = await Order.findById(orderId);
    
    if (!order) {
        return next(createError(404, "This order was not found")); 
    }
    

    res.status(200).json({
        success: true,
        order
    });
});



const getAllOrders =asyncHandler(async (req,res,next) =>{
    const { page = 1, limit = 10, status } = req.query;
    const query = status ? { status } : {};
    const orders = await Order.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('user', 'username email')
        .populate('items.product', 'name price');
    const totalOrders = await Order.countDocuments(query);
    res.status(200).json({  
        success: true,
        totalOrders,
        currentPage: Number(page),
        totalPages: Math.ceil(totalOrders / limit),
        orders
    });
})




const updateOrderStatus = asyncHandler(async (req, res, next) => {
    const { orderId } = req.params;
    const { status, paymentStatus } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
        return next(createError(404, 'Order not found'));
    }
    order.status = status || order.status;
    order.paymentStatus = paymentStatus || order.paymentStatus;
    await order.save();
    res.status(200).json({
        success: true,
        message: 'Order status updated successfully',
        order
    });
});



export {createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus
}
