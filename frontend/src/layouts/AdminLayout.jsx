// frontend/src/layouts/AdminLayout.jsx
import React from 'react';
import { Outlet, Link, Navigate } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingCart, Book, LogOut, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCombinedLogout } from '../hooks/useCombinedLogout';
import { toast } from 'sonner';

// Component Sidebar (Tạo nhanh một menu)
const AdminSidebar = ({ user, combinedLogout }) => {
    
    // Menu Admin (giả định)
    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
        { name: 'Quản lý Đơn hàng', icon: ShoppingCart, path: '/admin/orders' },
        { name: 'Quản lý Sách', icon: Book, path: '/admin/books' },
        { name: 'Quản lý Người dùng', icon: Users, path: '/admin/users' },
    ];

    // CSS để tạo giao diện như hình của bạn (màu đen sidebar)
    return (
        <div className="w-64 min-h-screen bg-gray-900 text-white flex flex-col p-4 shadow-2xl">
            <h1 className="text-2xl font-bold text-red-500 mb-8">Admin Panel</h1>
            <nav className="flex-grow space-y-2">
                {navItems.map((item) => (
                    <Link
                        key={item.name}
                        to={item.path}
                        // Thêm logic active class tại đây
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        <item.icon className="w-5 h-5" />
                        <span>{item.name}</span>
                    </Link>
                ))}
            </nav>
            <div className="mt-auto pt-4 border-t border-gray-700">
                 <div className="text-sm mb-2">Xin chào, {user?.name.split(' ')[0]}</div>
                 {/* NÚT MỚI: VỀ TRANG CHỦ */}
                 <Link
                    to="/"
                    className="flex items-center space-x-3 p-3 w-full rounded-lg text-blue-300 hover:bg-gray-800 transition-colors"
                 >
                    <Home className="w-5 h-5" /> 
                    <span>Về Trang Chủ</span>
                 </Link>

                 {/* NÚT ĐĂNG XUẤT */}
                 <button
                    onClick={combinedLogout}
                    className="flex items-center space-x-3 p-3 w-full rounded-lg text-red-400 hover:bg-gray-800 transition-colors"
                 >
                    <LogOut className="w-5 h-5" />
                    <span>Đăng xuất</span>
                 </button>
            </div>
        </div>
    );
};

export default function AdminLayout() {
    const { user, loading } = useAuth();
    const combinedLogout = useCombinedLogout();

    if (loading) {
        return <div className="text-center p-10">Đang kiểm tra quyền...</div>;
    }

    // Nếu không có user hoặc không phải Admin, chuyển hướng về trang chủ/đăng nhập
    if (!user || !user.isAdmin) {
        toast.error("Bạn không có quyền truy cập trang quản trị.");
        return <Navigate to="/login" replace />; // Cần import Navigate từ react-router-dom
    }

    return (
        <div className="flex bg-gray-100 min-h-screen">
            <AdminSidebar user={user} combinedLogout={combinedLogout} />
            <main className="flex-grow p-6 overflow-y-auto">
                <Outlet /> {/* Nơi chứa các trang Admin con */}
            </main>
        </div>
    );
}