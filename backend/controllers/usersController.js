import User from '../model/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto'; // Import thư viện Crypto

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

class UserController {

    // --- 1. ĐĂNG KÝ (TẠO OTP ĐỘNG & CHẾ ĐỘ DEMO) ---
    async register(req, res) {
        try {
            const { name, email, password, captchaToken, honeypot } = req.body;

            // A. Check Honeypot & Captcha
            if (honeypot) {
                console.warn("Bot detected via Honeypot!");
                return res.status(400).json({ message: "Phát hiện Bot" });
            }
            if (!captchaToken) {
                return res.status(400).json({ message: "Vui lòng xác thực Captcha" });
            }
            const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`;
            const googleResponse = await axios.post(verifyUrl);
            if (!googleResponse.data.success) {
                 return res.status(400).json({ message: "Captcha không hợp lệ." });
            }

            // C. Kiểm tra User tồn tại và xóa User chưa xác thực
            const userExists = await User.findOne({ email: email.toLowerCase() });
            if (userExists) {
                if (!userExists.isVerified) {
                     // Nếu chưa xác thực -> Xóa user cũ để tạo lại OTP mới
                     await User.deleteOne({ email: email.toLowerCase() });
                } else {
                     return res.status(400).json({ message: "Email đã được sử dụng" });
                }
            }
            
            // D. SINH MÃ OTP NGẪU NHIÊN (BẢO MẬT)
            const otpCode = crypto.randomInt(100000, 999999).toString();

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // E. Lưu User + OTP vào DB
            const newUser = await User.create({
                name,
                email: email.toLowerCase(),
                password: hashedPassword,
                isVerified: false, // Bắt buộc false
                otp: otpCode,      
                otpExpires: Date.now() + 10 * 60 * 1000 // 10 phút
            });

            // F. GỬI EMAIL VÀ XỬ LÝ LỖI MẠNG (CHẾ ĐỘ DEMO)
            try {
                const subject = "Mã xác thực (OTP) - Web Sách 3 Anh Em";
                const text = `Xin chào ${name},\n\nMã OTP của bạn là: ${otpCode}`;
                
                // Thử gửi mail
                await sendEmail(email, subject, text); 

                // Nếu gửi được (trên local/server không bị chặn)
                res.status(201).json({
                    message: "Đăng ký thành công! Vui lòng kiểm tra Email.",
                    email: newUser.email 
                });

            } catch (emailError) {
                // --- KHI GỬI MAIL THẤT BẠI (RENDER BLOCK) ---
                console.error("====================================================");
                console.error("⚠️ LỖI GỬI MAIL (RENDER BLOCK). CHẾ ĐỘ DEMO ĐÃ BẬT.");
                console.error(`🔑 [OTP DEMO]: ${otpCode}`); // IN OTP RA LOG SERVER
                console.error("====================================================");
                
                // Báo thành công cho Frontend để chuyển trang (Không xóa user vừa tạo)
                res.status(201).json({
                    message: "Tài khoản đã tạo. (Xem Log Server để lấy OTP Demo)",
                    email: newUser.email 
                });
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

            // KIỂM TRA MÃ OTP
            if (user.otp !== otp) {
                return res.status(400).json({ message: "Mã OTP không chính xác!" });
            }

            // KIỂM TRA THỜI GIAN
            if (user.otpExpires < Date.now()) {
                return res.status(400).json({ message: "Mã OTP đã hết hạn. Vui lòng đăng ký lại." });
            }

            // XÁC THỰC THÀNH CÔNG
            user.isVerified = true;
            user.otp = undefined;       // Xóa OTP
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

    // --- 3. LOGIN (Phải check đã xác thực chưa) ---
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

    // --- CÁC HÀM KHÁC GIỮ NGUYÊN ---
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