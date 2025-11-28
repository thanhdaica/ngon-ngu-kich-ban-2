import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
// (Bạn có thể import icon con mắt nếu muốn, ví dụ: FaEye, FaEyeSlash)
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State để Hiện/Ẩn mật khẩu
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // Logic xử lý đăng nhập (Giữ nguyên)
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // 1. GỌI HÀM LOGIN VÀ LẤY DATA VỀ
      const userData = await login(email, password); 
      
      toast.success('Đăng nhập thành công!');
      
      // 2. KIỂM TRA QUYỀN HẠN ĐỂ CHUYỂN HƯỚNG
      if (userData && userData.isAdmin) {
          navigate('/admin/dashboard'); // Chuyển đến trang Admin
      } else {
          navigate('/'); // Chuyển về trang chủ cho User thường
      }
      
    } catch (error){
      // --- LOGIC MỚI: BẮT LỖI CHƯA VERIFY ---
      const responseData = error.response?.data;
      
      if (error.response?.status === 401 && responseData?.needVerify) {
          toast.error("Tài khoản chưa xác thực. Đang chuyển đến trang nhập OTP...");
          // Chuyển hướng sang trang OTP kèm email
          setTimeout(() => {
              navigate('/verify-otp', { state: { email: responseData.email || email } });
          }, 1500);
          return;
      }
      // ---------------------------------------

      toast.error(responseData?.message || 'Email hoặc mật khẩu sai');
    }
};

  // Logic nút "Bỏ qua"
  const handleSkip = () => {
    navigate('/'); // Quay về trang chủ
  };

  // --- PHẦN GIAO DIỆN (JSX) ĐÃ THIẾT KẾ LẠI ---
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      
      {/* Hộp nội dung */}
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
        
        {/* 1. Phần Tabs (Đăng nhập / Đăng ký) */}
        <div className="flex border-b">
          {/* Tab "Đăng nhập" (Active) */}
          <div className="w-1/2 text-center py-4">
            <span className="text-lg font-semibold text-red-600 border-b-2 border-red-600 pb-1">
              Đăng nhập
            </span>
          </div>
          {/* Tab "Đăng ký" (Inactive - Dẫn đến trang Register) */}
          <Link to="/register" className="w-1/2 text-center py-4 bg-gray-50 hover:bg-gray-100">
            <span className="text-lg font-semibold text-gray-500">
              Đăng ký
            </span>
          </Link>
        </div>

        {/* 2. Phần Form */}
        <div className="p-8">
          <form className="space-y-6" onSubmit={handleLogin}>
            
            {/* Input Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại/Email
              </label>
              <input
                type="email"
                placeholder="Nhập số điện thoại hoặc email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Input Mật khẩu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {/* Nút Hiện/Ẩn Mật khẩu */}
                <button
                  type="button" // Quan trọng: type="button" để không submit form
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-4 flex items-center text-sm font-semibold text-indigo-600"
                >
                  {showPassword ? 'Ẩn' : 'Hiện'}
                </button>
              </div>
            </div>

            {/* Quên mật khẩu */}
            <div className="text-right">
              <Link to="/forgot-password" className="text-sm font-medium text-indigo-600 hover:underline">
                Quên mật khẩu?
              </Link>
            </div>

            {/* 3. Các nút bấm */}
            <div className="space-y-4">
              {/* Nút Đăng nhập (Chính) */}
              <button
                type="submit"
                className="w-full px-4 py-3 font-bold text-white bg-gray-300 rounded-md hover:bg-gray-400"
                // (Bạn có thể đổi màu: bg-red-600 hover:bg-red-700)
              >
                Đăng nhập
              </button>

              {/* Nút Bỏ qua (Phụ) */}
              <button
                type="button"
                onClick={handleSkip}
                className="w-full px-4 py-3 font-bold text-red-600 bg-white border border-red-600 rounded-md hover:bg-red-50"
              >
                Bỏ qua
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}