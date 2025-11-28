import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import ReCAPTCHA from "react-google-recaptcha";

export default function RegisterPage() {
  // State cho form đăng ký
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // --- NOTE 1: THÊM STATE CHO HONEYPOT (BẪY BOT) ---
  const [honeypot, setHoneypot] = useState('');

  // State lưu token captcha
  const [captchaToken, setCaptchaToken] = useState(null);

  const navigate = useNavigate();
  const { register } = useAuth();

  // Logic xử lý đăng ký
  const handleRegister = async (e) => {
    e.preventDefault(); 

    // --- NOTE 2: CHECK HONEYPOT TRƯỚC TIÊN ---
    // Nếu ô ẩn này có dữ liệu -> Chắc chắn là Bot -> Chặn luôn tại Frontend (hoặc gửi về để backend chặn)
    if (honeypot) {
        console.warn("Bot detected via Honeypot!");
        return; // Dừng luôn, không làm gì cả
    }
    
    // --- NOTE 3: NÂNG CẤP CHECK MẬT KHẨU MẠNH (STRONG PASSWORD) ---
    // Quy tắc: Ít nhất 8 ký tự, 1 chữ hoa, 1 thường, 1 số, 1 ký tự đặc biệt
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!strongPasswordRegex.test(password)) {
      toast.error('Mật khẩu yếu! Cần ít nhất 8 ký tự, bao gồm chữ hoa, thường, số và ký tự đặc biệt (@$!%*?&)');
      return;
    }

    // Kiểm tra xem người dùng đã check Captcha chưa
    if (!captchaToken) {
        toast.error("Vui lòng xác nhận bạn không phải là người máy!");
        return;
    }

    try {
      // Gọi API đăng ký (Truyền thêm honeypot để backend log lại nếu cần)
      await register(name, email, password, captchaToken, honeypot); 

      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate('/login');

    } catch (error) {
      toast.error(error.response?.data?.message || 'Đã xảy ra lỗi không xác định');
      setCaptchaToken(null); // Reset captcha
    }
  };

  const handleSkip = () => {
    navigate('/'); 
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
        
        <div className="flex border-b">
          <Link to="/login" className="w-1/2 text-center py-4 bg-gray-50 hover:bg-gray-100">
            <span className="text-lg font-semibold text-gray-500">
              Đăng nhập
            </span>
          </Link>
          <div className="w-1/2 text-center py-4">
            <span className="text-lg font-semibold text-red-600 border-b-2 border-red-600 pb-1">
              Đăng ký
            </span>
          </div>
        </div>

        <div className="p-8">
          <form className="space-y-6" onSubmit={handleRegister}>
            
            {/* --- NOTE 4: Ô INPUT HONEYPOT (ẨN ĐI) --- */}
            {/* Bot sẽ tự động điền vào đây, người thường sẽ không thấy */}
            <div className="opacity-0 absolute top-0 left-0 h-0 w-0 overflow-hidden">
                <input
                    type="text"
                    name="website_hp"
                    id="website_hp"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    tabIndex="-1"
                    autoComplete="off"
                />
            </div>

            {/* Input Tên */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên của bạn
              </label>
              <input
                type="text"
                placeholder="Nhập họ và tên"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

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
                  placeholder="Nhập mật khẩu (8+ ký tự, hoa, thường, số, ký tự đặc biệt)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-4 flex items-center text-sm font-semibold text-indigo-600"
                >
                  {showPassword ? 'Ẩn' : 'Hiện'}
                </button>
              </div>
              {/* Gợi ý mật khẩu mạnh */}
              <p className="text-xs text-gray-500 mt-1">
                Mật khẩu cần: 1 Chữ hoa, 1 thường, 1 số, 1 ký tự đặc biệt.
              </p>
            </div>

            {/* Hiển thị Captcha */}
            <div className="flex justify-center my-4">
                <ReCAPTCHA
                    sitekey="6LfzExssAAAAABM6y5HPfVIO0u3sqDZc8BzG8mUM" 
                    onChange={(token) => setCaptchaToken(token)}
                />
            </div>

            {/* Các nút bấm */}
            <div className="space-y-4 pt-2">
              <button
                type="submit"
                className="w-full px-4 py-3 font-bold text-white bg-gray-300 rounded-md hover:bg-gray-400"
              >
                Đăng ký
              </button>

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