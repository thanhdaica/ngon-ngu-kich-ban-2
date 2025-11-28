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
    // Mặc định là đã xác thực luôn
    isVerified: {
        type: Boolean,
        default: true 
    }
});

export default mongoose.model('User', userSchema);