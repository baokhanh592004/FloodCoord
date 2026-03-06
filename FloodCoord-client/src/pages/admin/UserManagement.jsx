import React, { useState, useEffect, useMemo } from 'react';
import { adminUserApi } from '../../services/adminUserApi';
import { Users, UserPlus, Shield, CheckCircle, XCircle, AlertCircle, Search } from 'lucide-react';
import UserCard from '../../components/admin/UserCard';
import UserFormModal from '../../components/admin/UserFormModal';
import UserDetailModal from '../../components/admin/UserDetailModal';

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
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans text-slate-800">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 translate-x-1/3 -translate-y-1/2"></div>

            <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-purple-600 tracking-tight">Quản lý người dùng</h1>
                        <p className="text-slate-500 mt-1 flex items-center gap-2">
                            <span className="inline-block w-2 h-2 bg-purple-500 rounded-full"></span>
                            Quản lý tài khoản và phân quyền hệ thống
                        </p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 font-medium hover:scale-105"
                    >
                        <UserPlus size={18} /> Tạo tài khoản mới
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <StatCard label="Tổng người dùng" count={stats.total} icon={Users} color="text-slate-600" />
                    <StatCard label="Đang hoạt động" count={stats.active} icon={CheckCircle} color="text-green-600" />
                    <StatCard label="Đã vô hiệu hóa" count={stats.inactive} icon={XCircle} color="text-red-600" />
                    <StatCard label="Vai trò" count={stats.roles} icon={Shield} color="text-purple-600" />
                </div>

                {/* Search & Filter Bar */}
                <div className="bg-white/60 backdrop-blur-md border border-white/60 rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên hoặc email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        />
                    </div>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    >
                        <option value="ALL">Tất cả vai trò</option>
                        {uniqueRoles.map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 flex items-center gap-3">
                        <AlertCircle size={20} /> {error}
                    </div>
                )}

                {/* Main Content */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <EmptyState
                        onAdd={openCreateModal}
                        message={searchTerm || roleFilter !== 'ALL' ? 'Không tìm thấy người dùng phù hợp' : 'Chưa có người dùng nào'}
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                )}

                {/* Result count */}
                {!loading && filteredUsers.length > 0 && (
                    <div className="mt-6 text-center text-sm text-slate-500">
                        Hiển thị {filteredUsers.length} / {users.length} người dùng
                    </div>
                )}
            </div>

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

// Sub-component: Stat Card
function StatCard({ label, count, icon: Icon, color }) {
    return (
        <div className="bg-white/60 backdrop-blur-md border border-white/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex items-center justify-between">
            <div>
                <p className="text-slate-500 text-sm font-medium mb-1">{label}</p>
                <p className="text-3xl font-bold text-slate-800">{count < 10 ? `0${count}` : count}</p>
            </div>
            <div className={`p-3 rounded-xl bg-white shadow-sm ${color}`}>
                <Icon size={24} />
            </div>
        </div>
    );
}

// Sub-component: Empty State
function EmptyState({ onAdd, message }) {
    return (
        <div className="text-center py-20 bg-white/40 backdrop-blur-md rounded-3xl border border-dashed border-slate-300">
            <div className="mx-auto w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                <Users size={40} className="text-purple-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">{message}</h3>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                {message.includes('tìm thấy') 
                    ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                    : 'Hãy tạo tài khoản đầu tiên để bắt đầu quản lý người dùng'
                }
            </p>
            {!message.includes('tìm thấy') && (
                <button
                    onClick={onAdd}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition font-semibold hover:scale-105"
                >
                    + Tạo tài khoản đầu tiên
                </button>
            )}
        </div>
    );
}
