// File: src/components/UserAccount.jsx

import React from 'react';
import { Button } from '@/components/ui/button'; 
import { User, LogOut, LayoutDashboard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '../../context/AuthContext'; 
import { useCombinedLogout } from '../../hooks/useCombinedLogout';
const UserAccount = () => {
  const auth = useAuth(); // Lấy Context (Biến này KHÔNG phải là null/undefined sau khi sửa lỗi)
  const navigate = useNavigate();
  const { user, logout } = auth; // Destructure sau khi kiểm tra an toàn

  const combinedLogout = useCombinedLogout();
  // Tránh lỗi nếu AuthProvider chưa load (giữ nguyên logic kiểm tra lỗi)
  if (!auth) { 
    return (
      <Button variant="ghost" className="flex flex-col h-auto px-2">
        <User className="w-6 h-6" />
        <span className="text-xs font-normal">Tài khoản</span>
      </Button>
    );
  }


  // 1. Logic khi ĐÃ ĐĂNG NHẬP (Hiển thị Tên)
  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex flex-col h-auto px-2">
            <User className="w-6 h-6 text-indigo-600" />
            {/* Hiển thị tên (chỉ lấy chữ đầu) */}
            <span className="text-xs font-normal text-indigo-600">
              {user.name.split(' ')[0]} 
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Xin chào, {user.name}</DropdownMenuItem>
          <DropdownMenuSeparator />

          {/* LOGIC MỚI: CHỈ HIỂN THỊ NÚT ADMIN NẾU isAdmin LÀ TRUE */}
          {user.isAdmin && (
            <DropdownMenuItem asChild>
                <Link to="/admin/dashboard" className="flex items-center">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Trang Quản Trị
                </Link>
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem asChild><Link to="/profile">Tài khoản của tôi</Link></DropdownMenuItem>
          <DropdownMenuItem onClick={combinedLogout} className="text-red-600">
            <LogOut className="w-4 h-4 mr-2" />
            Đăng xuất
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // 2. Logic khi CHƯA ĐĂNG NHẬP (Hiển thị nút Đăng nhập/Đăng ký)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex flex-col h-auto px-2">
          <User className="w-6 h-6" />
          <span className="text-xs font-normal">Tài khoản</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <Link to="/login">Đăng nhập</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/register">Đăng ký</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
export default UserAccount;