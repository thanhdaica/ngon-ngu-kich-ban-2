// Tạo file: src/context/CartContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom'; // <-- Cần import useNavigate (dù hơi khác quy tắc hook)
import { useAuth } from './AuthContext';
// Tạo Context
const CartContext = createContext();

// Hàm lấy token (dùng chung)
const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  return {
    headers: { 'Authorization': `Bearer ${token}` }
  };
};

// "Nhà cung cấp" (Provider)
export function CartProvider({ children }) {
  const [cart, setCart] = useState(null); // State chứa giỏ hàng { items: [...] }
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // 1. Tự động lấy giỏ hàng khi tải ứng dụng
  useEffect(() => {
    const fetchCart = async () => {
      const config = getAuthConfig();
      if (!config) { // Chưa đăng nhập
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
  }, []); // Chỉ chạy 1 lần

  // 2. Hàm THÊM vào giỏ (gọi từ ProductDetailPage)
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
      setCart(response.data); // Cập nhật state giỏ hàng
      toast.success("Đã thêm vào giỏ hàng!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi thêm vào giỏ");
    }
  };

  // 3. Hàm XÓA khỏi giỏ (gọi từ CartPage)
  const removeFromCart = async (productId) => {
    const config = getAuthConfig();
    if (!config) return; 
    try {
      const response = await axios.delete(`/api/cart/${productId}`, config);
      setCart(response.data); // Cập nhật state giỏ hàng
      toast.success("Đã xóa khỏi giỏ hàng.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi xóa sản phẩm");
    }
  };
// 4. hàm Tiến hành thanh toán 

// 5.Hàm xử lý gọi API (gọi từ CheckoutPage)
const handleCheckoutAPI = async (shippingAddress, paymentMethod) => {
    // Logic API đã được sửa trong bước trước (trong phần trả lời trước)
    // Tái tạo lại logic đó ở đây:
    const config = getAuthConfig();

    if (!config || !user) {
        toast.error("Vui lòng đăng nhập để tiến hành thanh toán!");
        return false;
    }
    
    const checkoutData = { shippingAddress, paymentMethod };

    try {
        const response = await axios.post(
            '/api/order', 
            checkoutData, 
            config
        );
        
        const createdOrder = response.data.data;
        setCart({ user: createdOrder.user, items: [] }); 
        
        if (paymentMethod === 'COD') {
            toast.success(`Đơn hàng #${createdOrder._id.substring(0, 8)} đã được tạo!`);
        }
        
        return response.data; // <== TRẢ VỀ TOÀN BỘ DATA ĐƠN HÀNG
    } catch (error) {
        console.error("Lỗi Thanh toán:", error);
        toast.error(error.response?.data?.message || "Lỗi khi tạo đơn hàng.");
        return false; // Báo hiệu thất bại
    }
};
  // 6. Cung cấp state và hàm
  return (
    <CartContext.Provider value={{ cart, setCart, loading, addToCart, removeFromCart,handleCheckoutAPI }}>
      {children}
    </CartContext.Provider>
  );
}

//  Hook (để dễ sử dụng)
export const useCart = () => {
  return useContext(CartContext);
};