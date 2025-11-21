// frontend/src/pages/admin/AdminBookList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

export default function AdminBookList() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth(); 

    // Hàm lấy tất cả sách (dùng API công khai, nhưng hiển thị thêm nút Admin)
    const fetchBooks = async () => {
        setLoading(true);
        try {
            // Dùng API công khai /api/book
            const response = await axios.get('/api/book');
            setBooks(response.data);
        } catch (error) {
            console.error("Lỗi tải sách:", error);
            toast.error("Không thể tải danh sách sách.");
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchBooks();
    }, []);

    // Hàm xóa sách (Chỉ Admin mới gọi được)
    const handleDelete = async (bookId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa cuốn sách này không?")) return;
        
        const config = {
            headers: { 'Authorization': `Bearer ${token}` }
        };

        try {
            await axios.delete(`/api/book/${bookId}`, config);
            toast.success("Xóa sách thành công!");
            fetchBooks(); // Tải lại danh sách
        } catch (error) {
            console.error("Lỗi xóa sách:", error);
            toast.error(error.response?.data?.message || "Lỗi: Bạn không có quyền xóa sách.");
        }
    };

    if (loading) {
        return <div className="text-center p-10">Đang tải danh sách sách...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Quản Lý Sách</h1>
                
                {/* Nút Thêm mới (Giả định link đến trang thêm sách) */}
                <Link 
                    to="/admin/books/add" 
                    className="flex items-center space-x-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                >
                    <PlusCircle className="w-5 h-5" />
                    <span>Thêm Sách Mới</span>
                </Link>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ảnh</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên sách</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tác giả</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá bán</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đã bán</th>
                            <th className="px-6 py-3">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {books.map((book) => (
                            <tr key={book._id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <img src={book.coverUrl || 'https://via.placeholder.com/50x70?text=No+Image'} alt={book.name} className="w-10 h-14 object-cover rounded"/>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{book.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.author}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">{book.price.toLocaleString('vi-VN')}đ</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.soldQuantity}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2">
                                    {/* Nút Sửa (Giả định link đến trang sửa sách) */}
                                    <Link to={`/admin/books/edit/${book._id}`} className="text-indigo-600 hover:text-indigo-900">
                                        <Edit className="w-5 h-5"/>
                                    </Link>
                                    {/* Nút Xóa */}
                                    <button onClick={() => handleDelete(book._id)} className="text-red-600 hover:text-red-900">
                                        <Trash2 className="w-5 h-5"/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}