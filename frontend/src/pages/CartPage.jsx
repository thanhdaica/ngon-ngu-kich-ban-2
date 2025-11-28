import React, { useState } from 'react';
import { useCart } from '../context/CartContext'; 
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Minus, Plus, Trash2 } from 'lucide-react'; // Import thêm Icon

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, loading } = useCart(); // Lấy updateQuantity
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedItems, setSelectedItems] = useState([]);

  if (loading) {
    return <div className="container mx-auto p-8 text-center">Đang tải giỏ hàng...</div>;
  }

  const handleCheckboxChange = (productId) => {
    if (selectedItems.includes(productId)) {
      setSelectedItems(selectedItems.filter(id => id !== productId));
    } else {
      setSelectedItems([...selectedItems, productId]);
    }
  };

  const handleSelectAll = () => {
    if (!cart?.items) return;
    if (selectedItems.length === cart.items.length) {
      setSelectedItems([]); 
    } else {
      setSelectedItems(cart.items.map(item => item.product._id)); 
    }
  };

  const selectedTotal = cart?.items?.reduce((sum, item) => {
      if (selectedItems.includes(item.product._id)) {
          return sum + (item.product.price * item.quantity);
      }
      return sum;
  }, 0) || 0;

  const handleCheckoutRedirect = () => {
      if (!user) {
          toast.error("Vui lòng đăng nhập để thanh toán!");
          return;
      }
      if (selectedItems.length === 0) {
          toast.error("Bạn chưa chọn sản phẩm nào để thanh toán!");
          return;
      }
      navigate('/checkout', { state: { selectedItems } });
  };

  if (!cart?.items?.length) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Giỏ hàng của bạn</h1>
        <div className="bg-white shadow-lg rounded-xl p-16 text-center"> 
            <span className="inline-block p-4 rounded-full bg-orange-100 text-orange-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </span>
          <p className="text-xl text-gray-700 mb-6">Giỏ hàng của bạn đang trống</p>
          <Link to="/" className="bg-orange-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-orange-700 transition-colors inline-block">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Giỏ hàng</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* DANH SÁCH SẢN PHẨM */}
        <div className="md:col-span-2 space-y-4">
           <div className="flex items-center p-4 bg-white shadow rounded-lg">
              <input 
                type="checkbox" 
                className="w-5 h-5 mr-4 cursor-pointer accent-red-600"
                checked={cart.items.length > 0 && selectedItems.length === cart.items.length}
                onChange={handleSelectAll}
              />
              <span className="font-semibold">Chọn tất cả ({cart.items.length} sản phẩm)</span>
          </div>

          {cart.items.map((item) => (
            <div key={item.product._id} className="flex items-center bg-white shadow rounded-lg p-4 transition hover:shadow-md">
               <input 
                type="checkbox" 
                className="w-5 h-5 mr-4 cursor-pointer accent-red-600"
                checked={selectedItems.includes(item.product._id)}
                onChange={() => handleCheckboxChange(item.product._id)}
              />

              <img src={item.product.coverUrl} alt={item.product.name} className="w-20 h-28 object-cover rounded border" />
              
              <div className="flex-1 ml-4">
                <h2 className="text-lg font-semibold text-gray-800">{item.product.name}</h2>
                <p className="text-sm text-gray-500 mt-1">Đơn giá: {item.product.price.toLocaleString('vi-VN')}đ</p>
                
                {/* --- NÚT TĂNG GIẢM SỐ LƯỢNG (MỚI) --- */}
                <div className="flex items-center mt-3">
                    <button 
                        onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                        className="p-1 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition"
                        disabled={item.quantity <= 1}
                    >
                        <Minus className="w-4 h-4" />
                    </button>
                    <span className="mx-3 font-medium w-8 text-center">{item.quantity}</span>
                    <button 
                        onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                        className="p-1 rounded-md bg-gray-100 hover:bg-gray-200 transition"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                <p className="text-lg font-bold text-red-600 mt-2">
                  {(item.product.price * item.quantity).toLocaleString('vi-VN')}đ
                </p>
              </div>
              
              <button 
                onClick={() => removeFromCart(item.product._id)} 
                className="text-gray-400 hover:text-red-600 font-semibold p-2 transition"
                title="Xóa sản phẩm"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        {/* CỘT TỔNG KẾT */}
        <div className="md:col-span-1">
          <div className="bg-white shadow rounded-lg p-6 sticky top-24 border border-gray-100">
            <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2">Thanh toán</h2>
            <div className="flex justify-between mb-3 text-gray-600">
                <span>Đã chọn:</span>
                <span className="font-medium text-gray-900">{selectedItems.length} sản phẩm</span>
            </div>
            <div className="flex justify-between mb-6">
                <span>Tạm tính:</span>
                <span className="font-bold text-gray-900">{selectedTotal.toLocaleString('vi-VN')}đ</span>
            </div>
            
            <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold">Tổng cộng:</span>
                    <span className="text-2xl font-extrabold text-red-600">{selectedTotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <p className="text-xs text-gray-500 mb-4 text-right">(Chưa bao gồm phí vận chuyển)</p>
                
                <button 
                onClick={handleCheckoutRedirect}
                className={`w-full py-3 px-6 rounded-lg font-bold text-white transition-all ${
                    selectedItems.length > 0 
                    ? 'bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5' 
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
                disabled={selectedItems.length === 0}
                >
                Mua Hàng ({selectedItems.length})
                </button>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}