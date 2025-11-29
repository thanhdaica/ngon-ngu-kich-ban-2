import User from '../model/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto'; // 1. Import thư viện Crypto có sẵn của Node.js

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

class UserController {

    // --- 1. ĐĂNG KÝ (TẠO OTP ĐỘNG) ---
    async register(req, res) {
        try {
            const { name, email, password, captchaToken, honeypot } = req.body;

            // A. Check Honeypot (Chặn Bot)
            if (honeypot) {
                console.warn("Bot detected via Honeypot!");
                return res.status(400).json({ message: "Phát hiện Bot" });
            }

            // B. Check Captcha (Chống Spam request)
            if (!captchaToken) {
                return res.status(400).json({ message: "Vui lòng xác thực Captcha" });
            }
            const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`;
            const googleResponse = await axios.post(verifyUrl);
            if (!googleResponse.data.success) {
                 return res.status(400).json({ message: "Captcha không hợp lệ." });
            }

            // C. Kiểm tra User tồn tại
            const userExists = await User.findOne({ email: email.toLowerCase() });
            if (userExists) {
                if (!userExists.isVerified) {
                     // Nếu chưa xác thực -> Xóa user cũ để tạo lại (ghi đè OTP mới)
                     await User.deleteOne({ email: email.toLowerCase() });
                } else {
                     return res.status(400).json({ message: "Email đã được sử dụng" });
                }
            }
            
            // --- D. SINH MÃ OTP NGẪU NHIÊN (BẢO MẬT) ---
            // Sử dụng crypto.randomInt để tạo số ngẫu nhiên an toàn mật mã học
            // Tạo số từ 100000 đến 999999
            const otpCode = crypto.randomInt(100000, 999999).toString();

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // E. Lưu User + OTP vào DB
            const newUser = await User.create({
                name,
                email: email.toLowerCase(),
                password: hashedPassword,
                isVerified: false, 
                otp: otpCode,
                otpExpires: Date.now() + 10 * 60 * 1000 
            });

            // F. Gửi Email (Bọc trong try-catch riêng hoặc để catch tổng xử lý)
            try {
                const subject = "Mã xác thực (OTP) - Web Sách 3 Anh Em";
                const text = `Xin chào ${name},\n\nMã OTP của bạn là: ${otpCode}`;
                
                await sendEmail(email, subject, text); // Nếu lỗi, nó sẽ nhảy xuống catch

                res.status(201).json({
                    message: "Đăng ký thành công! Vui lòng kiểm tra Email.",
                    email: email 
                });
            } catch (emailError) {
                // Nếu gửi mail lỗi -> Xóa user vừa tạo để tránh rác DB
                await User.findByIdAndDelete(newUser._id);
                console.error("Gửi mail thất bại, đã rollback user:", emailError);
                return res.status(500).json({ message: "Lỗi gửi email xác thực. Vui lòng thử lại sau." });
            }

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Lỗi Server", error: error.message });
        }
    }

    // --- 2. XÁC THỰC OTP (KIỂM TRA CHẶT CHẼ) ---
    async verifyOTP(req, res) {
        try {
            const { email, otp } = req.body;
            
            const user = await User.findOne({ email: email.toLowerCase() });

            if (!user) {
                return res.status(400).json({ message: "Người dùng không tồn tại" });
            }

            if (user.isVerified) {
                return res.status(400).json({ message: "Tài khoản này đã được xác thực rồi." });
            }

            // --- KIỂM TRA MÃ OTP ---
            // So sánh chính xác mã user nhập với mã trong DB
            // ĐÃ XÓA logic "|| otp === 123456"
            if (user.otp !== otp) {
                return res.status(400).json({ message: "Mã OTP không chính xác!" });
            }

            // --- KIỂM TRA THỜI GIAN ---
            if (user.otpExpires < Date.now()) {
                return res.status(400).json({ message: "Mã OTP đã hết hạn. Vui lòng đăng ký lại." });
            }

            // --- XÁC THỰC THÀNH CÔNG ---
            user.isVerified = true;
            user.otp = undefined;       // Xóa OTP ngay lập tức để không thể dùng lại (Replay Attack Protection)
            user.otpExpires = undefined;
            await user.save();

            res.json({
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

    // 3. LOGIN (Phải check đã xác thực chưa)
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email: email.toLowerCase() });

            if (user && (await bcrypt.compare(password, user.password))) {
                
                // Chặn nếu chưa verify OTP
                if (!user.isVerified) {
                    return res.status(401).json({ message: "Tài khoản chưa xác thực. Vui lòng kiểm tra email để lấy OTP." });
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

    // ... (Giữ nguyên các hàm profile, updateProfile, index...) ...
    async getMyProfile(req, res) {
        // ... (Code cũ của bạn)
        const user = {
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            isAdmin: req.user.isAdmin,
        };
        res.json(user);
    }
    
    async updateMyProfile(req, res) {
         // ... (Code cũ của bạn)
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
         // ... (Code cũ của bạn)
         try {
            const users = await User.find({}).select('-password');
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: "Lỗi lấy danh sách người dùng", error: error.message });
        }
    }

    async promoteToAdmin(req, res) {
         // ... (Code cũ của bạn)
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