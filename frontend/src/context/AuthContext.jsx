// File: src/context/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
// Thêm toast để dùng được trong hàm logout
import { toast } from 'sonner';

// 1. Tạo Context
const AuthContext = createContext();

// Hàm lấy token từ localStorage (Giữ nguyên)
const getToken = () => localStorage.getItem('token');
const getAuthConfig = () => {
     const token = getToken();
     if (!token) return null;
     return { headers: { 'Authorization': `Bearer ${token}` } };
};


// 2. Tạo "Nhà cung cấp"
export function AuthProvider({ children }) {
     const [user, setUser] = useState(null);
     const [token, setToken] = useState(getToken());
     const [loading, setLoading] = useState(true);
     // HÀM MỚI: Helper để set token từ bên ngoài (dùng cho trang VerifyOtpPage)
     const setTokenAndUser = (token, userData) => {
        localStorage.setItem('token', token);
        setToken(token);
        setUser(userData);
     };

  // --- HÀM LOGIC (KHAI BÁO TRƯỚC RETURN) ---

  // SỬA HÀM REGISTER: Không lưu token ngay, chỉ trả về kết quả
    const register = async (name, email, password) => {
        const response = await axios.post('/api/user/register', {
            name, email, password,
        });
        // API bây giờ trả về { message, email } chứ không phải token
        return response.data; 
    };
  
  // Hàm ĐĂNG NHẬP (login)
  const login = async (email, password) => {
    const response = await axios.post('/api/user/login', {
        email, password,
    });
    
    // Cập nhật trạng thái
    localStorage.setItem('token', response.data.token);
    setToken(response.data.token);
    setUser({ 
        _id: response.data._id, 
        name: response.data.name, 
        email: response.data.email, 
        isAdmin: response.data.isAdmin,
    });
    
    return response.data; // Trả về data cho LoginPage
  };

  // Hàm ĐĂNG XUẤT (logout)
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.info("Đã đăng xuất.");
  };

  // 3. Tự động kiểm tra đăng nhập khi tải trang
     useEffect(() => {
         const fetchUserProfile = async () => {
            const config = getAuthConfig();
            if (config) {
              try {
                   const response = await axios.get('/api/user/profile', config);
                   setUser(response.data);
              } catch (error) {
                   localStorage.removeItem('token');
                   setToken(null);
                   console.error("Token không hợp lệ, đã đăng xuất.");
              }
            }
            setLoading(false);
         };
         fetchUserProfile();
     }, [token]); // Chạy lại khi 'token' thay đổi


     return (
    // 4. Cung cấp tất cả các hàm và state
         <AuthContext.Provider value={{ user, token, login, logout, register, loading, setTokenAndUser }}>
            {children}
         </AuthContext.Provider>
     );
}

// 7. Hook (giữ nguyên)
export const useAuth = () => {
     return useContext(AuthContext);
};