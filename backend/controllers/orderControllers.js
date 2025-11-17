// src/controllers/orderControllers.js (Phiên bản đã tối ưu)
import Order from '../model/Order.js';
import Book from '../model/Book.js'; 
import Cart from '../model/Cart.js'; // <-- Cần để tìm giỏ hàng

class OrderController {
    // [POST] /api/order
    async addOrderItems(req, res) {
        const userId = req.user._id; // Lấy ID User từ req.user (do protect gán)
        const { shippingAddress, paymentMethod } = req.body;
        
        // 1. KIỂM TRA: User đã gửi đủ thông tin cần thiết chưa
        if (!shippingAddress || !paymentMethod) {
             return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin giao hàng và phương thức thanh toán.' });
        }

        try {
            // 2. TÌM GIỎ HÀNG THỰC TẾ của user
            // Populate để lấy thông tin chi tiết của sách (name, price, coverUrl)
            const cart = await Cart.findOne({ user: userId }).populate('items.product', 'name price coverUrl');
            
            if (!cart || cart.items.length === 0) {
                return res.status(400).json({ message: 'Giỏ hàng của bạn đang trống.' });
            }

            // 3. TÍNH TOÁN LẠI TỔNG TIỀN (VÀ LỌC SẢN PHẨM LỖI)
            let itemsPrice = 0;
            const finalOrderItems = [];
            
            for (const item of cart.items) {
                
                // <== BỔ SUNG KIỂM TRA ĐIỀU KIỆN (FIX LỖI 500) ==>
                if (!item.product || !item.product.price) {
                    console.warn(`Sản phẩm trong giỏ hàng (ID: ${item.product?._id || 'Unknown'}) không tồn tại hoặc thiếu giá. Bỏ qua.`);
                    continue; // Bỏ qua sản phẩm lỗi (Ghost Item)
                }
                // <===========================================>

                // Lấy giá và tên sách từ Object 'product' đã được populate
                const price = item.product.price;
                const name = item.product.name;
                const coverUrl = item.product.coverUrl;
                
                // Tính tổng tiền
                itemsPrice += price * item.quantity;

                // Chuẩn bị item cho Order Model
                finalOrderItems.push({
                    name,
                    coverUrl,
                    quantity: item.quantity,
                    price,
                    product: item.product._id // ID sách
                });
            }

            // Kiểm tra nếu sau khi lọc, giỏ hàng không còn sản phẩm nào
            if (finalOrderItems.length === 0) {
                 return res.status(400).json({ message: 'Giỏ hàng của bạn chỉ chứa các sản phẩm không còn tồn tại. Vui lòng cập nhật giỏ hàng.' });
            }

            // Giả định: Phí ship cố định
            const shippingPrice = 30000; 
            const totalPrice = itemsPrice + shippingPrice;

            // 4. TẠO ĐƠN HÀNG MỚI
            const order = new Order({
                user: userId,
                orderItems: finalOrderItems,
                shippingAddress,
                paymentMethod,
                itemsPrice,
                shippingPrice,
                totalPrice,
            });

            const createdOrder = await order.save();
            
            // 5. XÓA GIỎ HÀNG (Sau khi tạo đơn thành công)
            await Cart.deleteOne({ user: userId });
            
            // 6. Trả về kết quả
            res.status(201).json({ 
                message: 'Tạo đơn hàng và tiến hành thanh toán thành công!',
                data: createdOrder 
            });

        } catch (error) {
            console.error('❌ Lỗi khi tạo đơn hàng:', error);
            res.status(500).json({ message: 'Lỗi server khi tạo đơn hàng', error: error.message });
        }
    }
    // [GET] /api/order/:id
    // Hàm xem chi tiết một đơn hàng
    async getOrderById(req, res) {
        try {
            const order = await Order.findById(req.params.id).populate('user', 'name email');

            if (order) {
                // Đảm bảo chỉ user sở hữu hoặc Admin mới xem được đơn hàng
                if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
                    return res.status(403).json({ message: "Bạn không có quyền xem đơn hàng này." });
                }
                res.json(order);
            } else {
                res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Lỗi server khi xem chi tiết đơn hàng', error: error.message });
        }
    }
    /**
     * [GET] /api/order/
     * MỤC ĐÍCH: Lấy tất cả đơn hàng (Chỉ Admin)
     */
    async getAllOrders(req, res) {
        try {
            // Lấy tất cả đơn hàng và populate tên/email user
            const orders = await Order.find({})
                .populate('user', 'name email');

            res.json(orders);
        } catch (error) {
            console.error('❌ Lỗi khi lấy tất cả đơn hàng:', error);
            res.status(500).json({ message: 'Lỗi server khi lấy danh sách đơn hàng', error: error.message });
        }
    }
}

export default OrderController;