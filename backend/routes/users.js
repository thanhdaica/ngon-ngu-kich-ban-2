// backend/routes/users.js
import express from 'express';
import UsersController from '../controllers/usersController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js'; // Giả sử đã tạo

const routerUsers = express.Router();
const userscontroller = new UsersController();

// POST /api/user/register (Công khai)
routerUsers.post('/register', (req, res) => userscontroller.register(req, res));

// Xác thực OTP (Verify) -> ROUTE MỚI
routerUsers.post('/verify', (req, res) => userscontroller.verifyEmail(req, res));

// POST /api/user/login (Công khai)
routerUsers.post('/login', (req, res) => userscontroller.login(req, res));

// GET /api/user (Lấy tất cả user - CHỈ ADMIN)
routerUsers.get('/', protect, admin, (req, res) => userscontroller.index(req, res)); // <== BẢO VỆ

routerUsers.get('/profile', protect, (req, res) => userscontroller.getMyProfile(req, res));
routerUsers.put('/profile', protect, (req, res) => userscontroller.updateMyProfile(req, res));

// PUT /api/user/:id/role (Thay đổi quyền Admin - CHỈ ADMIN)
// Thêm API này để Frontend Admin có thể gọi
routerUsers.put('/:id/role', protect, admin, (req, res) => userscontroller.promoteToAdmin(req, res)); // <== THÊM API NÀY

export default routerUsers;