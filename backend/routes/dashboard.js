// backend/routes/dashboard.js
import express from 'express';
import DashboardController from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js'; 
import { admin } from '../middleware/adminMiddleware.js'; // <-- Import middleware admin

const routerDashboard = express.Router();
const dashboardController = new DashboardController();

// Lấy số liệu thống kê
// Cần BẢO VỆ 2 LỚP: Đăng nhập (protect) VÀ có quyền Admin (admin)
routerDashboard.get('/stats', protect, admin, (req, res) => dashboardController.getStats(req, res));

export default routerDashboard;