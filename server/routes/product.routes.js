import authMiddleware from "../middlewares/authMiddleware";
import express from "express";
import adminOnly from "../middlewares/roleMiddleware.js";
import {
    createProduct,
    getAllProducts,
    getProductByIdOrSlug,
    updateProduct,
    deleteProduct
} from "../controllers/products.controller.js";


const router = express.Router();

router.post("/", authMiddleware, adminOnly(['admin']), createProduct);
router.get("/", getAllProducts);
router.get("/:idOrSlug", getProductByIdOrSlug);
router.put("/:id", authMiddleware, adminOnly(['admin']), updateProduct);
router.delete("/:id", authMiddleware, adminOnly(['admin']), deleteProduct);
export default router;