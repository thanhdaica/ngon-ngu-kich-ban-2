import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault(); 
    if (password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      // Gọi API đăng ký
      await register(name, email, password); 

      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      
      // CHUYỂN HƯỚNG VỀ TRANG LOGIN
      navigate('/login');

    } catch (error) {
      toast.error(error.response?.data?.message || 'Đã xảy ra lỗi không xác định');
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
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
            </div>

            <div className="space-y-4 pt-4">
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