// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const AuthContext = createContext();

const getToken = () => localStorage.getItem('token');

const getAuthConfig = () => {
     const token = getToken();
     if (!token) return null;
     return { headers: { 'Authorization': `Bearer ${token}` } };
};

export function AuthProvider({ children }) {
     const [user, setUser] = useState(null);
     const [token, setToken] = useState(getToken());
     const [loading, setLoading] = useState(true);

     // --- HÀM QUAN TRỌNG: Dùng cho trang VerifyOtpPage ---
     // Giúp cập nhật trạng thái đăng nhập từ bên ngoài mà không cần gọi API login
     const setTokenAndUser = (newToken, userData) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
     };

    // 1. Đăng ký
    const register = async (name, email, password, captchaToken, honeypot) => {
        // Gửi cả honeypot để backend check (nếu cần) hoặc check ngay tại đây
        const response = await axios.post('/api/user/register', {
            name, 
            email, 
            password,
            captchaToken,
            honeypot
        });
        return response.data; 
    };
  
    // 2. Đăng nhập
    const login = async (email, password) => {
        const response = await axios.post('/api/user/login', {
            email, password,
        });
        
        // Lưu token vào storage và state
        setTokenAndUser(response.data.token, {
            _id: response.data._id, 
            name: response.data.name, 
            email: response.data.email, 
            isAdmin: response.data.isAdmin,
        });
        
        return response.data;
    };

    // 3. Đăng xuất
    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        toast.info("Đã đăng xuất.");
    };

    // Tự động lấy profile khi reload trang
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
              }
            }
            setLoading(false);
         };
         fetchUserProfile();
     }, [token]); 

     return (
         <AuthContext.Provider value={{ user, token, login, logout, register, loading, setTokenAndUser }}>
            {children}
         </AuthContext.Provider>
     );
}

export const useAuth = () => {
     return useContext(AuthContext);
};