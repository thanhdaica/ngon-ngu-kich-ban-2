import User from '../model/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

class UserController {

    // 1. ĐĂNG KÝ (CÓ CHECK CAPTCHA)
    async register(req, res) {
        try {
            // 2. Lấy thêm captchaToken từ body
            const { name, email, password, captchaToken } = req.body;
            
            // --- BẮT ĐẦU LOGIC CHECK CAPTCHA ---
            if (!captchaToken) {
                return res.status(400).json({ message: "Vui lòng xác thực Captcha" });
            }

            // Gọi sang Google để kiểm tra token
            const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`;
            
            const googleResponse = await axios.post(verifyUrl);
            const { success } = googleResponse.data;

            if (!success) {
                 return res.status(400).json({ message: "Xác thực người máy thất bại. Vui lòng thử lại." });
            }
            // --- KẾT THÚC LOGIC CHECK CAPTCHA ---


            // ... (Phần logic kiểm tra User cũ và tạo User mới GIỮ NGUYÊN như code bạn đang có) ...
            const userExists = await User.findOne({ email: email.toLowerCase() });
            if (userExists) {
                return res.status(400).json({ message: "Email đã được sử dụng" });
            }
            
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const user = await User.create({
                name,
                email: email.toLowerCase(),
                password: hashedPassword,
                isVerified: true // Vì đã bỏ OTP nên set luôn là true
            });

            if (user) {
                res.status(201).json({
                    message: "Đăng ký thành công! Bạn có thể đăng nhập ngay."
                });
            } else {
                res.status(400).json({ message: "Dữ liệu không hợp lệ" });
            }

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Lỗi đăng ký server", error: error.message });
        }
    }

    // 2. ĐĂNG NHẬP (Đã bỏ check xác thực)
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email: email.toLowerCase() });

            if (user && (await bcrypt.compare(password, user.password))) {
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