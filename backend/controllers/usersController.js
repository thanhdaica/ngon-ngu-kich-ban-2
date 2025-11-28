import mongoose from 'mongoose';
import User from '../model/User.js';
import bcrypt from 'bcryptjs';     
import jwt from 'jsonwebtoken';  
import sendEmail from '../utils/sendEmail.js';

// --- HÀM TẠO TOKEN ---
const generateToken = (id) => {
  return jwt.sign(
    { id }, 
    process.env.JWT_SECRET, 
    { expiresIn: '30d' } 
  );
};

class UserController {

    // 1. ĐĂNG KÝ (ĐÃ SỬA LỖI)
    async register(req, res) {
        try {
            const { name, email, password } = req.body;
            const emailLower = email.toLowerCase();

            // Kiểm tra xem user đã tồn tại chưa
            let userExists = await User.findOne({ email: emailLower });

            if (userExists) {
                // Nếu đã tồn tại VÀ đã xác thực -> Báo lỗi
                if (userExists.isVerified) {
                    return res.status(400).json({ message: "Email đã được sử dụng và đã xác thực." });
                }
                // Nếu tồn tại nhưng CHƯA xác thực -> Cho phép chạy tiếp để gửi lại OTP
            }

            // --- CHUẨN BỊ DỮ LIỆU ---
            
            // 1. Mã hóa mật khẩu
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // 2. Tạo OTP 6 số ngẫu nhiên
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
            // OTP hết hạn sau 10 phút
            const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

            // 3. Chuẩn bị nội dung Email
            const message = `Mã xác thực (OTP) của bạn là: ${otpCode}. Mã này sẽ hết hạn sau 10 phút.`;

            // --- GỬI EMAIL TRƯỚC KHI LƯU DB ---
            // Đây là bước quan trọng để tránh tạo user rác nếu email sai/lỗi mạng
            const isEmailSent = await sendEmail(emailLower, "Xác thực tài khoản Shop Sách", message);

            if (!isEmailSent) {
                return res.status(500).json({ 
                    message: "Lỗi hệ thống: Không thể gửi email xác thực. Vui lòng kiểm tra lại địa chỉ email hoặc thử lại sau." 
                });
            }

            // --- LƯU VÀO DATABASE SAU KHI GỬI MAIL THÀNH CÔNG ---
            
            if (userExists) {
                // Cập nhật lại user cũ chưa xác thực
                userExists.name = name;
                userExists.password = hashedPassword;
                userExists.otp = otpCode;
                userExists.otpExpires = otpExpires;
                await userExists.save();
            } else {
                // Tạo user mới
                await User.create({
                    name,
                    email: emailLower,
                    password: hashedPassword,
                    otp: otpCode,
                    otpExpires: otpExpires,
                    isVerified: false
                });
            }

            res.status(201).json({
                message: "Mã xác thực đã được gửi vào email. Vui lòng kiểm tra.",
                email: emailLower 
            });

        } catch (error) {
            console.error("Lỗi tại hàm register:", error);
            res.status(500).json({ message: "Lỗi đăng ký server", error: error.message });
        }
    }

    // 2. XÁC THỰC EMAIL
    async verifyEmail(req, res) {
        try {
            const { email, otp } = req.body;

            const user = await User.findOne({ email: email.toLowerCase() });

            if (!user) {
                return res.status(400).json({ message: "Không tìm thấy người dùng" });
            }

            if (user.isVerified) {
                return res.status(200).json({ 
                    message: "Tài khoản đã được xác thực trước đó",
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    isAdmin: user.isAdmin,
                    token: generateToken(user._id)
                 });
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

    // 3. ĐĂNG NHẬP
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email: email.toLowerCase() });

            if (user && (await bcrypt.compare(password, user.password))) {
                
                // CHECK BẢO MẬT: Nếu chưa xác thực thì không cho đăng nhập
                if (!user.isVerified) {
                    return res.status(401).json({ 
                        message: "Tài khoản chưa xác thực email.",
                        needVerify: true, // Frontend sẽ bắt cờ này để chuyển hướng
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

    // 4. LẤY PROFILE
    async getMyProfile(req, res) {
        const user = {
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            isAdmin: req.user.isAdmin,
        };
        res.json(user);
    }

    // 5. CẬP NHẬT PROFILE
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
    
    // 6. DANH SÁCH USER (ADMIN)
    async index(req, res) {
        try {
            const users = await User.find({}).select('-password');
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: "Lỗi lấy danh sách người dùng", error: error.message });
        }
    }

    // 7. THAY ĐỔI QUYỀN (ADMIN)
    async promoteToAdmin(req, res) {
        const { id } = req.params;
        const { isAdmin } = req.body; 

        if (req.user._id.toString() === id) {
             return res.status(400).json({ message: 'Không thể tự thay đổi quyền của bản thân' });
        }

        try {
            const userToUpdate = await User.findById(id).select('-password');

            if (!userToUpdate) {
                return res.status(404).json({ message: 'Không tìm thấy người dùng' });
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