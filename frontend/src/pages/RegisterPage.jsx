// frontend/src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import ReCAPTCHA from "react-google-recaptcha";

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Honeypot (Bẫy bot)
  const [honeypot, setHoneypot] = useState('');
  
  // Captcha
  const [captchaToken, setCaptchaToken] = useState(null);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { register } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault(); 

    // 1. Check Honeypot
    if (honeypot) {
        console.warn("Bot detected!");
        return; 
    }
    
    // 2. Check Password mạnh
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPasswordRegex.test(password)) {
      toast.error('Mật khẩu cần: 8+ ký tự, 1 Hoa, 1 thường, 1 số và 1 ký tự đặc biệt (@$!%*?&)');
      return;
    }

    // 3. Check Captcha
    if (!captchaToken) {
        toast.error("Vui lòng xác nhận bạn không phải là người máy!");
        return;
    }

    setIsLoading(true);

    try {
      // Gọi API đăng ký
      await register(name, email, password, captchaToken, honeypot); 

      toast.success("Đã gửi mã OTP về Email! Vui lòng kiểm tra.");
      
      // --- CHUYỂN HƯỚNG SANG TRANG NHẬP OTP ---
      // Truyền email qua state để user đỡ phải nhập lại
      navigate('/verify-otp', { state: { email: email } }); 

    } catch (error) {
      toast.error(error.response?.data?.message || 'Đăng ký thất bại');
      setCaptchaToken(null); // Reset captcha để user nhập lại
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden p-8">
        
        <h2 className="text-2xl font-bold text-center text-red-600 mb-6">Đăng Ký Tài Khoản</h2>

        <form className="space-y-4" onSubmit={handleRegister}>
            {/* Input Honeypot ẩn */}
            <div className="hidden">
                <input type="text" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Tên hiển thị</label>
              <input
                type="text" placeholder="Nhập tên của bạn" value={name} onChange={(e) => setName(e.target.value)} required
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} placeholder="Nhập mật khẩu mạnh" value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-3 text-sm font-semibold text-indigo-600">
                  {showPassword ? 'Ẩn' : 'Hiện'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Gợi ý: Abc@12345</p>
            </div>

            <div className="flex justify-center my-2">
                <ReCAPTCHA
                    sitekey="6LfzExssAAAAABM6y5HPfVIO0u3sqDZc8BzG8mUM" 
                    onChange={setCaptchaToken}
                />
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-3 font-bold text-white bg-red-600 rounded-md hover:bg-red-700 transition disabled:opacity-50"
            >
                {isLoading ? 'Đang xử lý...' : 'Đăng Ký & Nhận OTP'}
            </button>
        </form>

        <div className="text-center mt-4">
            <Link to="/login" className="text-indigo-600 hover:underline">Đã có tài khoản? Đăng nhập ngay</Link>
        </div>
      </div>
    </div>
  );
}