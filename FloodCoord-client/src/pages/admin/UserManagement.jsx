import React, { useState, useEffect, useMemo, useRef } from 'react'; // Thêm useRef
import { adminUserApi } from '../../services/adminUserApi';
import { importApi } from '../../services/importApi'; // Import thêm importApi
import { AlertCircle } from 'lucide-react';
import UserFormModal from '../../components/admin/UserFormModal';
import UserDetailModal from '../../components/admin/UserDetailModal';
import StatCard from '../../components/coordinator/StatCard';
import { toast } from 'react-hot-toast'; // Giả định bạn dùng react-hot-toast
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
    DocumentArrowUpIcon, // Icon mới
    DocumentArrowDownIcon, // Icon mới
} from '@heroicons/react/24/outline';

// ── Admin color palette ──────────────────────────────────────────────────────
const C = {
    primary: '#1c1c18',
    primaryHover: '#3a3a32',
    primarySoft: '#f5f4ef',
    accent: '#e85d26',
    border: '#e2e8f0',
    textMain: '#0d2240',
    textMuted: '#64748b',
    textFaint: '#9ab8d4',
}

// Role badges
const ROLE_BADGE = {
    ADMIN: { bg: '#f5f4ef', color: '#1c1c18', border: '#d4d4c8' },
    MANAGER: { bg: '#f5f3ff', color: '#312070', border: '#ddd6fe' },
    COORDINATOR: { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
    RESCUE_TEAM: { bg: '#f0f9f4', color: '#0f4c35', border: '#a7f3d0' },
    MEMBER: { bg: '#f0f6ff', color: '#1a3a5c', border: '#c8d8ec' },
    CITIZEN: { bg: '#f0f6ff', color: '#1a3a5c', border: '#c8d8ec' },
};

const ITEMS_PER_PAGE = 10;

// ... (Các hàm compareUserId, preserveUserOrder, getDeleteUserErrorMessage giữ nguyên)
const compareUserId = (a, b) => {
    const na = Number(a), nb = Number(b);
    if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
    return String(a).localeCompare(String(b));
};

const preserveUserOrder = (incoming, previous) => {
    const prevIdx = new Map(previous.map((u, i) => [u.id, i]));
    return [...incoming].sort((a, b) => {
        const ai = prevIdx.has(a.id) ? prevIdx.get(a.id) : Number.MAX_SAFE_INTEGER;
        const bi = prevIdx.has(b.id) ? prevIdx.get(b.id) : Number.MAX_SAFE_INTEGER;
        return ai !== bi ? ai - bi : compareUserId(a.id, b.id);
    });
};

const getDeleteUserErrorMessage = (error) => {
    const responseData = error?.response?.data;
    const rawMessage = (typeof responseData === 'string' && responseData) || responseData?.message || responseData?.error || error?.message || '';
    const normalized = rawMessage.toLowerCase();
    if (normalized.includes('violates foreign key constraint') || normalized.includes('is still referenced from table')) {
        return 'Không thể xóa tài khoản này vì đang có dữ liệu liên kết. Vui lòng vô hiệu hóa tài khoản thay vì xóa.';
    }
    return responseData?.message || 'Không thể xóa người dùng. Vui lòng thử lại sau.';
};

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [importing, setImporting] = useState(false); // Trạng thái đang import
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPagesMeta, setTotalPagesMeta] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const userFileRef = useRef(null); // Ref cho input file

    const fetchUsers = async (page = currentPage) => {
        try {
            setLoading(true);
            const data = await adminUserApi.getAllUsers(page - 1, ITEMS_PER_PAGE);
            const usersData = Array.isArray(data) ? data : (data?.content || []);
            setUsers(prev => preserveUserOrder(usersData, prev));
            setTotalPagesMeta(Number.isInteger(data?.totalPages) ? data.totalPages : (usersData.length > 0 ? 1 : 0));
            setTotalElements(Number.isInteger(data?.totalElements) ? data.totalElements : usersData.length);
            if (Number.isInteger(data?.number)) {
                setCurrentPage(data.number + 1);
            }
            setError('');
        } catch {
            setError('Không thể tải danh sách người dùng. Vui lòng kiểm tra kết nối với server.');
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchUsers(currentPage); }, [currentPage]);

    // ─── XỬ LÝ IMPORT EXCEL ───────────────────────────────────────────────────
    const handleImportExcel = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImporting(true);
        const toastId = toast.loading("Đang xử lý file Excel...");
        try {
            await importApi.user.importExcel(file);
            toast.success("Nhập danh sách người dùng thành công!", { id: toastId });
            fetchUsers(); // Tải lại danh sách sau khi import
        } catch (err) {
            toast.error(err.response?.data || "Lỗi khi import file Excel!", { id: toastId });
        } finally {
            setImporting(false);
            e.target.value = ''; // Reset input
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            const response = await importApi.user.getTemplate();
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Mau_Import_Nguoi_Dung.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
              toast.error(err.response?.data || 'Lỗi không thể tải file mẫu');
        }
    };

    // ─── CRUD HANDLERS ────────────────────────────────────────────────────────
    const handleEdit = (user) => { setEditingUser(user); setShowModal(true); };
    const handleView = (user) => { setSelectedUser(user); setShowDetailModal(true); };
    const openCreateModal = () => { setEditingUser(null); setShowModal(true); };

    const handleDelete = async (userId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.')) return;
        try { await adminUserApi.deleteUser(userId); await fetchUsers(); setError(''); }
        catch (err) { setError(getDeleteUserErrorMessage(err)); }
    };

    useEffect(() => { setCurrentPage(1); }, [roleFilter, searchTerm]);

    const stats = useMemo(() => ({
        total: users.length,
        active: users.filter(u => u.status).length,
        inactive: users.filter(u => !u.status).length,
        roles: [...new Set(users.map(u => u.roleName))].length,
    }), [users]);

    const filteredUsers = useMemo(() => users.filter(user => {
        const matchSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchRole = roleFilter === 'ALL' || user.roleName === roleFilter;
        return matchSearch && matchRole;
    }), [users, searchTerm, roleFilter]);

    const uniqueRoles = useMemo(() => [...new Set(users.map(u => u.roleName))], [users]);
    const totalPages = Math.max(totalPagesMeta, 1);
    const paginatedUsers = filteredUsers;

    const getRoleBadge = (roleName) => ROLE_BADGE[roleName] || ROLE_BADGE.CITIZEN;


    return (
        <div className="h-full flex flex-col p-6 gap-4">
            {/* Header */}
            <div className="flex items-start justify-between shrink-0">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: C.textMain }}>Quản lý Người dùng</h1>
                    <p className="text-sm mt-0.5" style={{ color: C.textMuted }}>Quản lý tài khoản và phân quyền hệ thống.</p>
                </div>
                
                <div className="flex items-center gap-2">
                    {/* Hidden File Input */}
                    <input type="file" ref={userFileRef} className="hidden" accept=".xlsx, .xls" onChange={handleImportExcel} />
                    
                    {/* Import Button Group */}
                    <div className="flex items-center gap-1 mr-2 bg-white p-1 rounded-lg border border-gray-200">
                        <button
                            onClick={() => userFileRef.current.click()}
                            disabled={importing}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors disabled:opacity-50"
                        >
                            <DocumentArrowUpIcon className="h-4 w-4" />
                            Import Excel
                        </button>
                        <button
                            onClick={handleDownloadTemplate}
                            className="p-1.5 text-gray-400 hover:text-blue-600 rounded-md transition-colors"
                            title="Tải file mẫu Excel"
                        >
                            <DocumentArrowDownIcon className="h-4 w-4" />
                        </button>
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors shadow-sm shadow-black/20"
                        style={{ background: C.primary }}
                        onMouseEnter={e => e.currentTarget.style.background = C.primaryHover}
                        onMouseLeave={e => e.currentTarget.style.background = C.primary}
                    >
                        <PlusIcon className="h-4 w-4" /> Tạo tài khoản mới
                    </button>
                </div>
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
                    <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.textFaint }} />
                    <input
                        type="text" placeholder="Tìm kiếm theo tên hoặc email..."
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-9 py-2 rounded-lg text-sm outline-none transition-all focus:ring-2 focus:ring-admin/20 focus:border-admin"
                        style={{ border: `1px solid ${C.border}` }}
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2"
                            style={{ color: C.textFaint }}>
                            <XMarkIcon className="h-4 w-4" />
                        </button>
                    )}
                </div>
                <select
                    value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                    className="px-3 py-2 rounded-lg text-sm outline-none transition-all focus:ring-2 focus:ring-admin/20 focus:border-admin bg-white"
                    style={{ border: `1px solid ${C.border}`, color: C.textMain }}
                >
                    <option value="ALL">Tất cả vai trò</option>
                    {uniqueRoles.map(role => <option key={role} value={role}>{role}</option>)}
                </select>
            </div>

            {/* Error */}
            {error && (
                <div className="shrink-0 p-4 rounded-lg flex items-center gap-3 text-sm"
                    style={{ background: '#fff0ed', border: `1px solid #ffd5c2`, color: '#9a3a10' }}>
                    <AlertCircle size={18} /> {error}
                </div>
            )}

            {/* Table */}
            <div className="flex-1 min-h-0 bg-white rounded-lg flex flex-col overflow-hidden"
                style={{ border: `1px solid ${C.border}` }}>
                <div className="flex-1 min-h-0 overflow-auto">
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <ArrowPathIcon className="h-7 w-7 animate-spin" style={{ color: C.primary }} />
                        </div>
                    ) : (
                        <table className="w-full text-xs text-left">
                            <thead className="sticky top-0 z-10">
                                <tr style={{ background: '#f4f6fa', borderBottom: `1px solid ${C.border}` }}>
                                    {['#', 'Họ tên', 'Email', 'Vai trò', 'Trạng thái', 'Hành động'].map((h, i) => (
                                        <th key={i}
                                            className={`px-3 py-2 font-semibold ${[3, 4, 5].includes(i) ? 'text-center' : 'text-left'}`}
                                            style={{ color: C.textMuted, width: [40, 208, 256, 128, 128, 112][i] }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: '#f4f6fa' }}>
                                {paginatedUsers.map((user, index) => {
                                    const badge = getRoleBadge(user.roleName);
                                    return (
                                        <tr key={user.id} className="hover:bg-admin-50 transition-colors">
                                            <td className="px-3 py-2 font-mono" style={{ color: C.textFaint }}>
                                                {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                            </td>
                                            <td className="px-3 py-2 min-w-52">
                                                <p className="font-medium truncate" style={{ color: C.textMain }}>{user.fullName}</p>
                                            </td>
                                            <td className="px-3 py-2 max-w-64 truncate" style={{ color: C.textMuted }}>{user.email}</td>
                                            <td className="px-3 py-2 text-center">
                                                <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold border"
                                                    style={{ background: badge.bg, color: badge.color, borderColor: badge.border }}>
                                                    {user.roleName}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                {user.status ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
                                                        style={{ background: '#edfbf3', color: '#14532d' }}>
                                                        <span className="h-1.5 w-1.5 rounded-full bg-success" />
                                                        Hoạt động
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
                                                        style={{ background: '#fff0ed', color: '#9a3a10' }}>
                                                        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                                                        Vô hiệu hóa
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="flex items-center justify-center gap-0.5">
                                                    <ActionBtn title="Xem chi tiết" hoverBg="#f0f6ff" hoverColor="#1a3a5c"
                                                        onClick={() => handleView(user)}>
                                                        <EyeIcon className="h-4 w-4" />
                                                    </ActionBtn>
                                                    <ActionBtn title="Chỉnh sửa" hoverBg="#fefce8" hoverColor="#78350f"
                                                        onClick={() => handleEdit(user)}>
                                                        <PencilSquareIcon className="h-4 w-4" />
                                                    </ActionBtn>
                                                    <ActionBtn title="Xóa tài khoản" hoverBg="#fff0ed" hoverColor="#9a3a10"
                                                        onClick={() => handleDelete(user.id)}>
                                                        <TrashIcon className="h-4 w-4" />
                                                    </ActionBtn>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}

                    {/* Empty state */}
                    {!loading && filteredUsers.length === 0 && (
                        <div className="text-center py-12" style={{ color: C.textFaint }}>
                            <UsersIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-xs">
                                {searchTerm || roleFilter !== 'ALL'
                                    ? 'Không tìm thấy người dùng phù hợp.'
                                    : 'Chưa có người dùng nào.'}
                            </p>
                        </div>
                    )}
                </div>

                {/* ── Pagination ── */}
                {filteredUsers.length > 0 && (
                    <div className="shrink-0 px-3 py-2 border-t text-xs flex items-center justify-between"
                        style={{ background: '#f4f6fa', borderColor: C.border, color: C.textMuted }}>
                        <span>
                            Hiển thị {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalElements)}–{Math.min((currentPage - 1) * ITEMS_PER_PAGE + paginatedUsers.length, totalElements)} / {totalElements} người dùng
                        </span>
                        {totalPages > 1 && (
                            <div className="flex items-center gap-1">
                                <PaginationBtn onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>‹</PaginationBtn>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <PaginationBtn key={page} onClick={() => setCurrentPage(page)} active={currentPage === page}>{page}</PaginationBtn>
                                ))}
                                <PaginationBtn onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>›</PaginationBtn>
                            </div>
                        )}
                        <span>{totalElements} tổng số tài khoản</span>
                    </div>
                )}
            </div>

            {/* Modals */}
            {showModal && (
                <UserFormModal
                    editingUser={editingUser}
                    onClose={() => setShowModal(false)}
                    onSuccess={fetchUsers}
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

function ActionBtn({ children, onClick, title, hoverBg, hoverColor }) {
    const [hovered, setHovered] = React.useState(false);
    return (
        <button title={title} onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="p-1 rounded transition-colors"
            style={{ color: hovered ? hoverColor : '#64748b', background: hovered ? hoverBg : 'transparent' }}>
            {children}
        </button>
    );
}

function PaginationBtn({ children, onClick, disabled, active }) {
    return (
        <button onClick={onClick} disabled={disabled}
            className="px-2 py-1 rounded border text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
                background: active ? '#1c1c18' : '#fff',
                color: active ? '#fff' : '#64748b',
                borderColor: active ? '#1c1c18' : '#e2e8f0',
            }}>
            {children}
        </button>
    );
}