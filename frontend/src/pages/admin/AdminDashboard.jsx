// frontend/src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Users, BookOpen, DollarSign, ShoppingCart } from 'lucide-react';

// Component Card nhỏ để hiển thị số liệu
const StatCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h2 className="text-3xl font-bold text-gray-900 mt-1">{value}</h2>
        </div>
        <div className={`p-3 rounded-full ${colorClass} text-white`}>
            <Icon className="w-6 h-6" />
        </div>
    </div>
);

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const formatCurrency = (amount) => {
        return amount.toLocaleString('vi-VN') + 'đ';
    };

    useEffect(() => {
        const fetchStats = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            const config = {
                headers: { 'Authorization': `Bearer ${token}` }
            };

            try {
                // Gọi API thống kê mới tạo
                const response = await axios.get('/api/dashboard/stats', config);
                setStats(response.data);
            } catch (error) {
                console.error("Lỗi tải số liệu Dashboard:", error);
                toast.error(error.response?.data?.message || "Lỗi khi tải số liệu thống kê.");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return <div className="text-center p-10">Đang tải số liệu...</div>;
    }

    if (!stats) {
        return <div className="text-center p-10 text-red-600">Không thể tải dữ liệu thống kê.</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Dashboard Thống Kê</h1>
            
            {/* Hàng Card Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    title="Doanh thu" 
                    value={formatCurrency(stats.totalRevenue)} 
                    icon={DollarSign} 
                    colorClass="bg-green-500"
                />
                <StatCard 
                    title="Tổng đơn hàng" 
                    value={stats.totalOrders.toLocaleString('vi-VN')} 
                    icon={ShoppingCart} 
                    colorClass="bg-blue-500"
                />
                <StatCard 
                    title="Sách đã bán" 
                    value={stats.totalSoldQuantity.toLocaleString('vi-VN')} 
                    icon={BookOpen} 
                    colorClass="bg-red-500"
                />
                <StatCard 
                    title="Tổng User" 
                    value={stats.totalUsers.toLocaleString('vi-VN')} 
                    icon={Users} 
                    colorClass="bg-indigo-500"
                />
            </div>

            {/* Phần biểu đồ và bảng (Sử dụng dữ liệu monthlyRevenue cho biểu đồ) */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Doanh thu hàng tháng</h2>
                {/* Ở đây bạn sẽ dùng thư viện biểu đồ (ví dụ: Recharts, Chart.js) */}
                <p className="text-gray-600">
                    {/* Demo dữ liệu thô: */}
                    Dữ liệu thống kê: {JSON.stringify(stats.monthlyRevenue)}
                </p>
            </div>
        </div>
    );
}