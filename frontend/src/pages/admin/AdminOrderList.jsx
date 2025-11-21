// frontend/src/pages/admin/AdminOrderList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';

export default function AdminOrderList() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth(); // Lấy token để gọi API

    useEffect(() => {
        const fetchOrders = async () => {
            const config = {
                headers: { 'Authorization': `Bearer ${token}` }
            };

            try {
                // Gọi API Admin mới tạo
                const response = await axios.get('/api/order', config);
                setOrders(response.data);
            } catch (error) {
                console.error("Lỗi tải đơn hàng:", error);
                toast.error(error.response?.data?.message || "Lỗi khi tải danh sách đơn hàng.");
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchOrders();
        } else {
            // Trường hợp user cố truy cập thẳng không qua AdminLayout
            setLoading(false); 
        }
    }, [token]);

    const formatCurrency = (amount) => amount ? amount.toLocaleString('vi-VN') + 'đ' : '0đ';

    if (loading) {
        return <div className="text-center p-10">Đang tải danh sách đơn hàng...</div>;
    }

    if (orders.length === 0) {
        return <div className="text-center p-10">Không có đơn hàng nào trong hệ thống.</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Quản Lý Đơn Hàng</h1>
            <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã ĐH</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đặt</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                            <th className="px-6 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                            <tr key={order._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {order._id.substring(0, 8)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {order.user?.name || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">
                                    {formatCurrency(order.totalPrice)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                        order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link to={`/admin/order/${order._id}`} className="text-indigo-600 hover:text-indigo-900">
                                        Chi tiết
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}