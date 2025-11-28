// frontend/src/pages/VerifyOtpPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

export default function VerifyOtpPage() {
    const [otp, setOtp] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const { setTokenAndUser } = useAuth();

    // Lấy email từ state (nếu có), hoặc set rỗng để người dùng tự nhập
    const [email, setEmail] = useState(location.state?.email || '');

    // Nếu không có email khi load trang, thông báo nhẹ
    useEffect(() => {
        if (!location.state?.email) {
            toast.info("Vui lòng nhập lại email để xác thực.");
        }
    }, []);

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!otp || !email) return toast.error("Vui lòng nhập đầy đủ Email và mã OTP");

        try {
            const response = await axios.post('/api/user/verify', { email, otp });
            
            const data = response.data;
            toast.success("Xác thực thành công! Đang đăng nhập...");
            
            // Lưu token và chuyển hướng
            setTokenAndUser(data.token, data); 
            
            // Đợi xíu cho UX tốt hơn
            setTimeout(() => {
                navigate('/');
            }, 1000);
            
        } catch (error) {
            toast.error(error.response?.data?.message || "Mã OTP không đúng hoặc đã hết hạn.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-xl">
                <h2 className="text-2xl font-bold text-center mb-4 text-indigo-600">Xác thực Tài khoản</h2>
                <p className="text-center text-gray-600 mb-6 text-sm">
                    Vui lòng kiểm tra email (cả mục Spam) để lấy mã OTP 6 số.
                </p>
                <form onSubmit={handleVerify} className="space-y-4">
                    {/* Cho phép nhập lại Email nếu bị mất do refresh trang */}
                    <div>
                        <input
                            type="email"
                            placeholder="Email xác thực"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            // Nếu đã có email từ trang Register thì disable để đỡ sửa nhầm
                            disabled={!!location.state?.email} 
                            className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-indigo-500 ${location.state?.email ? 'bg-gray-100 text-gray-500' : ''}`}
                        />
                    </div>

                    <input
                        type="text"
                        maxLength="6"
                        placeholder="Nhập mã OTP (6 số)"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full px-4 py-3 border rounded-md text-center text-2xl tracking-widest focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                    
                    <button
                        type="submit"
                        className="w-full py-3 bg-indigo-600 text-white font-bold rounded-md hover:bg-indigo-700 transition"
                    >
                        Xác nhận
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <button 
                        onClick={() => navigate('/register')} 
                        className="text-sm text-gray-500 hover:text-indigo-600 underline"
                    >
                        Chưa nhận được mã? Đăng ký lại để lấy mã mới.
                    </button>
                </div>
            </div>
        </div>
    );
}