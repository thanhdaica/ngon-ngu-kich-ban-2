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
    
    // Lấy hàm helper từ Context để đăng nhập user sau khi verify thành công
    const { setTokenAndUser } = useAuth();

    // Lấy email từ trang Register chuyển sang (nếu có)
    const [email, setEmail] = useState(location.state?.email || '');

    // Nếu F5 lại trang mà mất email thì nhắc user nhập lại
    useEffect(() => {
        if (!location.state?.email) {
            toast.info("Vui lòng nhập lại email để xác thực.");
        }
    }, [location.state]);

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!otp || !email) return toast.error("Vui lòng nhập đầy đủ Email và mã OTP");

        try {
            // Gọi API xác thực xuống Backend
            const response = await axios.post('/api/user/verify', { email, otp });
            
            const data = response.data; // { token, name, email, isAdmin, message }
            
            toast.success("Xác thực thành công! Đang đăng nhập...");
            
            // --- QUAN TRỌNG: Đăng nhập luôn cho user ---
            setTokenAndUser(data.token, data); 
            
            // Đợi 1.5s rồi chuyển về trang chủ
            setTimeout(() => {
                navigate('/');
            }, 1500);
            
        } catch (error) {
            toast.error(error.response?.data?.message || "Mã OTP không đúng hoặc đã hết hạn.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg border border-gray-200">
                <h2 className="text-2xl font-bold text-center mb-2 text-indigo-700">Xác Thực OTP</h2>
                <p className="text-center text-gray-500 mb-6 text-sm">
                    Mã xác thực 6 số (ngẫu nhiên) đã được gửi đến email:<br/>
                    <span className="font-semibold text-gray-800">{email || "..."}</span>
                </p>
                
                <form onSubmit={handleVerify} className="space-y-5">
                    {/* Input Email (Cho phép sửa nếu lỡ nhập sai ở bước trước) */}
                    <div>
                        <input
                            type="email"
                            placeholder="Email xác thực"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border rounded-md bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
                        />
                    </div>

                    {/* Input OTP */}
                    <div>
                        <input
                            type="text"
                            maxLength="6"
                            placeholder="Nhập mã 6 số (VD: 839201)"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full px-4 py-3 border rounded-md text-center text-3xl tracking-[0.5em] font-mono focus:ring-2 focus:ring-indigo-500 text-gray-700"
                            autoFocus
                        />
                    </div>
                    
                    <button
                        type="submit"
                        className="w-full py-3 bg-indigo-600 text-white font-bold rounded-md hover:bg-indigo-700 transition shadow-md"
                    >
                        XÁC NHẬN MÃ
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button 
                        onClick={() => navigate('/register')} 
                        className="text-sm text-gray-500 hover:text-indigo-600 underline"
                    >
                        Nhập sai email? Quay lại đăng ký.
                    </button>
                </div>
            </div>
        </div>
    );
}