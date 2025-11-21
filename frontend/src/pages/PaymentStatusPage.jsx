// frontend/src/pages/PaymentStatusPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function PaymentStatusPage() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    
    const [order, setOrder] = useState(null);
    const [status, setStatus] = useState('pending'); // 'pending', 'success', 'failed'
    const [qrCodeUrl, setQrCodeUrl] = useState(null); 
    const [loading, setLoading] = useState(true);

    const formatCurrency = (amount) => amount ? amount.toLocaleString('vi-VN') + 'đ' : '0đ';

    // --- BƯỚC 1: LẤY THÔNG TIN ĐƠN HÀNG VÀ TẠO QR CODE ---
    useEffect(() => {
        let isMounted = true;
        
        const fetchAndGeneratePayment = async () => {
            const config = { headers: { 'Authorization': `Bearer ${token}` } };
            
            try {
                // 1. Lấy thông tin đơn hàng 
                const orderResponse = await axios.get(`/api/order/${orderId}`, config);
                const orderData = orderResponse.data;
                
                if (orderData.isPaid) { 
                     setStatus('success');
                     if(isMounted) setOrder(orderData);
                     return;
                }
                
                // 2. GỌI API BACKEND ĐỂ TẠO QR CODE MoMo
                const createUrl = '/api/payment/momo_create';
                
                const paymentResponse = await axios.post(createUrl, { 
                    orderId: orderData._id, 
                    amount: orderData.totalPrice 
                }, config);
                
                if(isMounted) {
                    setOrder(orderData);
                    setQrCodeUrl(paymentResponse.data.qrCodeUrl || paymentResponse.data.payUrl);
                    setStatus('pending');
                }
            } catch (error) {
                console.error("Lỗi tải/tạo thanh toán:", error);
                if(isMounted) setStatus('failed');
                toast.error("Không thể tạo mã thanh toán MoMo. Vui lòng thử lại.");
            } finally {
                if(isMounted) setLoading(false);
            }
        };

        if (token && orderId) {
            fetchAndGeneratePayment();
        }

        return () => { isMounted = false };
    }, [token, orderId]);


    // --- BƯỚC 2: LOGIC POLLING (Thăm dò trạng thái) ---
    useEffect(() => {
        let intervalId;

        if (status === 'pending') {
            intervalId = setInterval(async () => {
                const config = { headers: { 'Authorization': `Bearer ${token}` } };

                try {
                    // Gọi API xem chi tiết đơn hàng
                    const response = await axios.get(`/api/order/${orderId}`, config);
                    
                    if (response.data.isPaid === true) {
                        setStatus('success');
                        clearInterval(intervalId); 
                        toast.success("Thanh toán thành công! Đang chuyển hướng...");
                        setTimeout(() => {
                            navigate('/', { replace: true });
                        }, 2000); // Chuyển hướng sau 2 giây
                    }
                } catch (error) {
                    console.error("Lỗi Polling:", error);
                }
            }, 5000); // Thăm dò mỗi 5 giây
        }
        
        return () => clearInterval(intervalId);
    }, [status, orderId, token, navigate]);
    
    // --- Render ---

    if (loading) {
        return <div className="text-center p-10"><Loader2 className="w-8 h-8 animate-spin mx-auto text-pink-600"/> Đang chuẩn bị mã thanh toán...</div>;
    }
    
    // TRẠNG THÁI SUCCESS
    if (status === 'success') {
        return (
            <div className="text-center p-20 min-h-screen">
                <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4"/>
                <h1 className="text-3xl font-bold text-green-600">Thanh Toán Thành Công!</h1>
                <p className="text-gray-600 mt-2">Đơn hàng đã được xác nhận. Chuyển hướng về trang chủ...</p>
            </div>
        );
    }

    // TRẠNG THÁI FAILED
    if (status === 'failed') {
        return (
            <div className="text-center p-20 min-h-screen">
                <XCircle className="w-16 h-16 mx-auto text-red-500 mb-4"/>
                <h1 className="text-3xl font-bold text-red-600">Thanh Toán Thất Bại</h1>
                <p className="text-gray-600 mt-2">Không thể tạo mã thanh toán hoặc giao dịch thất bại.</p>
                <button onClick={() => navigate('/checkout')} className="mt-6 text-blue-600 hover:underline">Thử lại thanh toán</button>
            </div>
        );
    }
    
    // TRẠNG THÁI PENDING (Hiển thị QR Code)
    return (
        <div className="container mx-auto p-8 max-w-2xl text-center min-h-screen">
            <h1 className="text-3xl font-bold mb-4 text-pink-600">QUÉT MÃ THANH TOÁN MoMo</h1>
            <p className="mb-6 text-lg">Đơn hàng: **#{orderId.substring(0, 8)}** | Tổng tiền: **{formatCurrency(order?.totalPrice)}**</p>
            
            {/* MÃ QR CODE */}
            {qrCodeUrl && (
                <div className="bg-white p-6 rounded-lg shadow-xl inline-block border-4 border-pink-600">
                    <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrCodeUrl)}`} 
                        alt="Mã QR Thanh toán MoMo" 
                        className="mx-auto"
                    />
                </div>
            )}
            
            <p className="mt-4 text-gray-500 text-sm">Sử dụng ứng dụng MoMo để quét mã. Hệ thống đang tự động theo dõi trạng thái thanh toán.</p>
            <div className='flex justify-center mt-4 text-red-500'>
                 <Loader2 className="w-4 h-4 animate-spin mr-2"/> Đang chờ thanh toán...
            </div>
            
            <button onClick={() => navigate('/checkout')} className="mt-6 text-blue-600 hover:underline">Hủy và thử lại phương thức khác</button>
        </div>
    );
}