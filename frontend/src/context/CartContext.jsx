// src/context/CartContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  return {
    headers: { 'Authorization': `Bearer ${token}` }
  };
};

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null); 
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // 1. Tự động lấy giỏ hàng
  useEffect(() => {
    const fetchCart = async () => {
      const config = getAuthConfig();
      if (!config) { 
        setLoading(false);
        return; 
      }
      try {
        const response = await axios.get('/api/cart', config);
        setCart(response.data);
      } catch (error) {
        console.error("Lỗi tải giỏ hàng:", error.response?.data?.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  // 2. Hàm THÊM vào giỏ
  const addToCart = async (productId, quantity) => {
    const config = getAuthConfig();
    if (!config) {
      toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng!");
      return; 
    }
    try {
      const response = await axios.post('/api/cart', 
        { productId, quantity }, 
        config
      );
      setCart(response.data); 
      toast.success("Đã thêm vào giỏ hàng!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi thêm vào giỏ");
    }
  };

  // 3. Hàm XÓA khỏi giỏ
  const removeFromCart = async (productId) => {
    const config = getAuthConfig();
    if (!config) return; 
    try {
      const response = await axios.delete(`/api/cart/${productId}`, config);
      setCart(response.data); 
      toast.success("Đã xóa khỏi giỏ hàng.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi xóa sản phẩm");
    }
  };

  // 4. Hàm THANH TOÁN (UPDATED)
  const handleCheckoutAPI = async (shippingAddress, paymentMethod, selectedItemIds) => {
    const config = getAuthConfig();

    if (!config || !user) {
        toast.error("Vui lòng đăng nhập để tiến hành thanh toán!");
        return false;
    }
    
    // Gửi kèm danh sách ID sản phẩm được chọn
    const checkoutData = { shippingAddress, paymentMethod, selectedItemIds };

    try {
        const response = await axios.post(
            '/api/order', 
            checkoutData, 
            config
        );
        
        // Cập nhật lại giỏ hàng (Lấy dữ liệu mới nhất từ server sau khi server đã xóa item mua)
        const newCartResponse = await axios.get('/api/cart', config);
        setCart(newCartResponse.data);
        
        if (paymentMethod === 'COD') {
            toast.success(`Đơn hàng #${response.data.data._id.substring(0, 8)} đã được tạo!`);
        }
        
        return response.data; 
    } catch (error) {
        console.error("Lỗi Thanh toán:", error);
        toast.error(error.response?.data?.message || "Lỗi khi tạo đơn hàng.");
        return false; 
    }
  };

  return (
    <CartContext.Provider value={{ cart, setCart, loading, addToCart, removeFromCart, handleCheckoutAPI }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  return useContext(CartContext);
};