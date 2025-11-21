// File: src/pages/ProductDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Hook để lấy :id
import axios from 'axios';
import { toast } from 'sonner';
import { useCart } from '../context/CartContext'; // <-- 1. Import "Bộ não" giỏ hàng

// 2. Đổi tên component
export default function ProductDetailPage() {
  const [book, setBook] = useState(null); // State để lưu 1 cuốn sách
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1); // State cho số lượng
  const { id } = useParams(); // Lấy "id" từ URL (ví dụ: /book/12345)
  const navigate = useNavigate();

  // 3. Lấy hàm addToCart từ "Bộ não"
  const { addToCart } = useCart();

  // 4. Logic Fetch dữ liệu sách (Giữ nguyên)
  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!id) return; 
      setLoading(true);
      try {
        // API backend: GET /api/books/:id
        const response = await axios.get(`/api/book/${id}`);
        setBook(response.data);
      } catch (error) {
        console.error("Lỗi khi tải chi tiết sách:", error);
        toast.error("Không thể tải thông tin sách.");
      } finally {
        setLoading(false);
      }
    };
    fetchBookDetails();
  }, [id]);

  // 5. Logic Nút "Thêm vào giỏ" (Đã tối giản)
  const handleAddToCart = () => {
    // Chỉ cần gọi hàm từ Context, không cần logic token ở đây
    addToCart(book._id, quantity); 
  };

  // 6. Logic Nút "Mua ngay"
  const handleBuyNow = () => {
    toast.info("Chức năng 'Mua ngay' đang được phát triển!");
    // (Tạm thời: Thêm vào giỏ rồi chuyển trang)
    // addToCart(book._id, quantity);
    // navigate('/checkout');
  };

  // 7. Tính toán giá
  const price = book?.price || 0;
  const originalPrice = book?.originalPrice || 0;
  const discountPercent = (originalPrice > price)
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  // --- Giao diện (Render) ---

  if (loading) {
    return <div className="container mx-auto p-8 text-center">Đang tải...</div>;
  }
  if (!book) {
    return <div className="container mx-auto p-8 text-center">Không tìm thấy sách.</div>;
  }

  return (
    // (MainLayout đã lo Header/Footer)
    <div className="container mx-auto p-4 md:p-8">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* CỘT TRÁI: ẢNH SÁCH */}
          <div className="p-4">
            <img 
              src={book.coverUrl || 'https://via.placeholder.com/400x600?text=No+Image'} 
              alt={book.name}
              className="w-full h-auto object-cover rounded-lg"
            />
          </div>

          {/* CỘT PHẢI: THÔNG TIN VÀ NÚT BẤM */}
          <div className="p-6 md:p-8 flex flex-col">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{book.name}</h1>
            <p className="text-lg text-gray-600 mb-4">Tác giả: {book.author}</p>
            
            {/* Giá */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex items-baseline gap-4 flex-wrap">
                <span className="text-4xl font-bold text-red-600">
                  {price.toLocaleString('vi-VN')}đ
                </span>
                {discountPercent > 0 && (
                  <span className="text-xl text-gray-500 line-through">
                    {originalPrice.toLocaleString('vi-VN')}đ
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="ml-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-md font-bold">
                    -{discountPercent}%
                  </span>
                )}
              </div>
            </div>
            
            {/* Số lượng */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Số lượng</label>
              <input 
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 px-3 py-2 border rounded-md"
              />
            </div>

            {/* Các nút bấm */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handleAddToCart}
                className="flex-1 py-3 px-6 bg-white border border-red-600 text-red-600 font-bold rounded-lg hover:bg-red-50 transition"
              >
                Thêm vào giỏ hàng
              </button>
              <button 
                onClick={handleBuyNow}
                className="flex-1 py-3 px-6 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition"
              >
                Mua ngay
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mô tả (Bên dưới) */}
      <div className="bg-white shadow-lg rounded-lg p-6 md:p-8 mt-8">
        <h2 className="text-2xl font-semibold mb-4">Mô tả sản phẩm</h2>
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
          {book.description || 'Sản phẩm này chưa có mô tả.'}
        </p>
      </div>
    </div>
  );
}