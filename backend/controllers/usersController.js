// File: backend/controllers/userControllers.js

import mongoose from 'mongoose';
import User from '../model/User.js';
import bcrypt from 'bcryptjs';     // Dùng để mã hóa/so sánh mật khẩu
import jwt from 'jsonwebtoken';  // Dùng để tạo/ký token
import sendEmail from '../utils/sendEmail.js';

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

    // 1. ĐĂNG KÝ (Sửa đổi) -> Chưa trả về token ngay
    async register(req, res) {
        try {
            const { name, email, password } = req.body;

            const userExists = await User.findOne({ email: email.toLowerCase() });
            if (userExists) {
                // Nếu user đã tồn tại nhưng chưa xác thực, ta có thể cho phép gửi lại OTP (Optional logic)
                // Ở đây ta báo lỗi cho đơn giản
                return res.status(400).json({ message: "Email đã được sử dụng" });
            }

            // Mã hóa mật khẩu
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Tạo OTP 6 số ngẫu nhiên
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
            // OTP hết hạn sau 10 phút
            const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

            // Tạo user (isVerified = false)
            const newUser = await User.create({
                name,
                email: email.toLowerCase(),
                password: hashedPassword,
                otp: otpCode,
                otpExpires: otpExpires,
                isVerified: false
            });

            if (newUser) {
                // Gửi Email OTP
                const message = `Mã xác thực (OTP) của bạn là: ${otpCode}. Mã này sẽ hết hạn sau 10 phút.`;
                await sendEmail(newUser.email, "Xác thực tài khoản Shop Sách", message);

                res.status(201).json({
                    message: "Đăng ký thành công. Vui lòng kiểm tra email để nhập mã xác thực.",
                    email: newUser.email // Trả về email để frontend dùng
                });
            } else {
                res.status(400).json({ message: "Dữ liệu người dùng không hợp lệ" });
            }
        } catch (error) {
            res.status(400).json({ message: "Lỗi đăng ký", error: error.message });
        }
    }

    // 2. XÁC THỰC EMAIL (Hàm mới)
    async verifyEmail(req, res) {
        try {
            const { email, otp } = req.body;

            const user = await User.findOne({ email: email.toLowerCase() });

            if (!user) {
                return res.status(400).json({ message: "Không tìm thấy người dùng" });
            }

            if (user.isVerified) {
                return res.status(400).json({ message: "Tài khoản đã được xác thực trước đó" });
            }

            // Kiểm tra OTP và thời gian hết hạn
            if (user.otp !== otp) {
                return res.status(400).json({ message: "Mã OTP không chính xác" });
            }

            if (user.otpExpires < Date.now()) {
                return res.status(400).json({ message: "Mã OTP đã hết hạn. Vui lòng đăng ký lại." });
            }

            // Xác thực thành công
            user.isVerified = true;
            user.otp = undefined; // Xóa OTP sau khi dùng
            user.otpExpires = undefined;
            await user.save();

            // Trả về Token để tự động đăng nhập
            res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                token: generateToken(user._id),
                message: "Xác thực thành công!"
            });

        } catch (error) {
            res.status(500).json({ message: "Lỗi xác thực", error: error.message });
        }
    }

    // 3. ĐĂNG NHẬP (Sửa đổi: Kiểm tra đã xác thực chưa)
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });

            if (user && (await bcrypt.compare(password, user.password))) {
                
                // CHECK BẢO MẬT: Nếu chưa xác thực thì không cho đăng nhập
                if (!user.isVerified) {
                    return res.status(401).json({ 
                        message: "Tài khoản chưa xác thực email. Vui lòng kiểm tra email." 
                    });
                }

                res.json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    isAdmin: user.isAdmin,
                    token: generateToken(user._id)
                });
            } else {
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