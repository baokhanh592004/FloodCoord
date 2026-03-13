import React, { useState, useEffect, useMemo } from 'react';
import { adminUserApi } from '../../services/adminUserApi';
import { AlertCircle } from 'lucide-react';
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
    EyeIcon,
    PencilSquareIcon,
    TrashIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline';

const ITEMS_PER_PAGE = 10;

const compareUserId = (leftId, rightId) => {
    const leftNumber = Number(leftId);
    const rightNumber = Number(rightId);

    if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber)) {
        return leftNumber - rightNumber;
    }

    return String(leftId).localeCompare(String(rightId));
};

const preserveUserOrder = (incomingUsers, previousUsers) => {
    const previousIndex = new Map(previousUsers.map((user, index) => [user.id, index]));

    return [...incomingUsers].sort((leftUser, rightUser) => {
        const leftPrevIndex = previousIndex.has(leftUser.id)
            ? previousIndex.get(leftUser.id)
            : Number.MAX_SAFE_INTEGER;
        const rightPrevIndex = previousIndex.has(rightUser.id)
            ? previousIndex.get(rightUser.id)
            : Number.MAX_SAFE_INTEGER;

        if (leftPrevIndex !== rightPrevIndex) {
            return leftPrevIndex - rightPrevIndex;
        }

        return compareUserId(leftUser.id, rightUser.id);
    });
};

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
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await adminUserApi.getAllUsers();
            setUsers(prevUsers => preserveUserOrder(data, prevUsers));
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

    // Reset về trang 1 khi thay đổi filter
    useEffect(() => { setCurrentPage(1); }, [roleFilter, searchTerm]);

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

    // Pagination
    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredUsers, currentPage]);

    // Role badge color
    const getRoleBadge = (roleName) => {
        const map = {
            ADMIN: 'bg-purple-100 text-purple-700',
            MANAGER: 'bg-blue-100 text-blue-700',
            COORDINATOR: 'bg-teal-100 text-teal-700',
            RESCUE_TEAM: 'bg-orange-100 text-orange-700',
            CITIZEN: 'bg-gray-100 text-gray-600',
        };
        return map[roleName] || 'bg-gray-100 text-gray-600';
    };

    return (
        <div className="h-full flex flex-col p-6 gap-4">
            {/* Header */}
            <div className="flex items-start justify-between shrink-0">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
                <StatCard icon={<UsersIcon className="h-6 w-6" />} count={stats.total} label="Tổng người dùng" color="blue" />
                <StatCard icon={<CheckCircleIcon className="h-6 w-6" />} count={stats.active} label="Đang hoạt động" color="green" />
                <StatCard icon={<XCircleIcon className="h-6 w-6" />} count={stats.inactive} label="Vô hiệu hóa" color="red" />
                <StatCard icon={<ShieldCheckIcon className="h-6 w-6" />} count={stats.roles} label="Vai trò" color="yellow" />
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
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
                <div className="shrink-0 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-3 text-sm">
                    <AlertCircle size={18} /> {error}
                </div>
            )}

            {/* Table */}
            <div className="flex-1 min-h-0 bg-white border border-gray-200 rounded-lg flex flex-col overflow-hidden">
                <div className="flex-1 min-h-0 overflow-auto">
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <ArrowPathIcon className="h-7 w-7 animate-spin text-blue-500" />
                        </div>
                    ) : (
                        <table className="w-full text-base text-left text-gray-500">
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="text-left px-3 py-2 font-semibold text-gray-600 w-10">#</th>
                                    <th className="text-left px-3 py-2 font-semibold text-gray-600">Họ tên</th>
                                    <th className="text-left px-3 py-2 font-semibold text-gray-600">Email</th>
                                    <th className="text-center px-3 py-2 font-semibold text-gray-600 w-32">Vai trò</th>
                                    <th className="text-center px-3 py-2 font-semibold text-gray-600 w-32">Trạng thái</th>
                                    <th className="text-center px-3 py-2 font-semibold text-gray-600 w-28">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedUsers.map((user, index) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        {/* # */}
                                        <td className="px-4 py-3 text-gray-400 font-mono">
                                            {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                        </td>

                                        {/* Họ tên */}
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-900">{user.fullName}</p>
                                        </td>

                                        {/* Email */}
                                        <td className="px-4 py-3 text-gray-600">{user.email}</td>

                                        {/* Vai trò */}
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${getRoleBadge(user.roleName)}`}>
                                                {user.roleName}
                                            </span>
                                        </td>

                                        {/* Trạng thái */}
                                        <td className="px-4 py-3 text-center">
                                            {user.status ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[11px] font-medium">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                                                    Hoạt động
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[11px] font-medium">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                                                    Vô hiệu hóa
                                                </span>
                                            )}
                                        </td>

                                        {/* Hành động */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-0.5">
                                                <button
                                                    onClick={() => handleView(user)}
                                                    title="Xem chi tiết"
                                                    className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                >
                                                    <EyeIcon className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    title="Chỉnh sửa"
                                                    className="p-1 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                                                >
                                                    <PencilSquareIcon className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    title="Xóa tài khoản"
                                                    className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {/* Empty state */}
                    {!loading && filteredUsers.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                            <UsersIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-xs">
                                {searchTerm || roleFilter !== 'ALL'
                                    ? 'Không tìm thấy người dùng phù hợp.'
                                    : 'Chưa có người dùng nào.'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer: phân trang */}
                {filteredUsers.length > 0 && (
                    <div className="shrink-0 px-3 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-between">
                        <span>
                            Hiển thị {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredUsers.length)}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} / {filteredUsers.length} người dùng
                        </span>
                        {totalPages > 1 && (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-2 py-1 rounded border border-gray-300 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    ‹
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-2 py-1 rounded border ${
                                            currentPage === page
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'border-gray-300 hover:bg-white'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-2 py-1 rounded border border-gray-300 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    ›
                                </button>
                            </div>
                        )}
                        <span>{users.length} tổng số tài khoản</span>
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
