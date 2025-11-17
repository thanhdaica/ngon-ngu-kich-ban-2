// src/pages/CheckoutPage.jsx (ĐÃ SỬA VÀ BỔ SUNG UI)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

export default function CheckoutPage() {
    const { user } = useAuth();
    const { cart, handleCheckoutAPI } = useCart(); 
    const navigate = useNavigate();

    const [checkoutSuccess, setCheckoutSuccess] = useState(false);
    // THÊM FLAG MỚI ĐỂ BỎ QUA LOGIC BẢO VỆ
    const [isRedirecting, setIsRedirecting] = useState(false);
    
    // --- KHỐI LOGIC BẢO VỆ CHUYỂN HƯỚNG ---
    useEffect(() => {
        if (checkoutSuccess|| isRedirecting) {
            return; 
        }

        if (cart !== null) {
            if (!user) {
                toast.info("Vui lòng đăng nhập để thanh toán.");
                navigate('/cart');
            } else if (cart.items.length === 0) {
                 toast.info("Giỏ hàng rỗng, không thể thanh toán.");
                 navigate('/cart');
            }
        }
    }, [user, cart, navigate, checkoutSuccess,isRedirecting]);

    // 1. State lưu thông tin form
    const [formData, setFormData] = useState({
        fullName: user?.name || '',
        address: '',
        city: '',
        phone: '',
        paymentMethod: 'COD' 
    });
    
    // 2. Cập nhật state khi form thay đổi (giữ nguyên)
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 3. Xử lý Submit (giữ nguyên logic)
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.address || !formData.phone || !formData.city || !formData.fullName) {
            toast.error("Vui lòng nhập đầy đủ địa chỉ và số điện thoại.");
            return;
        }
        // Báo hiệu cho useEffect rằng chúng ta sắp rời khỏi trang (có chủ đích)
        setIsRedirecting(true);

        const shippingAddress = {
            fullName: formData.fullName,
            address: formData.address,
            city: formData.city,
            phone: formData.phone,
        };
        
        // BƯỚC 1: TẠO ĐƠN HÀNG TRONG DB
        const orderData = await handleCheckoutAPI(shippingAddress, formData.paymentMethod);
        
        if(orderData) {
            const orderId = orderData.data._id;
            
            // BƯỚC 2: CHUYỂN HƯỚNG TÙY THEO PHƯƠNG THỨC THANH TOÁN
            if (formData.paymentMethod === 'COD') {
                setCheckoutSuccess(true);
                navigate('/');
            } else if (formData.paymentMethod === 'MoMo') {
                navigate(`/payment-status/${orderId}`); // Lệnh chuyển hướng được thực hiện
            }
        } else {
            // Nếu API tạo đơn hàng thất bại, reset lại cờ để user có thể ở lại trang
            setIsRedirecting(false);
        }
    };
    
    // --- LOGIC TÍNH TOÁN GIÁ ---
    const itemsSubtotal = cart?.items?.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) || 0;
    const shippingFee = 30000; // Giả định phí ship cố định như logic Backend
    const finalTotal = itemsSubtotal + shippingFee;

    // 👈 ĐIỀU KIỆN HIỂN THỊ: Chờ load xong và đảm bảo giỏ hàng không rỗng
    if (cart === null || !user || cart.items.length === 0) {
        if (checkoutSuccess) return null; // Nếu đã thành công, cho phép unmount
        return <div className="container mx-auto p-8 text-center">Đang kiểm tra giỏ hàng...</div>;
    }


    return (
        // Mở rộng container chính để chứa 2 cột
        <div className="container mx-auto p-8 max-w-6xl"> 
            <h1 className="text-3xl font-bold mb-8">Tiến hành Thanh toán</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Cột 1: FORM VÀ PHƯƠNG THỨC THANH TOÁN (2/3 chiều rộng) */}
                <div className="md:col-span-2 bg-white shadow-lg rounded-xl p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* === THÔNG TIN GIAO HÀNG === */}
                        <h2 className="text-xl font-semibold border-b pb-2">Địa chỉ nhận hàng</h2>
                        <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Họ và Tên" className="w-full p-3 border rounded" required />
                        <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="Số điện thoại" className="w-full p-3 border rounded" required />
                        <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Địa chỉ chi tiết (Số nhà, tên đường...)" className="w-full p-3 border rounded" required />
                        <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="Tỉnh/Thành phố" className="w-full p-3 border rounded" required />
                        
                        {/* === PHƯƠNG THỨC THANH TOÁN (MoMo) === */}
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
                            Xác nhận và Đặt hàng
                        </button>
                    </form>
                </div>
                
                {/* Cột 2: TÓM TẮT ĐƠN HÀNG (1/3 chiều rộng) */}
                <div className="md:col-span-1 bg-white shadow-lg rounded-xl p-6 h-fit">
                    <h2 className="text-2xl font-bold mb-4">Tóm tắt Đơn hàng</h2>
                    
                    {/* Giá tiền hàng */}
                    <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Tổng tiền hàng:</span>
                        <span className="font-medium">{itemsSubtotal.toLocaleString('vi-VN')}đ</span>
                    </div>

                    {/* Phí vận chuyển */}
                    <div className="flex justify-between mb-2 border-b pb-2">
                        <span className="text-gray-600">Phí vận chuyển:</span>
                        <span className="font-medium text-green-600">{shippingFee.toLocaleString('vi-VN')}đ</span>
                    </div>

                    {/* Tổng cộng cuối cùng */}
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