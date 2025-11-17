// src/routes/orders.js (Đã bảo vệ)
import express from 'express';
import OrderController from '../controllers/orderControllers.js';
import { protect } from '../middleware/authMiddleware.js'; // <-- Import middleware
import { admin } from '../middleware/adminMiddleware.js';

const routerOrders = express.Router();
const orderController = new OrderController();

// Route POST (Tạo đơn hàng mới - Checkout)
// Bắt buộc phải đăng nhập (protect)
routerOrders.route('/')
    .post(protect, (req, res) => orderController.addOrderItems(req, res)); // <-- Áp dụng protect

// Route MỚI: GET /api/order (Lấy tất cả đơn hàng)
routerOrders.route('/')
    .get(protect, admin, (req, res) => orderController.getAllOrders(req, res));

// Route GET (Xem chi tiết đơn hàng)
// Bắt buộc phải đăng nhập (protect)
routerOrders.route('/:id')
    .get(protect, (req, res) => orderController.getOrderById(req, res)); // <-- Áp dụng protect

export default routerOrders;