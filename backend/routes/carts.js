import express from 'express';
import CartsController from '../controllers/cartsController.js';
import { protect } from '../middleware/authMiddleware.js';

const routerCarts = express.Router();
const cartscontroller = new CartsController();

// GET /api/cart
routerCarts.get('/', protect, (req, res) => cartscontroller.getMyCart(req, res));

// POST /api/cart (Thêm mới/Cộng dồn)
routerCarts.post('/', protect, (req, res) => cartscontroller.addToCart(req, res));

// PUT /api/cart (Cập nhật số lượng - Tăng/Giảm) --> MỚI
routerCarts.put('/', protect, (req, res) => cartscontroller.updateCartItem(req, res));

// DELETE /api/cart/:productId
routerCarts.delete('/:productId', protect, (req, res) => cartscontroller.removeFromCart(req, res));

export default routerCarts;