import {Toaster} from 'sonner';
import { BrowserRouter, Routes, Route } from "react-router-dom";

// 1. Import Layout (vỏ bọc)
import MainLayout from './layouts/MainLayout'; 

// 2. Import các trang (ruột)
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import CategoryDetailPage from './pages/CategoryDetailPage';
import LoginPage from "./pages/LoginPage"; 
import RegisterPage from "./pages/RegisterPage"; 
import CartPage from './pages/CartPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminLayout from './layouts/AdminLayout'; 
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrderList from './pages/admin/AdminOrderList';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import AdminBookList from './pages/admin/AdminBookList';
import AdminBookForm from './pages/admin/AdminBookForm';
import AdminUserList from './pages/admin/AdminUserList';
import PaymentStatusPage from './pages/PaymentStatusPage';
import VerifyOtpPage from './pages/VerifyOtpPage';
// (Bạn cũng cần import BookDetailPage khi tạo nó)


function App() {

  return (
    <>
      <Toaster richColors />
      
      <BrowserRouter> 
        <Routes>
          
          {/* === 3. LOGIC SỬA ĐỔI NẰM Ở ĐÂY === */}

          {/* A. Các trang CÔNG KHAI (có Header/Footer) */}
          {/* Bọc các trang này trong MainLayout */}
          <Route element={<MainLayout />}>
            <Route
              path="/"
              element={<HomePage />}
            />
            <Route
              path="/category/:id"
              element={<CategoryDetailPage />}
            />
            <Route 
              path="/cart" 
              element={<CartPage />} 
            />
            <Route 
              path="/checkout" 
              element={<CheckoutPage />} 
            />
            <Route path="/book/:id" 
            element={<ProductDetailPage />} 
            />
            <Route path="/payment-status/:orderId" 
            element={<PaymentStatusPage />} 
            />
          </Route>

          <Route element={<AdminLayout />}>
             <Route path="/admin/dashboard" element={<AdminDashboard />} />
             <Route path="/admin/orders" element={<AdminOrderList />} /> 
             {/* ROUTE CHI TIẾT ĐƠN HÀNG */}
             <Route path="/admin/order/:id" element={<AdminOrderDetail />} />
             {/* ROUTE QUẢN LÝ SÁCH */}
             <Route path="/admin/books" element={<AdminBookList />} />
             <Route path="/admin/books/add" element={<AdminBookForm />} />
             <Route path="/admin/books/edit/:id" element={<AdminBookForm />} />
             {/* ROUTE QUẢN LÝ NGƯỜI DÙNG */}
             <Route path="/admin/users" element={<AdminUserList />} />
             {/* Thêm các trang quản lý khác vào đây: /admin/orders, /admin/books, ... */}
          </Route>

          {/* B. Các trang RIÊNG (không có Header/Footer) */}
          {/* Để các trang này bên ngoài MainLayout */}
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<NotFound />} /> 
          
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App;