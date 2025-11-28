// backend/controllers/usersController.js
import mongoose from 'mongoose';
import User from '../model/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sendEmail from '../utils/sendEmail.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

class UserController {

    // 1. ĐĂNG KÝ (ĐÃ SỬA LỖI LOGIC)
    async register(req, res) {
        try {
            const { name, email, password } = req.body;
            
            // Tìm user xem đã có chưa
            let userExists = await User.findOne({ email: email.toLowerCase() });

            // LOGIC SỬA ĐỔI:
            if (userExists) {
                // Nếu đã tồn tại VÀ đã xác thực -> Báo lỗi
                if (userExists.isVerified) {
                    return res.status(400).json({ message: "Email đã được sử dụng và đã xác thực." });
                }
                // Nếu tồn tại nhưng CHƯA xác thực -> Cho phép cập nhật lại OTP và gửi lại
                // (Tiếp tục chạy xuống dưới để update user cũ thay vì create user mới)
            }

            // Mã hóa mật khẩu
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Tạo OTP mới
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

            if (userExists) {
                // --- TRƯỜNG HỢP GỬI LẠI OTP CHO TÀI KHOẢN CHƯA VERIFY ---
                userExists.name = name;
                userExists.password = hashedPassword;
                userExists.otp = otpCode;
                userExists.otpExpires = otpExpires;
                await userExists.save();
            } else {
                // --- TRƯỜNG HỢP TẠO MỚI HOÀN TOÀN ---
                userExists = await User.create({
                    name,
                    email: email.toLowerCase(),
                    password: hashedPassword,
                    otp: otpCode,
                    otpExpires: otpExpires,
                    isVerified: false
                });
            }

            // Gửi Email
            const message = `Mã xác thực (OTP) của bạn là: ${otpCode}. Mã này sẽ hết hạn sau 10 phút.`;
            await sendEmail(userExists.email, "Xác thực tài khoản Shop Sách", message);

            res.status(201).json({
                message: "Mã xác thực đã được gửi vào email. Vui lòng kiểm tra.",
                email: userExists.email
            });

        } catch (error) {
            console.error(error); // Log lỗi ra terminal để debug
            res.status(500).json({ message: "Lỗi đăng ký server", error: error.message });
        }
    }

    // 2. XÁC THỰC EMAIL (Giữ nguyên logic cũ, chỉ thêm log)
    async verifyEmail(req, res) {
        try {
            const { email, otp } = req.body;
            const user = await User.findOne({ email: email.toLowerCase() });

            if (!user) return res.status(400).json({ message: "Không tìm thấy người dùng" });
            if (user.isVerified) return res.status(200).json({ message: "Tài khoản đã được xác thực trước đó", token: generateToken(user._id), ...user._doc });

            if (user.otp !== otp) return res.status(400).json({ message: "Mã OTP không chính xác" });
            if (user.otpExpires < Date.now()) return res.status(400).json({ message: "Mã OTP đã hết hạn" });

            user.isVerified = true;
            user.otp = undefined;
            user.otpExpires = undefined;
            await user.save();

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

    // 3. ĐĂNG NHẬP (Giữ nguyên)
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email: email.toLowerCase() });

            if (user && (await bcrypt.compare(password, user.password))) {
                if (!user.isVerified) {
                    // Gợi ý frontend chuyển hướng sang trang OTP
                    return res.status(401).json({ 
                        message: "Tài khoản chưa xác thực email.",
                        needVerify: true, // Frontend sẽ bắt cờ này
                        email: user.email 
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

    // ... (Giữ nguyên các hàm getMyProfile, updateMyProfile, index, promoteToAdmin) ...
    async getMyProfile(req, res) {
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
            const user = await User.findById(req.user._id);
            if (user) {
                user.name = req.body.name || user.name;
                user.email = req.body.email || user.email;
                if (req.body.password) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(req.body.password, salt);
                }
                const updatedUser = await user.save();
                res.json({
                    _id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                });
            } else {
                res.status(404).json({ message: 'Không tìm thấy người dùng' });
            }
        } catch (error) {
            res.status(400).json({ message: "Lỗi cập nhật thông tin", error: error.message });
        }
    }
    async index(req, res) {
        try {
            const users = await User.find({}).select('-password');
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: "Lỗi lấy danh sách người dùng", error: error.message });
        }
    }
    async promoteToAdmin(req, res) {
        const { id } = req.params;
        const { isAdmin } = req.body; 
        if (req.user._id.toString() === id) {
             return res.status(400).json({ message: 'Không thể tự thay đổi quyền của bản thân' });
        }
        try {
            const userToUpdate = await User.findById(id).select('-password');
            if (!userToUpdate) {
                return res.status(404).json({ message: "Không tìm thấy người dùng" });
            }
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