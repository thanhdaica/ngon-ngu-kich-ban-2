
import React, { useState, useEffect } from 'react';
import { BsGridFill } from 'react-icons/bs';
import { toast } from 'sonner';
import axios from 'axios'; // <-- 1. Import axios
import { Link } from 'react-router-dom';

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // 2. Dùng axios.get
        const response = await axios.get('/api/category');
        
        // 3. Dữ liệu nằm ngay trong response.data
        const data = response.data; 
        
        if (Array.isArray(data)) {
          setCategories(data);
        } else {
          console.error("API trả về dữ liệu không phải mảng:", data);
          toast.error("Định dạng dữ liệu danh mục không đúng.");
        }
        
      } catch (error) {
        // 4. Axios tự động bắt lỗi 4xx, 5xx ở đây
        console.error("Lỗi khi tải danh mục:", error);
        
        // Bạn có thể xem chi tiết lỗi từ server (nếu có)
        if (error.response) {
          toast.error(`Lỗi server: ${error.response.data.message || error.status}`);
        } else {
          toast.error(`Lỗi khi tải danh mục: ${error.message}`);
        }
        
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Hiển thị loading (Bạn có thể làm mượt hơn)
  if (loading) {
    return <div className="py-8 text-center">Đang tải danh mục...</div>;
  }
  
  // Hiển thị khi có dữ liệu
  return (
    <div className="bg-white rounded-lg shadow-sm border border-border mt-6">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Tiêu đề */}
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-x-3">
          <BsGridFill className="text-red-600" />
          Danh mục sản phẩm
        </h2>

        {/* Container cho danh sách 
          - `flex`: Sắp xếp các item theo hàng ngang
          - `overflow-x-auto`: Thêm thanh cuộn ngang nếu bị tràn
          - `gap-6`: Khoảng cách giữa các item
        */}
        <div className="mt-6 flex gap-6 overflow-x-auto pb-4">

          {categories.map((category) => (
            <Link 
              key={category._id} 
              to={`/category/${category._id}`} // Link tới trang danh mục
              className="flex flex-col items-center shrink-0 w-28 group"
            >
              {/* - `flex-shrink-0`: Ngăn item bị co lại
                - `w-28`: Cố định chiều rộng (giống trong ảnh của bạn)
                - `group`: Để tạo hiệu ứng hover
              */}
              
              {/* Hình ảnh danh mục */}
              <div className="w-24 h-24 overflow-hidden rounded-full border border-gray-200">
                <img
                  src={category.coverUrl} 
                  alt={category.name}
                  className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              
              {/* Tên danh mục */}
              <p className="mt-2 text-sm font-medium text-gray-700 text-center group-hover:text-indigo-600">
                {category.name} {/* <-- Thay bằng trường tên của bạn */}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}