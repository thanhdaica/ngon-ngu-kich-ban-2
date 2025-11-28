import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userData = await login(email, password); 
      
      toast.success('Đăng nhập thành công!');
      
      if (userData && userData.isAdmin) {
          navigate('/admin/dashboard'); 
      } else {
          navigate('/'); 
      }
      
    } catch (error){
      const responseData = error.response?.data;
      toast.error(responseData?.message || 'Email hoặc mật khẩu sai');
    }
  };

  const handleSkip = () => {
    navigate('/'); 
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="flex border-b">
          <div className="w-1/2 text-center py-4">
            <span className="text-lg font-semibold text-red-600 border-b-2 border-red-600 pb-1">
              Đăng nhập
            </span>
          </div>
          <Link to="/register" className="w-1/2 text-center py-4 bg-gray-50 hover:bg-gray-100">
            <span className="text-lg font-semibold text-gray-500">
              Đăng ký
            </span>
          </Link>
        </div>

        <div className="p-8">
          <form className="space-y-6" onSubmit={handleLogin}>
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
                  placeholder="Nhập mật khẩu"
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

            <div className="text-right">
              <Link to="/forgot-password" className="text-sm font-medium text-indigo-600 hover:underline">
                Quên mật khẩu?
              </Link>
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                className="w-full px-4 py-3 font-bold text-white bg-gray-300 rounded-md hover:bg-gray-400"
              >
                Đăng nhập
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