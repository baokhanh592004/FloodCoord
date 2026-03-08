import React, { useState, useEffect, useMemo } from 'react';
import { adminUserApi } from '../../services/adminUserApi';
import { Users, UserPlus, Shield, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import UserCard from '../../components/admin/UserCard';
import UserFormModal from '../../components/admin/UserFormModal';
import UserDetailModal from '../../components/admin/UserDetailModal';
import StatCard from '../../components/coordinator/StatCard';
import {
    UsersIcon,
    CheckCircleIcon,
    XCircleIcon,
    ShieldCheckIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
    PlusIcon,
} from '@heroicons/react/24/outline';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await adminUserApi.getAllUsers();
            setUsers(data);
            setError('');
        } catch (err) {
            setError('Không thể tải danh sách người dùng. Vui lòng kiểm tra kết nối với server.');
            console.error('Fetch users error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setShowModal(true);
    };

    const handleView = (user) => {
        setSelectedUser(user);
        setShowDetailModal(true);
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.')) {
            return;
        }

        try {
            await adminUserApi.deleteUser(userId);
            await fetchUsers();
            setError('');
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Không thể xóa người dùng';
            setError(errorMsg);
        }
    };

    const openCreateModal = () => {
        setEditingUser(null);
        setShowModal(true);
    };

    const handleModalSuccess = () => {
        fetchUsers();
    };

    // Statistics
    const stats = useMemo(() => {
        return {
            total: users.length,
            active: users.filter(u => u.status).length,
            inactive: users.filter(u => !u.status).length,
            roles: [...new Set(users.map(u => u.roleName))].length
        };
    }, [users]);

    // Filtered users
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                user.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchRole = roleFilter === 'ALL' || user.roleName === roleFilter;
            return matchSearch && matchRole;
        });
    }, [users, searchTerm, roleFilter]);

    // Get unique roles for filter
    const uniqueRoles = useMemo(() => {
        return [...new Set(users.map(u => u.roleName))];
    }, [users]);

    return (
        <div className="p-6 space-y-6 overflow-y-auto h-full">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Người dùng</h1>
                    <p className="text-sm text-gray-500">Quản lý tài khoản và phân quyền hệ thống.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                    <PlusIcon className="h-4 w-4" /> Tạo tài khoản mới
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={<UsersIcon className="h-6 w-6" />} count={stats.total} label="Tổng người dùng" color="blue" />
                <StatCard icon={<CheckCircleIcon className="h-6 w-6" />} count={stats.active} label="Đang hoạt động" color="green" />
                <StatCard icon={<XCircleIcon className="h-6 w-6" />} count={stats.inactive} label="Vô hiệu hóa" color="red" />
                <StatCard icon={<ShieldCheckIcon className="h-6 w-6" />} count={stats.roles} label="Vai trò" color="yellow" />
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-xs">
                    <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên hoặc email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-9 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <XMarkIcon className="h-4 w-4" />
                        </button>
                    )}
                </div>
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 bg-white"
                >
                    <option value="ALL">Tất cả vai trò</option>
                    {uniqueRoles.map(role => (
                        <option key={role} value={role}>{role}</option>
                    ))}
                </select>
            </div>

            {/* Error */}
            {error && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-3 text-sm">
                    <AlertCircle size={18} /> {error}
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-lg">
                    <UsersIcon className="h-10 w-10 mx-auto text-gray-300 mb-3" />
                    <h3 className="text-base font-semibold text-gray-700 mb-1">
                        {searchTerm || roleFilter !== 'ALL' ? 'Không tìm thấy người dùng phù hợp' : 'Chưa có người dùng nào'}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                        {searchTerm || roleFilter !== 'ALL' ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm' : 'Hãy tạo tài khoản đầu tiên'}
                    </p>
                    {!(searchTerm || roleFilter !== 'ALL') && (
                        <button onClick={openCreateModal} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                            + Tạo tài khoản đầu tiên
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredUsers.map(user => (
                            <UserCard
                                key={user.id}
                                user={user}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onView={handleView}
                            />
                        ))}
                    </div>
                    <div className="text-center text-sm text-gray-500">
                        Hiển thị {filteredUsers.length} / {users.length} người dùng
                    </div>
                </>
            )}

            {/* Modals */}
            {showModal && (
                <UserFormModal
                    editingUser={editingUser}
                    onClose={() => setShowModal(false)}
                    onSuccess={handleModalSuccess}
                />
            )}
            {showDetailModal && (
                <UserDetailModal
                    user={selectedUser}
                    onClose={() => setShowDetailModal(false)}
                />
            )}
        </div>
    );
}
