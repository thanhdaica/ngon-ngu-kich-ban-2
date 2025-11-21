// frontend/src/pages/admin/AdminOrderDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Truck, DollarSign, Clock } from 'lucide-react';

export default function AdminOrderDetail() {
    const { id: orderId } = useParams(); // Lấy ID đơn hàng từ URL
    const { token } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const formatCurrency = (amount) => amount ? amount.toLocaleString('vi-VN') + 'đ' : '0đ';

    useEffect(() => {
        const fetchOrder = async () => {
            const config = {
                headers: { 'Authorization': `Bearer ${token}` }
            };

            try {
                // API đã có sẵn: GET /api/order/:id
                const response = await axios.get(`/api/order/${orderId}`, config);
                setOrder(response.data);
            } catch (error) {
                console.error("Lỗi tải chi tiết đơn hàng:", error);
                // Vì AdminLayout đã kiểm tra quyền, lỗi ở đây có thể là 404
                toast.error(error.response?.data?.message || "Không thể tải chi tiết đơn hàng.");
            } finally {
                setLoading(false);
            }
        };

        if (token && orderId) {
            fetchOrder();
        }
    }, [token, orderId]);
    
    // --- Render ---

    if (loading) {
        return <div className="p-10 text-center">Đang tải chi tiết đơn hàng...</div>;
    }

    if (!order) {
        return <div className="p-10 text-center text-red-600">Không tìm thấy đơn hàng này.</div>;
    }
    
    // Hàm hiển thị trạng thái (giống như trong OrderList)
    const renderStatus = (status) => {
        const baseClass = "px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full";
        switch(status) {
            case 'Delivered': return <span className={`${baseClass} bg-green-100 text-green-800`}>Đã Giao</span>;
            case 'Shipped': return <span className={`${baseClass} bg-blue-100 text-blue-800`}>Đang Vận Chuyển</span>;
            case 'Cancelled': return <span className={`${baseClass} bg-red-100 text-red-800`}>Đã Hủy</span>;
            default: return <span className={`${baseClass} bg-yellow-100 text-yellow-800`}>Đang Xử Lý</span>;
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Chi Tiết Đơn Hàng #{orderId.substring(0, 8)}</h1>
            <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
                
                {/* THÔNG TIN CHUNG */}
                <div className="border-b pb-4">
                    <h2 className="text-xl font-semibold mb-2 flex items-center gap-2"><Truck className="w-5 h-5"/> Thông tin Đơn hàng</h2>
                    <p><strong>Ngày đặt:</strong> {new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                    <p><strong>Trạng thái:</strong> {renderStatus(order.status)}</p>
                    <p><strong>Thanh toán:</strong> {order.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}</p>
                </div>

                {/* KHÁCH HÀNG & GIAO HÀNG */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b pb-4">
                    <div>
                        <h3 className="font-semibold text-gray-700 mb-2">Khách hàng</h3>
                        <p><strong>Tên:</strong> {order.user?.name}</p>
                        <p><strong>Email:</strong> {order.user?.email}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-700 mb-2">Địa chỉ giao hàng</h3>
                        <p><strong>Người nhận:</strong> {order.shippingAddress.fullName}</p>
                        <p><strong>SĐT:</strong> {order.shippingAddress.phone}</p>
                        <p><strong>Địa chỉ:</strong> {order.shippingAddress.address}, {order.shippingAddress.city}</p>
                    </div>
                </div>

                {/* SẢN PHẨM */}
                <div>
                    <h2 className="text-xl font-semibold mb-3">Danh sách sản phẩm</h2>
                    <div className="space-y-3">
                        {order.orderItems.map((item) => (
                            <div key={item.product} className="flex justify-between items-center border-b last:border-b-0 pb-2">
                                <div className="flex items-center space-x-3">
                                    <img src={item.coverUrl} alt={item.name} className="w-12 h-16 object-cover rounded"/>
                                    <p>{item.name}</p>
                                </div>
                                <p className="text-sm text-gray-600">
                                    {formatCurrency(item.price)} x {item.quantity} = <strong>{formatCurrency(item.price * item.quantity)}</strong>
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* TỔNG KẾT */}
                <div className="pt-4 border-t">
                    <h2 className="text-xl font-semibold mb-2 flex items-center gap-2"><DollarSign className="w-5 h-5"/> Tóm tắt Chi phí</h2>
                    <div className="space-y-1 text-right">
                        <p>Tiền hàng: {formatCurrency(order.itemsPrice)}</p>
                        <p>Phí vận chuyển: {formatCurrency(order.shippingPrice)}</p>
                        <p className="text-2xl font-bold text-red-600">Tổng cộng: {formatCurrency(order.totalPrice)}</p>
                    </div>
                </div>

                {/* NÚT CHỨC NĂNG (Thêm sau) */}
                <div className="pt-4 flex justify-end gap-3">
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Cập nhật trạng thái</button>
                    <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Hủy đơn</button>
                </div>

            </div>
        </div>
    );
}