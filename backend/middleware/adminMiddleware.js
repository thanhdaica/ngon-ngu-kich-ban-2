// backend/middleware/adminMiddleware.js
// Dùng kèm sau middleware `protect`
const admin = (req, res, next) => {
  // `req.user` đã được gán bởi middleware `protect`
  if (req.user && req.user.isAdmin) {
    next(); // Có quyền Admin, cho đi tiếp
  } else {
    res.status(403).json({ 
        message: 'Không có quyền truy cập Admin' 
    }); // 403 Forbidden
  }
};

export { admin };