import React, { useState, useEffect, useMemo, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { vehicleApi } from '../../services/vehicleApi';
import { Ship, Truck, Plane, Activity, Bus, AlertCircle, FileDown } from 'lucide-react';
import StatCard from '../../components/coordinator/StatCard';
import TableActionCell from '../../components/shared/table/TableActionCell';
import {
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
} from '@heroicons/react/24/outline';

const ITEMS_PER_PAGE = 10;

const STATUS_FILTER_TABS = [
    { key: 'ALL',         label: 'Tất cả' },
    { key: 'AVAILABLE',   label: 'Sẵn sàng' },
    { key: 'IN_USE',      label: 'Đang hoạt động' },
    { key: 'MAINTENANCE', label: 'Bảo trì' },
    { key: 'UNAVAILABLE', label: 'Không khả dụng' },
];

function TypeIcon({ type, size = 16 }) {
    const props = { size, strokeWidth: 1.5 };
    switch (type) {
        case 'BOAT':       return <Ship {...props} className="text-blue-600" />;
        case 'TRUCK':      return <Truck {...props} className="text-slate-600" />;
        case 'HELICOPTER': return <Plane {...props} className="text-orange-600" />;
        case 'AMBULANCE':  return <Activity {...props} className="text-red-600" />;
        case 'RESCUE_VAN': return <Bus {...props} className="text-teal-600" />;
        default:           return <Truck {...props} />;
    }
}

export default function ViewVehicles() {
    const [vehicles, setVehicles]               = useState([]);
    const [loading, setLoading]                 = useState(true);
    const [error, setError]                     = useState('');
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [searchTerm, setSearchTerm]           = useState('');
    const [statusFilter, setStatusFilter]       = useState('ALL');
    const [currentPage, setCurrentPage]         = useState(1);

    const fetchVehicles = useCallback(async () => {
        try {
            setLoading(true);
            const data = await vehicleApi.getAllVehicles();
            setVehicles(data || []);
            setError('');
        } catch (err) {
            setError('Không thể tải danh sách phương tiện. Vui lòng kiểm tra kết nối với server.');
            console.error('Fetch vehicles error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchVehicles(); }, [fetchVehicles]);
    useEffect(() => { setCurrentPage(1); }, [statusFilter, searchTerm]);

    const stats = useMemo(() => ({
        total:       vehicles.length,
        available:   vehicles.filter(v => v.status === 'AVAILABLE').length,
        inUse:       vehicles.filter(v => v.status === 'IN_USE').length,
        maintenance: vehicles.filter(v => ['MAINTENANCE', 'UNAVAILABLE'].includes(v.status)).length,
    }), [vehicles]);

    const statusCounts = useMemo(() => ({
        ALL:         vehicles.length,
        AVAILABLE:   vehicles.filter(v => v.status === 'AVAILABLE').length,
        IN_USE:      vehicles.filter(v => v.status === 'IN_USE').length,
        MAINTENANCE: vehicles.filter(v => v.status === 'MAINTENANCE').length,
        UNAVAILABLE: vehicles.filter(v => v.status === 'UNAVAILABLE').length,
    }), [vehicles]);

    const filtered = useMemo(() => vehicles.filter(v => {
        const matchStatus = statusFilter === 'ALL' || v.status === statusFilter;
        const term = searchTerm.toLowerCase();
        const matchSearch = !searchTerm ||
            v.name?.toLowerCase().includes(term) ||
            v.licensePlate?.toLowerCase().includes(term) ||
            v.type?.toLowerCase().includes(term);
        return matchStatus && matchSearch;
    }), [vehicles, statusFilter, searchTerm]);

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated  = filtered.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
    );

    const exportToExcel = () => {
        const exportData = vehicles.map((v, idx) => ({
            'STT': idx + 1,
            'Tên phương tiện': v.name || '',
            'Loại': getVehicleTypeMeta(v.type).label,
            'Biển số': v.licensePlate || '',
            'Sức chứa (người)': v.capacity ?? '',
            'Trạng thái': getVehicleStatusMeta(v.status).label,
            'Đội đang dùng': v.currentTeamName || 'Không có',
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);

        worksheet['!cols'] = [
            { wch: 5 },
            { wch: 28 },
            { wch: 16 },
            { wch: 16 },
            { wch: 18 },
            { wch: 20 },
            { wch: 28 },
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Phương tiện');

        const today = new Date().toLocaleDateString('vi-VN').replace(/\//g, '-');
        XLSX.writeFile(workbook, `Danh_sach_phuong_tien_${today}.xlsx`);
    };

    return (
        <div className="h-full flex flex-col p-4 gap-3 overflow-hidden">
            {/* ── Header ── */}
            <div className="shrink-0 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Xem Phương Tiện</h1>
                    <p className="text-xs text-gray-500">Xem thông tin về các phương tiện cứu hộ.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchVehicles}
                        disabled={loading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-200 disabled:opacity-60 transition-colors"
                    >
                        <ArrowPathIcon className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                        Làm mới
                    </button>
                    <button
                        onClick={exportToExcel}
                        disabled={vehicles.length === 0}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-md hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                    >
                        <FileDown size={13} /> Xuất Excel
                    </button>
                </div>
            </div>

            {/* ── Stat Cards ── */}
            <div className="shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard icon={<TruckIcon className="h-6 w-6" />}             count={stats.total}       label="Tổng phương tiện" color="blue" />
                <StatCard icon={<CheckCircleIcon className="h-6 w-6" />}       count={stats.available}   label="Sẵn sàng"         color="green" />
                <StatCard icon={<ClockIcon className="h-6 w-6" />}             count={stats.inUse}       label="Đang hoạt động"   color="yellow" />
                <StatCard icon={<WrenchScrewdriverIcon className="h-6 w-6" />} count={stats.maintenance} label="Bảo trì / Hỏng"   color="red" />
            </div>

            {/* ── Filter & Search ── */}
            <div className="shrink-0 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                <div className="relative flex-1 max-w-sm">
                    <MagnifyingGlassIcon className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm tên, biển số, loại xe..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-8 pr-8 py-1.5 border border-gray-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600">
                            <XMarkIcon className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
                <div className="flex gap-0.5 bg-gray-100 p-0.5 rounded-lg flex-wrap">
                    {STATUS_FILTER_TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setStatusFilter(tab.key)}
                            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                                statusFilter === tab.key
                                    ? 'bg-white text-blue-700 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab.label}
                            <span className="ml-1 text-gray-400">({statusCounts[tab.key]})</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Error ── */}
            {error && (
                <div className="shrink-0 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2 text-xs">
                    <AlertCircle size={15} /> {error}
                </div>
            )}

            {/* ── Table ── */}
            <div className="flex-1 min-h-0 bg-white border border-gray-200 rounded-lg flex flex-col overflow-hidden">
                <div className="flex-1 min-h-0 overflow-auto">
                    <table className="w-full text-xs">
                        <thead className="sticky top-0 z-10">
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="text-left px-3 py-2 font-semibold text-gray-600 w-10">#</th>
                                <th className="text-left px-3 py-2 font-semibold text-gray-600 w-72">Tên phương tiện</th>
                                <th className="text-left px-3 py-2 font-semibold text-gray-600 w-32">Loại</th>
                                <th className="text-left px-3 py-2 font-semibold text-gray-600 w-32">Biển số</th>
                                <th className="text-center px-3 py-2 font-semibold text-gray-600 w-28">Sức chứa</th>
                                <th className="text-center px-3 py-2 font-semibold text-gray-600 w-36">Trạng thái</th>
                                <th className="text-center px-3 py-2 font-semibold text-gray-600 w-28">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                                            <span>Đang tải phương tiện...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-gray-400">
                                        <TruckIcon className="h-8 w-8 mx-auto mb-2 opacity-40" />
                                        <p>{vehicles.length === 0 ? 'Chưa có phương tiện nào.' : 'Không tìm thấy phương tiện nào.'}</p>
                                        {(statusFilter !== 'ALL' || searchTerm) && (
                                            <button
                                                onClick={() => { setStatusFilter('ALL'); setSearchTerm(''); }}
                                                className="mt-1 text-blue-600 hover:underline text-xs"
                                            >
                                                Xóa bộ lọc
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((vehicle, index) => {
                                    const typeInfo = getVehicleTypeMeta(vehicle.type);
                                    const statusInfo = getVehicleStatusMeta(vehicle.status);
                                    return (
                                        <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-3 py-2 text-gray-400 font-mono">
                                                {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                            </td>
                                            <td className="px-3 py-2 min-w-60">
                                                <div className="flex items-center gap-2">
                                                    <TypeIcon type={vehicle.type} size={15} />
                                                    <span className="font-medium text-gray-900 truncate">{vehicle.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2">
                                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${typeInfo.color}`}>
                                                    {typeInfo.label}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2">
                                                <span className="font-mono font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded text-xs">
                                                    {vehicle.licensePlate}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-center text-gray-700">
                                                <span className="font-semibold">{vehicle.capacity}</span>
                                                <span className="text-gray-400 ml-1">người</span>
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot} ${vehicle.status === 'IN_USE' ? 'animate-pulse' : ''}`} />
                                                    {statusInfo.label}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2">
                                                <TableActionCell
                                                    actions={[
                                                        {
                                                            key: 'view',
                                                            title: 'Xem chi tiết',
                                                            icon: EyeIcon,
                                                            onClick: () => { setSelectedVehicle(vehicle); setShowDetailModal(true); },
                                                            tone: 'view',
                                                        },
                                                    ]}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer phân trang */}
                {filtered.length > 0 && (
                    <div className="shrink-0 px-3 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-between">
                        <span>
                            Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} / {filtered.length} phương tiện
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
                        <span>{filtered.length} kết quả</span>
                    </div>
                )}
            </div>

            {/* ── Detail Modal ── */}
            {showDetailModal && selectedVehicle && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                            <h2 className="text-base font-semibold text-gray-900">Chi tiết phương tiện</h2>
                            <button onClick={() => setShowDetailModal(false)} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors">
                                <XMarkIcon className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                    <TypeIcon type={selectedVehicle.type} size={32} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{selectedVehicle.name}</h3>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">
                                        {getVehicleTypeMeta(selectedVehicle.type).label}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500 mb-1">Biển số</p>
                                    <p className="font-mono font-bold text-gray-800">{selectedVehicle.licensePlate}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500 mb-1">Sức chứa</p>
                                    <p className="font-bold text-gray-800">{selectedVehicle.capacity} <span className="text-gray-500 font-normal">người</span></p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 col-span-2">
                                    <p className="text-xs text-gray-500 mb-1">Trạng thái</p>
                                    {(() => {
                                        const statusInfo = getVehicleStatusMeta(selectedVehicle.status);
                                        return (
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                                <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`} />
                                                {statusInfo.label}
                                            </span>
                                        );
                                    })()}
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 col-span-2">
                                    <p className="text-xs text-gray-500 mb-1">Đội đang sử dụng</p>
                                    {selectedVehicle.currentTeamName ? (
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
                                            <p className="font-semibold text-blue-700">{selectedVehicle.currentTeamName}</p>
                                        </div>
                                    ) : (
                                        <p className="text-gray-400 italic">Không có đội nào đang sử dụng</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="px-6 pb-5 flex gap-3">
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
