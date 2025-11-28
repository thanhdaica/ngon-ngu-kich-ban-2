import User from '../model/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

class UserController {

    // 1. ĐĂNG KÝ (Đã xóa gửi mail)
    async register(req, res) {
        try {
            const { name, email, password } = req.body;
            
            const userExists = await User.findOne({ email: email.toLowerCase() });
            if (userExists) {
                return res.status(400).json({ message: "Email đã được sử dụng" });
            }

            // Mã hóa mật khẩu
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Tạo user mới (isVerified mặc định là true trong Model)
            const user = await User.create({
                name,
                email: email.toLowerCase(),
                password: hashedPassword
            });

            if (user) {
                res.status(201).json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    isAdmin: user.isAdmin,
                    // Có thể trả về token luôn nếu muốn auto-login, 
                    // nhưng ở đây ta chỉ trả về thông báo để chuyển sang trang login
                    message: "Đăng ký thành công! Bạn có thể đăng nhập ngay."
                });
            } else {
                res.status(400).json({ message: "Dữ liệu người dùng không hợp lệ" });
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