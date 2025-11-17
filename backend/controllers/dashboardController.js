// backend/controllers/dashboardController.js
import User from '../model/User.js';
import Book from '../model/Book.js';
import Order from '../model/Order.js';

class DashboardController {
    
    /**
     * API: GET /api/dashboard/stats
     * MỤC ĐÍCH: Lấy các số liệu thống kê cơ bản
     */
    async getStats(req, res) {
        try {
            // 1. Tổng số người dùng
            const totalUsers = await User.countDocuments({});

            // 2. Tổng số sách
            const totalBooks = await Book.countDocuments({});

            // 3. Tổng số đơn hàng
            const totalOrders = await Order.countDocuments({});

            // 4. Tổng doanh thu (Chỉ tính đơn đã thanh toán hoặc đã giao)
            const totalRevenue = await Order.aggregate([
                { $match: { isPaid: true } }, // Hoặc status: 'Delivered'
                { $group: {
                    _id: null,
                    total: { $sum: '$totalPrice' }
                }}
            ]);

            // 5. Số lượng đơn đặt hàng gần đây (Ví dụ: 30 ngày qua)
            const oneMonthAgo = new Date();
            oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
            
            const recentOrders = await Order.countDocuments({
                createdAt: { $gte: oneMonthAgo }
            });
            
            // 6. Số lượng sản phẩm đã bán
             const totalSoldQuantity = await Book.aggregate([
                { $group: {
                    _id: null,
                    total: { $sum: '$soldQuantity' } 
                }}
            ]);

            // 7. Doanh thu theo tháng (cho biểu đồ)
            // (Đơn giản hóa: chỉ lấy tổng tiền hàng)
            const monthlyRevenue = await Order.aggregate([
                { $match: { isPaid: true } },
                { $group: {
                    _id: { 
                        year: { $year: '$createdAt' }, 
                        month: { $month: '$createdAt' } 
                    },
                    total: { $sum: '$totalPrice' }
                }},
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ]);

            res.json({
                totalUsers,
                totalBooks,
                totalOrders,
                totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
                recentOrders,
                totalSoldQuantity: totalSoldQuantity.length > 0 ? totalSoldQuantity[0].total : 0,
                monthlyRevenue
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Lỗi lấy số liệu thống kê", error: error.message });
        }
    }
}

export default DashboardController;