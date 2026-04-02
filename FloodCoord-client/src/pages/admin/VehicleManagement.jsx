import React, { useState, useEffect, useMemo, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { vehicleApi } from '../../services/vehicleApi';
import { Ship, Truck, Plane, Activity, Bus, AlertCircle, Plus, FileDown } from 'lucide-react';
import toast from 'react-hot-toast';
import StatCard from '../../components/coordinator/StatCard';
import TableActionCell from '../../components/shared/table/TableActionCell';
import {
    VEHICLE_TYPES,
    VEHICLE_STATUSES,
    getVehicleTypeMeta,
    getVehicleStatusMeta,
} from '../../components/shared/styleMaps';
import {
    TruckIcon,
    CheckCircleIcon,
    ClockIcon,
    WrenchScrewdriverIcon,
    ArrowPathIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
    EyeIcon,
    PencilSquareIcon,
    TrashIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

// ── Admin color palette ──────────────────────────────────────────────────────
const C = {
    primary: '#1c1c18',
    primaryHover: '#3a3a32',
    primarySoft: '#f5f4ef',
    accent: '#e85d26',
    success: '#16a34a',
    successHover: '#15803d',
    border: '#e2e8f0',
    textMain: '#0d2240',
    textMuted: '#64748b',
    textFaint: '#9ab8d4',
}

const ITEMS_PER_PAGE = 10;

const STATUS_FILTER_TABS = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'AVAILABLE', label: 'Sẵn sàng' },
    { key: 'IN_USE', label: 'Đang hoạt động' },
    { key: 'MAINTENANCE', label: 'Bảo trì' },
    { key: 'UNAVAILABLE', label: 'Không khả dụng' },
];

function TypeIcon({ type, size = 16 }) {
    const props = { size, strokeWidth: 1.5 };
    switch (type) {
        case 'BOAT': return <Ship      {...props} style={{ color: '#1e3a8a' }} />;
        case 'TRUCK': return <Truck     {...props} style={{ color: C.textMuted }} />;
        case 'HELICOPTER': return <Plane     {...props} style={{ color: '#9a3a10' }} />;
        case 'AMBULANCE': return <Activity  {...props} style={{ color: '#9a3a10' }} />;
        case 'RESCUE_VAN': return <Bus       {...props} style={{ color: '#0f4c35' }} />;
        default: return <Truck     {...props} />;
    }
}

export default function AdminVehicleManagement() {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPagesMeta, setTotalPagesMeta] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [formData, setFormData] = useState({
        name: '', type: 'BOAT', licensePlate: '', capacity: '', status: 'AVAILABLE',
    });

    const fetchVehicles = useCallback(async (page = currentPage) => {
        try {
            setLoading(true);
            const data = await vehicleApi.getAllVehicles(page - 1, ITEMS_PER_PAGE);
            const vehicleList = Array.isArray(data) ? data : (data?.content || []);
            setVehicles(vehicleList);
            setTotalPagesMeta(Number.isInteger(data?.totalPages) ? data.totalPages : (vehicleList.length > 0 ? 1 : 0));
            setTotalElements(Number.isInteger(data?.totalElements) ? data.totalElements : vehicleList.length);
            if (Number.isInteger(data?.number)) {
                setCurrentPage(data.number + 1);
            }
            setError('');
        } catch {
            setError('Không thể tải danh sách phương tiện.');
        } finally { setLoading(false); }
    }, [currentPage]);

    useEffect(() => { fetchVehicles(currentPage); }, [currentPage, fetchVehicles]);
    useEffect(() => { setCurrentPage(1); }, [statusFilter, searchTerm]);

    // ─── Stats ────────────────────────────────────────────────────────────────
    const stats = useMemo(() => ({
        total: vehicles.length,
        available: vehicles.filter(v => v.status === 'AVAILABLE').length,
        inUse: vehicles.filter(v => v.status === 'IN_USE').length,
        maintenance: vehicles.filter(v => ['MAINTENANCE', 'UNAVAILABLE'].includes(v.status)).length,
    }), [vehicles]);

    const statusCounts = useMemo(() => ({
        ALL: vehicles.length,
        AVAILABLE: vehicles.filter(v => v.status === 'AVAILABLE').length,
        IN_USE: vehicles.filter(v => v.status === 'IN_USE').length,
        MAINTENANCE: vehicles.filter(v => v.status === 'MAINTENANCE').length,
        UNAVAILABLE: vehicles.filter(v => v.status === 'UNAVAILABLE').length,
    }), [vehicles]);

    // ─── Filtered + Paginated ─────────────────────────────────────────────────
    const filtered = useMemo(() => vehicles.filter(v => {
        const matchStatus = statusFilter === 'ALL' || v.status === statusFilter;
        const term = searchTerm.toLowerCase();
        const matchSearch = !searchTerm ||
            v.name?.toLowerCase().includes(term) ||
            v.licensePlate?.toLowerCase().includes(term) ||
            v.type?.toLowerCase().includes(term);
        return matchStatus && matchSearch;
    }), [vehicles, statusFilter, searchTerm]);

    const totalPages = Math.max(totalPagesMeta, 1);
    const paginated = filtered;

    // ─── CRUD ─────────────────────────────────────────────────────────────────
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData({ name: '', type: 'BOAT', licensePlate: '', capacity: '', status: 'AVAILABLE' });
        setEditingVehicle(null);
    };

    const openCreateModal = () => { resetForm(); setShowModal(true); };

    const handleEdit = (vehicle) => {
        setEditingVehicle(vehicle);
        setFormData({
            name: vehicle.name, type: vehicle.type, licensePlate: vehicle.licensePlate,
            capacity: vehicle.capacity.toString(), status: vehicle.status,
        });
        setShowModal(true);
    };

    const handleDelete = async (vehicle) => {
        if (vehicle.status === 'IN_USE') { toast.error('Không thể vô hiệu hóa phương tiện đang hoạt động!'); return; }
        if (!window.confirm(`Bạn có chắc muốn vô hiệu hóa "${vehicle.name}"?\nPhương tiện sẽ được đặt sang trạng thái Không khả dụng.`)) return;
        try {
            await vehicleApi.deleteVehicle(vehicle.id); await fetchVehicles(); setError('');
            toast.success(`Đã vô hiệu hóa "${vehicle.name}" thành công!`);
        } catch (err) {
            const msg = err.response?.data?.message || 'Không thể vô hiệu hóa phương tiện.';
            setError(msg); toast.error(msg);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: formData.name, type: formData.type, licensePlate: formData.licensePlate,
                capacity: parseInt(formData.capacity), status: formData.status,
            };
            if (editingVehicle) await vehicleApi.updateVehicle(editingVehicle.id, payload);
            else await vehicleApi.createVehicle(payload);
            await fetchVehicles(); setShowModal(false); resetForm(); setError('');
        } catch (err) { setError(err.response?.data?.message || 'Không thể lưu thông tin phương tiện.'); }
    };

    const exportToExcel = () => {
        const exportData = vehicles.map((v, idx) => ({
            'STT': idx + 1,
            'Tên phương tiện': v.name || '',
            'Loại': getVehicleTypeMeta(v.type, 'admin').label,
            'Biển số': v.licensePlate || '',
            'Sức chứa (người)': v.capacity ?? '',
            'Trạng thái': getVehicleStatusMeta(v.status, 'admin').label,
            'Đội đang dùng': v.currentTeamName || 'Không có',
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);

        // Căn chỉnh độ rộng cột
        worksheet['!cols'] = [{ wch: 5 }, { wch: 28 }, { wch: 16 }, { wch: 16 }, { wch: 18 }, { wch: 20 }, { wch: 28 }];
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Phương tiện');
        XLSX.writeFile(workbook, `Danh_sach_phuong_tien_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.xlsx`);
    };

    {/* Shared modal input style */ }
    const modalInput = "w-full px-3 py-2 rounded-lg text-sm outline-none transition-all focus:ring-2 focus:ring-[#1c1c18]/20 focus:border-[#1c1c18]";
    const modalInputStyle = { border: `1px solid ${C.border}` };

    return (
        <div className="h-full flex flex-col p-4 gap-3 overflow-hidden">
            {/* ── Header ── */}
            <div className="shrink-0 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold" style={{ color: C.textMain }}>Quản lý Phương tiện</h1>
                    <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>Xem và quản lý toàn bộ phương tiện cứu hộ trong hệ thống.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={fetchVehicles} disabled={loading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg disabled:opacity-60 transition-colors"
                        style={{ background: '#f4f6fa', color: C.textMuted, border: `1px solid ${C.border}` }}>
                        <ArrowPathIcon className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Làm mới
                    </button>
                    <button onClick={exportToExcel} disabled={vehicles.length === 0}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-semibold rounded-lg disabled:opacity-50 transition-colors"
                        style={{ background: C.success }}
                        onMouseEnter={e => e.currentTarget.style.background = C.successHover}
                        onMouseLeave={e => e.currentTarget.style.background = C.success}>
                        <FileDown size={13} /> Xuất Excel
                    </button>
                    <button onClick={openCreateModal}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-semibold rounded-lg transition-colors"
                        style={{ background: C.primary }}
                        onMouseEnter={e => e.currentTarget.style.background = C.primaryHover}
                        onMouseLeave={e => e.currentTarget.style.background = C.primary}>
                        <Plus size={13} /> Thêm phương tiện
                    </button>
                </div>
            </div>

            {/* ── Stat Cards ── */}
            <div className="shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard icon={<TruckIcon className="h-6 w-6" />} count={stats.total} label="Tổng phương tiện" color="blue" />
                <StatCard icon={<CheckCircleIcon className="h-6 w-6" />} count={stats.available} label="Sẵn sàng" color="green" />
                <StatCard icon={<ClockIcon className="h-6 w-6" />} count={stats.inUse} label="Đang hoạt động" color="yellow" />
                <StatCard icon={<WrenchScrewdriverIcon className="h-6 w-6" />} count={stats.maintenance} label="Bảo trì / Hỏng" color="red" />
            </div>

            {/* ── Filter & Search ── */}
            <div className="shrink-0 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                <div className="relative flex-1 max-w-sm">
                    <MagnifyingGlassIcon className="absolute left-2.5 top-2 h-3.5 w-3.5" style={{ color: C.textFaint }} />
                    <input type="text" placeholder="Tìm tên, biển số, loại xe..."
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-8 pr-8 py-1.5 rounded-lg text-xs outline-none focus:ring-2 focus:ring-admin/20 focus:border-admin"
                        style={{ border: `1px solid ${C.border}` }} />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-2" style={{ color: C.textFaint }}>
                            <XMarkIcon className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
                <div className="flex gap-0.5 p-0.5 rounded-lg flex-wrap" style={{ background: '#f4f6fa' }}>
                    {STATUS_FILTER_TABS.map(tab => (
                        <button key={tab.key} onClick={() => setStatusFilter(tab.key)}
                            className="px-2.5 py-1 text-xs font-medium rounded-md transition-colors"
                            style={{
                                background: statusFilter === tab.key ? '#fff' : 'transparent',
                                color: statusFilter === tab.key ? C.primary : C.textMuted,
                                boxShadow: statusFilter === tab.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                            }}>
                            {tab.label}
                            <span className="ml-1" style={{ color: C.textFaint }}>({statusCounts[tab.key]})</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Error ── */}
            {error && (
                <div className="shrink-0 p-3 rounded-lg flex items-center gap-2 text-xs"
                    style={{ background: '#fff0ed', border: `1px solid #ffd5c2`, color: '#9a3a10' }}>
                    <AlertCircle size={15} /> {error}
                </div>
            )}

            {/* ── Table ── */}
            <div className="flex-1 min-h-0 bg-white rounded-lg flex flex-col overflow-hidden"
                style={{ border: `1px solid ${C.border}` }}>
                <div className="flex-1 min-h-0 overflow-auto">
                    <table className="w-full text-xs">
                        <thead className="sticky top-0 z-10">
                            <tr style={{ background: '#f4f6fa', borderBottom: `1px solid ${C.border}` }}>
                                {['#', 'Tên phương tiện', 'Loại', 'Biển số', 'Sức chứa', 'Trạng thái', 'Hành động'].map((h, i) => (
                                    <th key={i} className={`px-3 py-2 font-semibold text-left ${[4, 5, 6].includes(i) ? 'text-center' : ''}`}
                                        style={{ color: C.textMuted, width: [40, 288, 128, 128, 112, 144, 112][i] }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y" style={{ borderColor: '#f4f6fa' }}>
                            {loading ? (
                                <tr><td colSpan={7} className="py-12 text-center" style={{ color: C.textFaint }}>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: C.primary }} />
                                        <span>Đang tải phương tiện...</span>
                                    </div>
                                </td></tr>
                            ) : paginated.length === 0 ? (
                                <tr><td colSpan={7} className="py-12 text-center" style={{ color: C.textFaint }}>
                                    <TruckIcon className="h-8 w-8 mx-auto mb-2 opacity-40" />
                                    <p>{vehicles.length === 0 ? 'Chưa có phương tiện nào.' : 'Không tìm thấy phương tiện nào.'}</p>
                                    {(statusFilter !== 'ALL' || searchTerm) && (
                                        <button onClick={() => { setStatusFilter('ALL'); setSearchTerm(''); }}
                                            className="mt-1 text-xs hover:underline" style={{ color: C.primary }}>
                                            Xóa bộ lọc
                                        </button>
                                    )}
                                </td></tr>
                            ) : paginated.map((vehicle, index) => {
                                const typeInfo = getVehicleTypeMeta(vehicle.type, 'admin');
                                const statusInfo = getVehicleStatusMeta(vehicle.status, 'admin');
                                return (
                                    <tr key={vehicle.id} className="hover:bg-admin-50 transition-colors">
                                        <td className="px-3 py-2 font-mono" style={{ color: C.textFaint }}>
                                            {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                        </td>
                                        <td className="px-3 py-2 min-w-60">
                                            <div className="flex items-center gap-2">
                                                <TypeIcon type={vehicle.type} size={15} />
                                                <span className="font-medium truncate" style={{ color: C.textMain }}>{vehicle.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2">
                                            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                                                style={{ background: typeInfo.bg, color: typeInfo.color }}>
                                                {typeInfo.label}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2">
                                            <span className="font-mono font-semibold px-2 py-0.5 rounded text-xs"
                                                style={{ background: '#f4f6fa', color: C.textMain }}>
                                                {vehicle.licensePlate}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <span className="font-semibold" style={{ color: C.textMain }}>{vehicle.capacity}</span>
                                            <span className="ml-1" style={{ color: C.textFaint }}>người</span>
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
                                                style={{ background: statusInfo.bg, color: statusInfo.color }}>
                                                <span className="w-1.5 h-1.5 rounded-full"
                                                    style={{
                                                        background: statusInfo.dot,
                                                        animation: vehicle.status === 'IN_USE' ? 'pulse 2s infinite' : 'none'
                                                    }} />
                                                {statusInfo.label}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2">
                                            <TableActionCell
                                                variant="admin"
                                                theme={{ textMuted: C.textMuted }}
                                                actions={[
                                                    {
                                                        key: 'view',
                                                        title: 'Xem chi tiết',
                                                        icon: EyeIcon,
                                                        onClick: () => { setSelectedVehicle(vehicle); setShowDetailModal(true); },
                                                        tone: 'view',
                                                    },
                                                    {
                                                        key: 'edit',
                                                        title: 'Chỉnh sửa',
                                                        icon: PencilSquareIcon,
                                                        onClick: () => handleEdit(vehicle),
                                                        tone: 'edit',
                                                    },
                                                    {
                                                        key: 'delete',
                                                        title: vehicle.status === 'IN_USE' ? 'Không thể vô hiệu hóa khi đang hoạt động' : 'Vô hiệu hóa',
                                                        icon: TrashIcon,
                                                        onClick: () => handleDelete(vehicle),
                                                        tone: 'delete',
                                                        disabled: vehicle.status === 'IN_USE',
                                                    },
                                                ]}
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* ── Pagination ── */}
                {filtered.length > 0 && (
                    <div className="shrink-0 px-3 py-2 border-t text-xs flex items-center justify-between"
                        style={{ background: '#f4f6fa', borderColor: C.border, color: C.textMuted }}>
                        <span>
                            Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min((currentPage - 1) * ITEMS_PER_PAGE + paginated.length, totalElements)} / {totalElements} phương tiện
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
                        <span>{totalElements} kết quả</span>
                    </div>
                )}
            </div>

            {/* ── Detail Modal ── */}
            {showDetailModal && selectedVehicle && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
                    style={{ background: 'rgba(13,34,64,0.55)', backdropFilter: 'blur(3px)' }}>
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
                        style={{ border: `1px solid ${C.border}` }}>
                        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: C.border }}>
                            <h2 className="text-base font-semibold" style={{ color: C.textMain }}>Chi tiết phương tiện</h2>
                            <button onClick={() => setShowDetailModal(false)}
                                className="p-1.5 rounded-lg transition-colors hover:bg-admin-50">
                                <XMarkIcon className="h-5 w-5" style={{ color: C.textMuted }} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-lg" style={{ background: '#f4f6fa', border: `1px solid ${C.border}` }}>
                                    <TypeIcon type={selectedVehicle.type} size={32} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold" style={{ color: C.textMain }}>{selectedVehicle.name}</h3>
                                    <p className="text-xs uppercase tracking-wider" style={{ color: C.textMuted }}>
                                        {getVehicleTypeMeta(selectedVehicle.type, 'admin').label}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                {[
                                    { label: 'Biển số', value: <span className="font-mono font-bold" style={{ color: C.textMain }}>{selectedVehicle.licensePlate}</span> },
                                    { label: 'Sức chứa', value: <span className="font-bold" style={{ color: C.textMain }}>{selectedVehicle.capacity} <span style={{ color: C.textMuted, fontWeight: 400 }}>người</span></span> },
                                ].map(({ label, value }) => (
                                    <div key={label} className="rounded-lg p-3" style={{ background: '#f4f6fa' }}>
                                        <p className="text-xs mb-1" style={{ color: C.textFaint }}>{label}</p>
                                        {value}
                                    </div>
                                ))}
                                <div className="rounded-lg p-3 col-span-2" style={{ background: '#f4f6fa' }}>
                                    <p className="text-xs mb-1" style={{ color: C.textFaint }}>Trạng thái</p>
                                    {(() => {
                                        const s = getVehicleStatusMeta(selectedVehicle.status, 'admin');
                                        return (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                                                style={{ background: s.bg, color: s.color }}>
                                                <span className="w-2 h-2 rounded-full" style={{ background: s.dot }} />
                                                {s.label}
                                            </span>
                                        );
                                    })()}
                                </div>
                                <div className="rounded-lg p-3 col-span-2" style={{ background: '#f4f6fa' }}>
                                    <p className="text-xs mb-1" style={{ color: C.textFaint }}>Đội đang sử dụng</p>
                                    {selectedVehicle.currentTeamName ? (
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#2563eb' }} />
                                            <p className="font-semibold" style={{ color: '#1a3a5c' }}>{selectedVehicle.currentTeamName}</p>
                                        </div>
                                    ) : (
                                        <p className="italic text-sm" style={{ color: C.textFaint }}>Không có đội nào đang sử dụng</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="px-6 pb-5 flex gap-3">
                            <button onClick={() => setShowDetailModal(false)}
                                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                                style={{ background: '#f4f6fa', color: C.textMuted }}>
                                Đóng
                            </button>
                            <button onClick={() => { setShowDetailModal(false); handleEdit(selectedVehicle); }}
                                className="flex-1 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors"
                                style={{ background: C.primary }}
                                onMouseEnter={e => e.currentTarget.style.background = C.primaryHover}
                                onMouseLeave={e => e.currentTarget.style.background = C.primary}>
                                Chỉnh sửa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Form Modal (Create / Edit) ── */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
                    style={{ background: 'rgba(13,34,64,0.55)', backdropFilter: 'blur(3px)' }}>
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden"
                        style={{ border: `1px solid ${C.border}` }}>
                        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: C.border }}>
                            <h2 className="text-base font-semibold" style={{ color: C.textMain }}>
                                {editingVehicle ? 'Cập nhật phương tiện' : 'Thêm phương tiện mới'}
                            </h2>
                            <button onClick={() => { setShowModal(false); resetForm(); }}
                                className="p-1.5 rounded-lg transition-colors hover:bg-admin-50">
                                <XMarkIcon className="h-5 w-5" style={{ color: C.textMuted }} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {editingVehicle?.status === 'IN_USE' && (
                                <div className="rounded-lg p-3 flex items-start gap-2 text-xs"
                                    style={{ background: '#fefce8', border: `1px solid #fde047` }}>
                                    <ExclamationTriangleIcon className="h-4 w-4 mt-0.5 shrink-0" style={{ color: '#78350f' }} />
                                    <p style={{ color: '#78350f' }}>Phương tiện đang hoạt động — không thể thay đổi trạng thái.</p>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium mb-1" style={{ color: C.textMain }}>Tên phương tiện</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required
                                        placeholder="VD: Cano Cứu Hộ 01"
                                        className={modalInput} style={modalInputStyle} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: C.textMain }}>Loại xe</label>
                                    <select name="type" value={formData.type} onChange={handleInputChange}
                                        className={modalInput} style={modalInputStyle}>
                                        {VEHICLE_TYPES.map(t => <option key={t} value={t}>{getVehicleTypeMeta(t, 'admin').label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: C.textMain }}>Biển số</label>
                                    <input type="text" name="licensePlate" value={formData.licensePlate} onChange={handleInputChange}
                                        required placeholder="29C-123.45" className={modalInput} style={modalInputStyle} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: C.textMain }}>Sức chứa (người)</label>
                                    <input type="number" name="capacity" value={formData.capacity} onChange={handleInputChange}
                                        required min={1} className={modalInput} style={modalInputStyle} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1" style={{ color: C.textMain }}>Trạng thái</label>
                                    <select name="status" value={formData.status} onChange={handleInputChange}
                                        disabled={editingVehicle?.status === 'IN_USE'}
                                        className={`${modalInput} disabled:opacity-50 disabled:cursor-not-allowed`}
                                        style={modalInputStyle}>
                                        {VEHICLE_STATUSES.map(s => <option key={s} value={s}>{getVehicleStatusMeta(s, 'admin').label}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => { setShowModal(false); resetForm(); }}
                                    className="flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                                    style={{ background: '#f4f6fa', color: C.textMuted }}>
                                    Hủy
                                </button>
                                <button type="submit"
                                    className="flex-1 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors"
                                    style={{ background: C.primary }}
                                    onMouseEnter={e => e.currentTarget.style.background = C.primaryHover}
                                    onMouseLeave={e => e.currentTarget.style.background = C.primary}>
                                    {editingVehicle ? 'Lưu thay đổi' : 'Thêm mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
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
