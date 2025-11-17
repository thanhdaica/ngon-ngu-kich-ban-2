// File: backend/controllers/userControllers.js

import mongoose from 'mongoose';
import User from '../model/User.js';
import bcrypt from 'bcryptjs';     // Dùng để mã hóa/so sánh mật khẩu
import jwt from 'jsonwebtoken';  // Dùng để tạo/ký token

// --- HÀM TẠO TOKEN ---
// Dùng "con dấu" bí mật trong file .env
const generateToken = (id) => {
  return jwt.sign(
    { id }, // Dữ liệu bạn muốn lưu vào token (ở đây là ID người dùng)
    process.env.JWT_SECRET, // "Con dấu" bí mật
    { expiresIn: '30d' } // Token sẽ hết hạn sau 30 ngày
  );
};


class UserController {

    /**
     * BƯỚC 1: ĐĂNG KÝ (REGISTER)
     * API: POST /api/user/register
     */
    async register(req, res) {
        try {
            const { name, email, password } = req.body;

            // 1. Kiểm tra xem email đã tồn tại chưa
            const userExists = await User.findOne({ email: email.toLowerCase() });
            if (userExists) {
                return res.status(400).json({ message: "Email đã tồn tại" });
            }

            // 2. Mã hóa mật khẩu (Không bao giờ lưu mật khẩu gốc)
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // 3. Tạo người dùng mới trong database
            const newUser = await User.create({
                name,
                email,
                password: hashedPassword, // Lưu mật khẩu đã mã hóa
            });

            // 4. Trả về thông tin và token
            if (newUser) {
                res.status(201).json({
                    _id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    token: generateToken(newUser._id) // Cấp token ngay khi đăng ký
                });
            } else {
                res.status(400).json({ message: "Dữ liệu người dùng không hợp lệ" });
            }
        } catch (error) {
            res.status(400).json({ message: "Lỗi đăng ký", error: error.message });
        }
    }

    /**
     * BƯỚC 2: ĐĂNG NHẬP (LOGIN)
     * API: POST /api/user/login
     */
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // 1. Tìm người dùng theo email
            const user = await User.findOne({ email });

            // 2. Nếu tìm thấy user, so sánh mật khẩu
            // (bcrypt.compare sẽ tự động so sánh password gốc với password đã mã hóa)
            if (user && (await bcrypt.compare(password, user.password))) {
                // 3. Nếu mật khẩu khớp, trả về thông tin và token
                res.json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    isAdmin: user.isAdmin,
                    token: generateToken(user._id) // Cấp token mới
                });
            } else {
                // Nếu sai email hoặc sai mật khẩu
                res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
            }
        } catch (error) {
            res.status(500).json({ message: "Lỗi đăng nhập", error: error.message });
        }
    }

    async getMyProfile(req, res) {
        // Hàm này tự động lấy ID từ token (req.user) nhờ middleware 'protect'
        const user = {
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            isAdmin: req.user.isAdmin,
        };
        res.json(user);
    }
    async updateMyProfile(req, res) {
        try {
            // 1. Lấy user từ req.user (đã được xác thực qua token bởi middleware 'protect')
            const user = await User.findById(req.user._id);

            if (user) {
                // 2. Cập nhật các trường (nếu có dữ liệu gửi lên)
                user.name = req.body.name || user.name;
                user.email = req.body.email || user.email;

                // 3. Xử lý đổi mật khẩu (nếu user gửi password mới)
                if (req.body.password) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(req.body.password, salt); // Mã hóa mật khẩu mới
                }

                // 4. Lưu lại tài liệu user đã cập nhật
                const updatedUser = await user.save();

                // 5. Trả về thông tin user mới (không có password)
                res.json({
                    _id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                });
            } else {
                res.status(404).json({ message: 'Không tìm thấy người dùng' });
            }
        } catch (error) {
            // Trả về lỗi 400 nếu vi phạm validation (ví dụ: email đã tồn tại, mật khẩu quá ngắn)
            res.status(400).json({ message: "Lỗi cập nhật thông tin", error: error.message });
        }
    }
    
    /**
     * [GET] /api/user
     * MỤC ĐÍCH: Lấy tất cả người dùng (Chỉ Admin)
     */
    async index(req, res) {
        try {
            // Lấy tất cả user, trừ mật khẩu
            const users = await User.find({}).select('-password');
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: "Lỗi lấy danh sách người dùng", error: error.message });
        }
    }

    /**
     * [PUT] /api/user/:id/role
     * MỤC ĐÍCH: Thăng cấp/Hạ cấp quyền Admin
     */
    async promoteToAdmin(req, res) {
        const { id } = req.params;
        // Frontend sẽ gửi { isAdmin: true/false }
        const { isAdmin } = req.body; 

        if (req.user._id.toString() === id) {
             return res.status(400).json({ message: 'Không thể tự thay đổi quyền của bản thân' });
        }

        try {
            const userToUpdate = await User.findById(id).select('-password');

            if (!userToUpdate) {
                return res.status(404).json({ message: 'Không tìm thấy người dùng' });
            }

            // Cập nhật trường isAdmin
            userToUpdate.isAdmin = isAdmin; 

            const updatedUser = await userToUpdate.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                isAdmin: updatedUser.isAdmin,
                message: `Cập nhật quyền thành công.`
            });
        } catch (error) {
            res.status(400).json({ message: "Lỗi cập nhật quyền", error: error.message });
        }
    }
    
}

export default UserController;