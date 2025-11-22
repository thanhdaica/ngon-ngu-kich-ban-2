import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: [6]
    },
    isAdmin: { 
        type: Boolean,
        required: true,
        default: false 
    },
    // --- THÊM CÁC TRƯỜNG CHO BẢO MẬT ---
    isVerified: {
        type: Boolean,
        default: false // Mặc định chưa xác thực
    },
    otp: {
        type: String, // Lưu mã OTP
    },
    otpExpires: {
        type: Date,   // Thời gian hết hạn OTP
    }
});

export default mongoose.model('User', userSchema);