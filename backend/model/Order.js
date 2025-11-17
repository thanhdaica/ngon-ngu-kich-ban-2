// src/model/Order.js
import mongoose from 'mongoose';

// 1. Định nghĩa Schema cho mỗi sản phẩm trong đơn hàng
// Lưu trữ thông tin cần thiết tại thời điểm mua (để tránh thay đổi giá sau này)
const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  coverUrl: { type: String },
  price: { type: Number, required: true }, // Giá tại thời điểm đặt
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    ref: 'Book' // Tham chiếu đến Model Book (dùng Book.js)
  },
});

// 2. Định nghĩa Schema chính cho Đơn hàng
const orderSchema = new mongoose.Schema({
  // ------------------------------------
  // Thông tin User
  // ------------------------------------
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User' // Tham chiếu đến Model User (để biết đơn hàng của ai)
  },

  // ------------------------------------
  // Thông tin Sản phẩm
  // ------------------------------------
  orderItems: [orderItemSchema], // Sử dụng schema con đã định nghĩa ở trên

  // ------------------------------------
  // Thông tin Giao hàng
  // ------------------------------------
  shippingAddress: {
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    phone: { type: String, required: true },
    // Có thể thêm zipCode, country nếu cần
  },

  // ------------------------------------
  // Thông tin Thanh toán
  // ------------------------------------
  paymentMethod: {
    type: String, 
    required: true,
    enum: ['COD', 'VNPAY', 'MoMo', 'BankTransfer'] // Các phương thức thanh toán
  },
  
  // Tổng tiền đơn hàng
  itemsPrice: { type: Number, required: true, default: 0.0 }, // Tổng giá trị sản phẩm
  shippingPrice: { type: Number, required: true, default: 0.0 }, // Phí vận chuyển
  totalPrice: { type: Number, required: true, default: 0.0 }, // Tổng cuối cùng

  // Trạng thái thanh toán & đơn hàng
  isPaid: { type: Boolean, required: true, default: false }, // Đã thanh toán (online)
  paidAt: { type: Date }, // Ngày thanh toán
  status: { // Trạng thái đơn hàng (để theo dõi vận chuyển)
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending' 
  },
  
  // Mã giao dịch từ cổng thanh toán (nếu dùng cổng)
  paymentResult: { // Thông tin chi tiết từ cổng thanh toán (VD: VNPAY, Momo)
    id: { type: String },
    status: { type: String },
    update_time: { type: String },
  },

}, {
  timestamps: true // Tự động thêm createdAt và updatedAt
});

export default mongoose.model('Order', orderSchema);