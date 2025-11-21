import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import axios from 'axios';

// 1. Import component ProductCard mới
import ProductCard from './ProductCard'; // <-- Điều chỉnh đường dẫn nếu cần

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // (Toàn bộ logic fetch API... giữ nguyên y hệt)
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/book');
        const data = response.data; 
        
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          toast.error("Định dạng dữ liệu sản phẩm không đúng.");
        }
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
        toast.error(`Lỗi khi tải sản phẩm: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // (Phần code loading và không có sản phẩm... giữ nguyên)
  if (loading) {
    return <div className="text-center p-10">Đang tải sản phẩm...</div>;
  }
  if (products.length === 0) {
    return <div className="text-center p-10">Không tìm thấy sản phẩm nào.</div>;
  }

  // 2. Giao diện grid giờ đã gọn gàng hơn
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        
        {/* 3. Lặp và gọi ProductCard, truyền "product" vào */}
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))} 

      </div>
    </div>
  );
}