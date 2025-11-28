// src/pages/CheckoutPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useLocation
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

export default function CheckoutPage() {
    const { user } = useAuth();
    const { cart, handleCheckoutAPI } = useCart(); 
    const navigate = useNavigate();
    const location = useLocation();

    // 1. Lấy danh sách ID sản phẩm đã chọn từ trang Cart
    const selectedItems = location.state?.selectedItems || [];

    const [checkoutSuccess, setCheckoutSuccess] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    
    // Bảo vệ: Nếu không có sản phẩm nào được chọn thì đá về trang giỏ hàng
    useEffect(() => {
        if (checkoutSuccess || isRedirecting) return;

        if (cart !== null) {
            if (!user) {
                toast.info("Vui lòng đăng nhập để thanh toán.");
                navigate('/cart');
            } else if (selectedItems.length === 0) {
                 toast.info("Vui lòng chọn sản phẩm để thanh toán.");
                 navigate('/cart');
            }
        }
    }, [user, cart, selectedItems, navigate, checkoutSuccess, isRedirecting]);

    const [formData, setFormData] = useState({
        fullName: user?.name || '',
        address: '',
        city: '',
        phone: '',
        paymentMethod: 'COD' 
    });
    
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- TÍNH TOÁN GIÁ TIỀN (CHỈ CÁC MÓN ĐƯỢC CHỌN) ---
    // Lọc ra các item trong giỏ hàng khớp với ID đã chọn
    const checkoutItems = cart?.items?.filter(item => selectedItems.includes(item.product._id)) || [];
    
    const itemsSubtotal = checkoutItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const shippingFee = 30000; // Phí ship cố định
    const finalTotal = itemsSubtotal + shippingFee;


    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.address || !formData.phone || !formData.city || !formData.fullName) {
            toast.error("Vui lòng nhập đầy đủ địa chỉ và số điện thoại.");
            return;
        }
        
        setIsRedirecting(true);

        const shippingAddress = {
            fullName: formData.fullName,
            address: formData.address,
            city: formData.city,
            phone: formData.phone,
        };
        
        // TRUYỀN selectedItems VÀO API
        const orderData = await handleCheckoutAPI(shippingAddress, formData.paymentMethod, selectedItems);
        
        if(orderData) {
            const orderId = orderData.data._id;
            
            if (formData.paymentMethod === 'COD') {
                setCheckoutSuccess(true);
                navigate('/');
            } else if (formData.paymentMethod === 'MoMo') {
                navigate(`/payment-status/${orderId}`); 
            }
        } else {
            setIsRedirecting(false);
        }
    };

    if (cart === null || !user) {
        return <div className="container mx-auto p-8 text-center">Đang tải...</div>;
    }

    return (
        <div className="container mx-auto p-8 max-w-6xl"> 
            <h1 className="text-3xl font-bold mb-8">Tiến hành Thanh toán</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Cột 1: FORM THÔNG TIN */}
                <div className="md:col-span-2 bg-white shadow-lg rounded-xl p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <h2 className="text-xl font-semibold border-b pb-2">Địa chỉ nhận hàng</h2>
                        <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Họ và Tên" className="w-full p-3 border rounded" required />
                        <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="Số điện thoại" className="w-full p-3 border rounded" required />
                        <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Địa chỉ chi tiết (Số nhà, tên đường...)" className="w-full p-3 border rounded" required />
                        <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="Tỉnh/Thành phố" className="w-full p-3 border rounded" required />
                        
                        <h2 className="text-xl font-semibold border-b pb-2 pt-4">Phương thức thanh toán</h2>
                        <div className="space-y-2">
                            <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                <input type="radio" name="paymentMethod" value="COD" checked={formData.paymentMethod === 'COD'} onChange={handleChange} />
                                <span className="font-medium">Thanh toán khi nhận hàng (COD)</span>
                            </label>
                            <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                <input type="radio" name="paymentMethod" value="MoMo" checked={formData.paymentMethod === 'MoMo'} onChange={handleChange} />
                                <span className="font-medium">Thanh toán online quét mã MoMo</span>
                            </label>
                        </div>

                        <button type="submit" className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors mt-6">
                            Xác nhận và Đặt hàng ({selectedItems.length} món)
                        </button>
                    </form>
                </div>
                
                {/* Cột 2: TÓM TẮT ĐƠN HÀNG */}
                <div className="md:col-span-1 bg-white shadow-lg rounded-xl p-6 h-fit">
                    <h2 className="text-2xl font-bold mb-4">Tóm tắt Đơn hàng</h2>
                    
                    {/* Danh sách sản phẩm (Thu gọn) */}
                    <div className="max-h-60 overflow-y-auto mb-4 border-b pb-2">
                        {checkoutItems.map(item => (
                            <div key={item.product._id} className="flex justify-between text-sm mb-2">
                                <span className="truncate w-3/4">{item.product.name} <span className="text-gray-500">x{item.quantity}</span></span>
                                <span>{(item.product.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Tiền hàng:</span>
                        <span className="font-medium">{itemsSubtotal.toLocaleString('vi-VN')}đ</span>
                    </div>

                    <div className="flex justify-between mb-2 border-b pb-2">
                        <span className="text-gray-600">Phí vận chuyển:</span>
                        <span className="font-medium text-green-600">{shippingFee.toLocaleString('vi-VN')}đ</span>
                    </div>

                    <div className="flex justify-between text-2xl font-extrabold mt-4">
                        <span>Tổng thanh toán:</span>
                        <span className="text-red-600">
                             {finalTotal.toLocaleString('vi-VN')}đ
                        </span>
                    </div>
                </div>

            </div>
        </div>
    );
}