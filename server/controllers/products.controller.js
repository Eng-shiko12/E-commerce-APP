import Product from '../models/Product.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import createError from '../utils/createError.js';

const createProduct = asyncHandler(async (req, res, next) => {
    const { 
        name, 
        shortDescription, 
        description, 
        price, 
        discountPrice, 
        category, 
        subcategory, 
        brand, 
        stock, 
        sku, 
        images, 
        featured 
    } = req.body;
    
    const product = await Product.create({
        name,
        shortDescription,
        description,
        price,
        discountPrice,
        category,
        subcategory,
        brand,
        stock,
        sku,
        images,
        featured,
        createdBy: req.user._id
    });

    res.status(201).json({
        success: true,
        message: 'Product created successfully',
        product
    }); 
});

const getAllProducts = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { category, brand, minPrice, maxPrice, search } = req.query;
    
    const query = {};
    if (category) query.category = category;
    if (brand) query.brand = brand;
    
    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    // البحث النصي
    if (search) {
        query.$text = { $search: search };
    }
    
    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);
    
    const products = await Product.find(query)
        .skip((page - 1) * limit)
        .limit(limit);
        
    res.status(200).json({
        success: true,
        totalProducts,
        totalPages,
        currentPage: page,
        products
    });
});

const getProductByIdOrSlug = asyncHandler(async (req, res, next) => {
    const { idOrSlug } = req.params;
    let product;
    
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
        product = await Product.findById(idOrSlug);
    } else {
        product = await Product.findOne({ slug: idOrSlug });
    }
    
    if (!product) {
        return next(createError(404, 'Product not found'));
    }
    
    res.status(200).json({
        success: true,
        product
    });
});

const updateProduct = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { 
        name, 
        shortDescription, 
        description, 
        price, 
        discountPrice, 
        category, 
        subcategory, 
        brand, 
        stock, 
        sku, 
        images, 
        featured 
    } = req.body;
    
    const product = await Product.findById(id);
    if (!product) {
        return next(createError(404, 'Product not found'));
    }
    
    product.name = name || product.name;
    product.shortDescription = shortDescription || product.shortDescription;
    product.description = description || product.description;
    product.price = price !== undefined ? price : product.price;
    product.discountPrice = discountPrice !== undefined ? discountPrice : product.discountPrice;
    product.category = category || product.category;
    product.subcategory = subcategory || product.subcategory;
    product.brand = brand || product.brand;
    product.stock = stock !== undefined ? stock : product.stock;
    product.sku = sku || product.sku;
    product.images = images || product.images;
    product.featured = featured !== undefined ? featured : product.featured;
    
    await product.save();
    
    res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        product
    });
});

const deleteProduct = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    
    if (!product) {
        return next(createError(404, 'Product not found'));
    }
    
    await product.deleteOne(); 
    
    res.status(200).json({
        success: true,
        message: 'Product deleted successfully'
    });
});

export {
    createProduct,
    getAllProducts,
    getProductByIdOrSlug,
    updateProduct,
    deleteProduct
};