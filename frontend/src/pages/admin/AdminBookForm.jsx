// frontend/src/pages/admin/AdminBookForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export default function AdminBookForm() {
    const { id } = useParams(); // Lấy ID sách (nếu đang ở chế độ Sửa)
    const navigate = useNavigate();
    const { token } = useAuth();
    
    const isEditMode = !!id; // Biến cờ: true nếu có ID
    
    // State cho Form
    const [formData, setFormData] = useState({
        name: '',
        author: '',
        price: 0,
        originalPrice: 0,
        description: '',
        coverUrl: '',
        // categories: [], // Tạm bỏ qua phần Categories phức tạp
    });
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEditMode);

    // 1. Logic tải dữ liệu sách (Chỉ chạy ở chế độ Sửa)
    useEffect(() => {
        if (!isEditMode) return;
        
        const fetchBookData = async () => {
            try {
                // API công khai: GET /api/book/:id
                const response = await axios.get(`/api/book/${id}`);
                const bookData = response.data;
                setFormData({
                    name: bookData.name || '',
                    author: bookData.author || '',
                    price: bookData.price || 0,
                    originalPrice: bookData.originalPrice || 0,
                    description: bookData.description || '',
                    coverUrl: bookData.coverUrl || '',
                });
            } catch (error) {
                toast.error("Lỗi tải dữ liệu sách cũ.");
                console.error(error);
            } finally {
                setInitialLoading(false);
            }
        };

        fetchBookData();
    }, [id, isEditMode]);

    // 2. Xử lý thay đổi input
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    // 3. Xử lý Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        const config = {
            headers: { 'Authorization': `Bearer ${token}` }
        };

        const method = isEditMode ? 'put' : 'post';
        const url = isEditMode 
            ? `/api/book/${id}` 
            : '/api/book';

        try {
            await axios[method](url, formData, config);
            
            toast.success(isEditMode 
                ? "Cập nhật sách thành công!" 
                : "Thêm sách mới thành công!");
            
            navigate('/admin/books'); // Quay về trang danh sách
        } catch (error) {
            console.error("Lỗi khi lưu sách:", error);
            toast.error(error.response?.data?.message || `Lỗi: ${isEditMode ? 'Cập nhật' : 'Thêm mới'} sách thất bại.`);
        } finally {
            setLoading(false);
        }
    };
    
    // --- Render ---

    if (initialLoading) {
        return <div className="text-center p-10">Đang tải dữ liệu sách...</div>;
    }

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">
                {isEditMode ? 'Sửa Thông Tin Sách' : 'Thêm Sách Mới'}
            </h1>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
                
                {/* Tên sách */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Tên sách</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required
                        className="mt-1 w-full p-2 border rounded-md" />
                </div>
                
                {/* Tác giả */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Tác giả</label>
                    <input type="text" name="author" value={formData.author} onChange={handleChange} required
                        className="mt-1 w-full p-2 border rounded-md" />
                </div>
                
                {/* Giá bán và Giá gốc */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Giá bán (VNĐ)</label>
                        <input type="number" name="price" value={formData.price} onChange={handleChange} required
                            className="mt-1 w-full p-2 border rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Giá gốc (VNĐ)</label>
                        <input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange}
                            className="mt-1 w-full p-2 border rounded-md" />
                    </div>
                </div>

                {/* URL Ảnh bìa */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">URL Ảnh bìa (coverUrl)</label>
                    <input type="text" name="coverUrl" value={formData.coverUrl} onChange={handleChange}
                        className="mt-1 w-full p-2 border rounded-md" />
                    {formData.coverUrl && (
                        <img src={formData.coverUrl} alt="Ảnh bìa xem trước" className="mt-3 w-32 h-48 object-cover rounded shadow"/>
                    )}
                </div>
                
                {/* Mô tả */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows="5"
                        className="mt-1 w-full p-2 border rounded-md"></textarea>
                </div>
                
                {/* Nút Submit */}
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                    {loading ? 'Đang xử lý...' : (isEditMode ? 'Cập Nhật Sách' : 'Thêm Sách')}
                </button>
            </form>
        </div>
    );
}