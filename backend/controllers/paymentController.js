import Order from '../model/Order.js';
import crypto from 'crypto';
import axios from 'axios';
import 'dotenv/config'; 
// import mongoose from 'mongoose'; // <== ĐÃ XÓA (Không cần thiết)

// Hàm sắp xếp (Giữ nguyên)
function sortObject(obj) {
    let sorted = {};
    let keys = Object.keys(obj).sort();
    for (let key of keys) {
        if (obj[key] !== undefined && obj[key] !== null) {
            sorted[key] = obj[key];
        }
    }
    return sorted;
}

class PaymentController {

    async createMomoPayment(req, res) {
        const userId = req.user._id; 
        const { orderId, amount, extraData = '' } = req.body;
        
        try {
            // 1. Kiểm tra Order
            const order = await Order.findById(orderId);
            if (!order || order.user.toString() !== userId.toString()) {
                return res.status(404).json({ message: 'Không tìm thấy đơn hàng hoặc không phải của bạn' });
            }

            // 2. Chuẩn bị tham số VÀ ĐẢM BẢO KHÓA SẠCH (FIX LỖI TRIMS)
            const partnerCode = process.env.MOMO_PARTNER_CODE?.trim(); // <== THÊM .trim()
            const accessKey = process.env.MOMO_ACCESS_KEY?.trim();   // <== THÊM .trim()
            const secretKey = process.env.MOMO_SECRET_KEY?.trim();     // <== THÊM .trim()
            
            // <== KIỂM TRA KHÓA BÍ MẬT ĐỂ TRÁNH CRASH ==>
            if (!secretKey || !partnerCode || !accessKey) {
                 console.error('❌ LỖI CẤU HÌNH: Khóa MoMo bị thiếu hoặc chưa load.');
                 return res.status(500).json({ message: 'Lỗi cấu hình Backend: Khóa MoMo (Partner/Secret Key) bị thiếu.' });
            }
            // <=======================================>
            
            const amountInteger = Math.round(amount); 
            const requestId = orderId; 
            const orderInfo = `Thanh toan don hang ${orderId.substring(0, 8)}`;
            const requestType = 'payWithMethod';
            
            // --- 3. TẠO CHUỖI KÝ (SIGNATURE) ---
            let signatureParams = {
                accessKey: accessKey,
                amount: amountInteger,
                orderId: orderId,
                orderInfo: orderInfo,
                partnerCode: partnerCode,
                redirectUrl: `http://localhost:5173/payment-status/${orderId}`, 
                ipnUrl: process.env.MOMO_IPN_URL,
                requestId: requestId,
                requestType: requestType,
                extraData: extraData,
            };

            signatureParams = sortObject(signatureParams);

            const rawSignature = 
                Object.keys(signatureParams).map(key => `${key}=${signatureParams[key]}`).join('&');

            // Tạo chữ ký SHA256
            const signature = crypto.createHmac('sha256', secretKey)
                                    .update(rawSignature)
                                    .digest('hex');

            // --- 4. GỌI MOMO API ---
            const requestBody = {
                ...signatureParams, 
                lang: 'vi', 
                signature: signature, 
            };
            
            const momoResponse = await axios.post(process.env.MOMO_API_URL, requestBody);
            
            if (momoResponse.data && momoResponse.data.payUrl) {
                res.status(200).json({ 
                    payUrl: momoResponse.data.payUrl,
                    qrCodeUrl: momoResponse.data.qrCodeUrl 
                });
            } else {
                // MoMo Response trả về lỗi 400
                console.error('MoMo Response Error:', momoResponse.data);
                res.status(400).json({ message: 'Lỗi từ cổng MoMo', details: momoResponse.data });
            }

        } catch (error) {
            // Bắt lỗi hệ thống (như lỗi không thể kết nối hoặc crash)
            console.error('❌ Lỗi tạo thanh toán MoMo (Backend Catch):', error.message);
            res.status(500).json({ message: 'Lỗi server không xác định khi gọi MoMo API', error: error.message });
        }
    }
    /**
     * [POST] /api/payment/momo_ipn (Giữ nguyên)
     */
    async momoIPN(req, res) {
        // ... (phần còn lại giữ nguyên) ...
    }
}

export default PaymentController;