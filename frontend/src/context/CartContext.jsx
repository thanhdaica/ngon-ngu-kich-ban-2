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

  // 3. Hàm UPDATE số lượng (MỚI)
  const updateQuantity = async (productId, newQuantity) => {
      const config = getAuthConfig();
      if (!config) return;
      
      if (newQuantity < 1) return; // Không cho giảm dưới 1

      try {
          // Gọi API PUT để cập nhật số lượng mới
          const response = await axios.put('/api/cart', { productId, quantity: newQuantity }, config);
          setCart(response.data);
      } catch (error) {
          console.error("Lỗi cập nhật số lượng:", error);
          toast.error("Không thể cập nhật số lượng.");
      }
  };

  // 4. Hàm XÓA khỏi giỏ
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

  // 5. Hàm THANH TOÁN
  const handleCheckoutAPI = async (shippingAddress, paymentMethod, selectedItemIds) => {
    const config = getAuthConfig();

    if (!config || !user) {
        toast.error("Vui lòng đăng nhập để tiến hành thanh toán!");
        return false;
    }
    
    const checkoutData = { shippingAddress, paymentMethod, selectedItemIds };

    try {
        const response = await axios.post('/api/order', checkoutData, config);
        
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
    <CartContext.Provider value={{ cart, setCart, loading, addToCart, updateQuantity, removeFromCart, handleCheckoutAPI }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  return useContext(CartContext);
};