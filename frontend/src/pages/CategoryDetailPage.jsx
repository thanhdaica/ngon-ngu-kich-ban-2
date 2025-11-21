// src/pages/CategoryDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

// Import các component chung
import ProductCard from '../components/Product/ProductCard';

export default function CategoryDetailPage() {
  // 1. Lấy ID thể loại từ thanh URL
  const { id } = useParams(); 
  
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState(''); // Tên thể loại
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 2. Chạy hàm này mỗi khi 'id' trên URL thay đổi
    const fetchProductsByCategory = async () => {
      if (!id) return; // Không làm gì nếu không có ID
      
      setLoading(true);
      try {
        // 3. Gọi API backend bạn vừa tạo
        const response = await axios.get(`/api/book/category/${id}`);
        
        // 4. Lưu dữ liệu vào state
        if (response.data) {
          setProducts(response.data.products || []);
          setCategoryName(response.data.categoryName || 'Thể loại');
        }

      } catch (error) {
        console.error("Lỗi khi tải sản phẩm theo thể loại:", error);
        toast.error("Không thể tải sản phẩm.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductsByCategory();
  }, [id]); 

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        
        <main className="container mx-auto px-4 py-8 grow text-center">
          Đang tải...
        </main>
       
      </div>
    );
  }

  // 5. Render giao diện
  return (
    <div className="flex flex-col min-h-screen ">
      
      <main className="container mx-auto px-4 py-8 grow">
        
        <h1 className="text-3xl font-bold mb-6">
          Thể loại: {categoryName}
        </h1>

        {/* Hiển thị danh sách sản phẩm */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <p>Không tìm thấy sản phẩm nào thuộc thể loại này.</p>
        )}

      </main>
     
    </div>
  );
}