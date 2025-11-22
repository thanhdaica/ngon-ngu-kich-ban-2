import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

export default function VerifyOtpPage() {
    const [otp, setOtp] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const { setTokenAndUser } = useAuth(); // Cần thêm hàm này ở Context

    // Lấy email được truyền từ trang Register
    const email = location.state?.email;

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!otp) return toast.error("Vui lòng nhập mã OTP");

        try {
            const response = await axios.post('/api/user/verify', { email, otp });
            
            // Xác thực thành công: Lưu token và chuyển về trang chủ
            const data = response.data;
            toast.success("Xác thực thành công! Đăng nhập tự động.");
            
            // Gọi hàm helper trong Context để lưu trạng thái đăng nhập
            setTokenAndUser(data.token, data); 
            
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || "Mã OTP không đúng hoặc đã hết hạn.");
        }
    };

    if (!email) {
        return <div className="text-center p-10">Lỗi: Không tìm thấy email cần xác thực.</div>;
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-xl">
                <h2 className="text-2xl font-bold text-center mb-4 text-indigo-600">Xác thực Email</h2>
                <p className="text-center text-gray-600 mb-6">
                    Chúng tôi đã gửi mã OTP 6 số đến <strong>{email}</strong>.
                </p>
                <form onSubmit={handleVerify} className="space-y-4">
                    <input
                        type="text"
                        maxLength="6"
                        placeholder="Nhập mã OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full px-4 py-3 border rounded-md text-center text-2xl tracking-widest focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                        type="submit"
                        className="w-full py-3 bg-indigo-600 text-white font-bold rounded-md hover:bg-indigo-700"
                    >
                        Xác nhận
                    </button>
                </form>
            </div>
        </div>
    );
}