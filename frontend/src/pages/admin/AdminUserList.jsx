// frontend/src/pages/admin/AdminUserList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Check, X, UserCheck, UserX } from 'lucide-react'; // Icons mới

export default function AdminUserList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user: currentUser, token } = useAuth(); // Lấy user hiện tại và token

    const fetchUsers = async () => {
        setLoading(true);
        const config = {
            headers: { 'Authorization': `Bearer ${token}` }
        };
        try {
            // Gọi API Admin: GET /api/user
            const response = await axios.get('/api/user', config);
            setUsers(response.data);
        } catch (error) {
            console.error("Lỗi tải user:", error);
            toast.error(error.response?.data?.message || "Lỗi khi tải danh sách người dùng.");
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        if (token) fetchUsers();
    }, [token]);

    // Hàm thay đổi quyền Admin
    const handlePromoteDemote = async (userId, newIsAdminStatus) => {
        if (currentUser._id === userId) {
            toast.error("Bạn không thể tự thay đổi quyền của bản thân.");
            return;
        }

        if (!window.confirm(`Bạn có chắc chắn muốn ${newIsAdminStatus ? 'THĂNG CẤP' : 'HẠ CẤP'} người dùng này không?`)) return;

        const config = {
            headers: { 'Authorization': `Bearer ${token}` }
        };
        
        try {
            // Gọi API Promote/Demote mới tạo
            await axios.put(`/api/user/${userId}/role`, { isAdmin: newIsAdminStatus }, config);
            
            toast.success(`Đã ${newIsAdminStatus ? 'thăng cấp' : 'hạ cấp'} thành công.`);
            fetchUsers(); // Tải lại danh sách
        } catch (error) {
            console.error("Lỗi thay đổi quyền:", error);
            toast.error(error.response?.data?.message || "Thay đổi quyền thất bại.");
        }
    };

    if (loading) {
        return <div className="text-center p-10">Đang tải danh sách người dùng...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Quản Lý Người Dùng</h1>
            <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quyền Admin</th>
                            <th className="px-6 py-3">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user._id} className={currentUser._id === user._id ? 'bg-indigo-50' : ''}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user._id.substring(0, 8)}...</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {user.isAdmin ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            <Check className="w-3 h-3"/> ADMIN
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            <X className="w-3 h-3"/> USER
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {/* Nút Thăng/Hạ cấp */}
                                    <button 
                                        onClick={() => handlePromoteDemote(user._id, !user.isAdmin)}
                                        disabled={currentUser._id === user._id}
                                        className={`p-2 rounded-full transition ${
                                            user.isAdmin 
                                                ? 'bg-red-500 text-white hover:bg-red-600' 
                                                : 'bg-green-500 text-white hover:bg-green-600'
                                        } disabled:opacity-30 disabled:cursor-not-allowed`}
                                        title={user.isAdmin ? "Hạ cấp xuống User thường" : "Thăng cấp lên Admin"}
                                    >
                                        {user.isAdmin ? <UserX className="w-5 h-5"/> : <UserCheck className="w-5 h-5"/>}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}