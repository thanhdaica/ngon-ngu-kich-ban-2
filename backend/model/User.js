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
        default: false 
    },

    // --- QUAN TRỌNG: Mặc định phải là false ---
    isVerified: {
        type: Boolean,
        default: false 
    },

    // --- Thêm 2 trường bị thiếu ---
    otp: {
        type: String,
        required: false
    },
    otpExpires: {
        type: Number,
        required: false
    }
});

export default mongoose.model('User', userSchema);
