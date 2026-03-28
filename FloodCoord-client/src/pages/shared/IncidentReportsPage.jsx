import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ArrowPathIcon,
    EyeIcon,
    XMarkIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ArrowRightIcon,
    PlusIcon,
    MinusIcon,
} from '@heroicons/react/24/outline';
import { incidentReportApi } from '../../services/incidentReportApi';
import { rescueTeamApi } from '../../services/rescueTeamApi';
import { vehicleApi } from '../../services/vehicleApi';
import { supplyApi } from '../../services/supplyApi';

const STATUS_META = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    RESOLVED: 'bg-green-100 text-green-800 border-green-200',
};

const ITEMS_PER_PAGE = 7;

const ACTION_META = {
    CONTINUE: 'Yêu cầu đội tiếp tục',
    ABORT: 'Hủy nhiệm vụ & Giao đội mới',
};

export default function IncidentReportsPage() {
    const [incidents, setIncidents] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedItem, setSelectedItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // --- Resolution state ---
    const [resolveNote, setResolveNote] = useState('');
    const [actionType, setActionType] = useState('CONTINUE');
    const [resolving, setResolving] = useState(false);

    // --- Post-departure flag ---
    // true = đội đã xuất phát khi sự cố xảy ra → OFF_DUTY + MAINTENANCE + vật tư không hoàn
    const [isPostDeparture, setIsPostDeparture] = useState(false);

    // --- Team ---
    const [availableTeams, setAvailableTeams] = useState([]);
    const [loadingTeams, setLoadingTeams] = useState(false);
    const [newTeamId, setNewTeamId] = useState('');

    // --- Vehicle (for new team) ---
    const [availableVehicles, setAvailableVehicles] = useState([]);
    const [loadingVehicles, setLoadingVehicles] = useState(false);
    const [newVehicleId, setNewVehicleId] = useState('');

    // --- Vehicle status (for pre-departure "no reassign" branch only) ---
    const [vehicleStatus, setVehicleStatus] = useState('AVAILABLE');

    // --- Supplies for new team ---
    const [supplyList, setSupplyList] = useState([]);       // all available supplies from warehouse
    const [loadingSupplies, setLoadingSupplies] = useState(false);
    const [selectedSupplies, setSelectedSupplies] = useState([]); // [{ supplyId, quantity }]

    // ============================================================
    // Data loading
    // ============================================================

    const loadIncidents = useCallback(async () => {
        setLoading(true);
        setErrorMessage('');
        try {
            const response = await incidentReportApi.getAllIncidents();
            setIncidents(Array.isArray(response) ? response : []);
        } catch (error) {
            setErrorMessage(
                error?.response?.data?.message ||
                'Không thể tải danh sách báo cáo sự cố. Vui lòng thử lại.'
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadIncidents();
    }, [loadIncidents]);

    const loadAbortResources = async () => {
        setLoadingTeams(true);
        setLoadingVehicles(true);
        setLoadingSupplies(true);
        try {
            const [teams, vehicles, supplies] = await Promise.all([
                rescueTeamApi.getAvailableTeams(),
                vehicleApi.getAvailableVehicles(),
                supplyApi.getAllSupplies(),
            ]);
            setAvailableTeams(Array.isArray(teams) ? teams : []);
            setAvailableVehicles(Array.isArray(vehicles) ? vehicles : []);
            // Only keep supplies with stock
            setSupplyList(
                (Array.isArray(supplies) ? supplies : []).filter((s) => s.quantity > 0)
            );
        } catch (err) {
            console.error('Lỗi khi tải tài nguyên abort:', err);
        } finally {
            setLoadingTeams(false);
            setLoadingVehicles(false);
            setLoadingSupplies(false);
        }
    };

    // ============================================================
    // Modal control
    // ============================================================

    const handleOpenDetail = (item) => {
        setSelectedItem(item);
        setResolveNote('');
        setActionType('CONTINUE');
        setIsPostDeparture(false);
        setNewTeamId('');
        setNewVehicleId('');
        setVehicleStatus('AVAILABLE');
        setSelectedSupplies([]);
        loadAbortResources();
    };

    const handleCloseDetail = () => {
        setSelectedItem(null);
    };

    // Switch to ABORT tab → resources already pre-loaded in handleOpenDetail
    const handleSetAbort = () => setActionType('ABORT');
    const handleSetContinue = () => setActionType('CONTINUE');

    // ============================================================
    // Supply helpers
    // ============================================================

    const setSupplyQty = (supplyId, qty) => {
        setSelectedSupplies((prev) => {
            const exists = prev.find((s) => s.supplyId === supplyId);
            if (exists) {
                return prev.map((s) =>
                    s.supplyId === supplyId ? { ...s, quantity: qty } : s
                );
            }
            return [...prev, { supplyId, quantity: qty }];
        });
    };

    const getQty = (supplyId) => {
        const found = selectedSupplies.find((s) => s.supplyId === supplyId);
        return found ? found.quantity : 0;
    };

    // ============================================================
    // Resolve (submit)
    // ============================================================

    const handleResolve = async () => {
        if (!selectedItem) return;

        if (!resolveNote.trim()) {
            alert('Vui lòng nhập ghi chú / chỉ đạo trước khi xác nhận.');
            return;
        }

        if (actionType === 'ABORT' && !newTeamId) {
            alert('Vui lòng chọn đội mới để giao nhiệm vụ.');
            return;
        }

        setResolving(true);
        try {
            const payload = {
                action: actionType,
                coordinatorResponse: resolveNote,
            };

            if (actionType === 'ABORT') {
                payload.isPostDeparture = isPostDeparture;
                payload.newTeamId = parseInt(newTeamId);
                payload.newVehicleId = newVehicleId ? parseInt(newVehicleId) : null;
                const suppliesWithQty = selectedSupplies.filter(
                    (s) => s.quantity > 0
                );
                payload.newSupplies = suppliesWithQty.length > 0 ? suppliesWithQty : null;
            }

            await incidentReportApi.resolveIncident(selectedItem.id, payload);
            await loadIncidents();
            handleCloseDetail();
        } catch (error) {
            alert(error?.response?.data?.message || 'Có lỗi xảy ra khi xử lý sự cố');
        } finally {
            setResolving(false);
        }
    };

    // ============================================================
    // Filter / sort
    // ============================================================

    const filteredIncidents = useMemo(() => {
        const lowerKeyword = keyword.trim().toLowerCase();
        return incidents
            .filter((item) => {
                if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
                if (!lowerKeyword) return true;
                const searchableValues = [
                    item.title, item.description, item.rescueRequestTitle,
                    item.teamName, item.reportedByName, item.reportedByPhone,
                ];
                return searchableValues.some((value) =>
                    String(value || '').toLowerCase().includes(lowerKeyword)
                );
            })
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }, [incidents, keyword, statusFilter]);

    useEffect(() => {
        setCurrentPage(1);
    }, [keyword, statusFilter]);

    const totalPages = Math.ceil(filteredIncidents.length / ITEMS_PER_PAGE);
    const paginatedIncidents = filteredIncidents.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const stats = useMemo(() => ({
        total: incidents.length,
        pending: incidents.filter((i) => i.status === 'PENDING').length,
        resolved: incidents.filter((i) => i.status === 'RESOLVED').length,
    }), [incidents]);

    // ============================================================
    // Helpers
    // ============================================================

    const formatDateTime = (value) => {
        if (!value) return '—';
        return new Date(value).toLocaleString('vi-VN');
    };

    const getStatusClass = (status) =>
        STATUS_META[status] || 'bg-gray-100 text-gray-700 border border-gray-200';

    const canSubmit = resolveNote.trim().length > 0;

    const selectedNewTeam = availableTeams.find((t) => String(t.id) === String(newTeamId));
    const selectedNewVehicle = availableVehicles.find((v) => String(v.id) === String(newVehicleId));

    // ============================================================
    // Render
    // ============================================================

    return (
        <div className="h-full overflow-auto p-5 space-y-4">
            {/* ===== Header ===== */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Báo cáo Sự cố (Incident Reports)</h1>
                    <p className="text-sm text-gray-500">Quản lý các sự cố phát sinh trong quá trình cứu hộ (xe hỏng, sạt lở, thiếu quân số...)</p>
                </div>
                <button
                    type="button"
                    onClick={loadIncidents}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                >
                    <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Làm mới
                </button>
            </div>

            {/* ===== Stats ===== */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <p className="text-xs text-gray-500">Tổng số sự cố</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                    <p className="text-xs text-yellow-700 mt-0.5 flex items-center gap-1">
                        <ExclamationTriangleIcon className="h-4 w-4" /> Đang chờ xử lý
                    </p>
                    <p className="mt-1 text-2xl font-bold text-yellow-800">{stats.pending}</p>
                </div>
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <p className="text-xs text-green-700 mt-0.5 flex items-center gap-1">
                        <CheckCircleIcon className="h-4 w-4" /> Đã xử lý xong
                    </p>
                    <p className="mt-1 text-2xl font-bold text-green-800">{stats.resolved}</p>
                </div>
            </div>

            {/* ===== Search & Table ===== */}
            <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="Tìm theo tiêu đề, tên đội, số điện thoại..."
                        className="md:col-span-2 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    >
                        <option value="ALL">Tất cả trạng thái</option>
                        <option value="PENDING">Đang chờ xử lý (PENDING)</option>
                        <option value="RESOLVED">Đã xử lý (RESOLVED)</option>
                    </select>
                </div>

                {errorMessage && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {errorMessage}
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600">
                            <tr>
                                <th className="px-3 py-2 text-left font-semibold">Tên sự cố</th>
                                <th className="px-3 py-2 text-left font-semibold">Đội báo cáo</th>
                                <th className="px-3 py-2 text-left font-semibold">Nhiệm vụ liên quan</th>
                                <th className="px-3 py-2 text-left font-semibold">Trạng thái</th>
                                <th className="px-3 py-2 text-left font-semibold">Thời gian</th>
                                <th className="px-3 py-2 text-left font-semibold">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="px-3 py-6 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
                            ) : paginatedIncidents.length === 0 ? (
                                <tr><td colSpan={6} className="px-3 py-8 text-center text-gray-500">Không có sự cố nào phù hợp.</td></tr>
                            ) : (
                                paginatedIncidents.map((item) => (
                                    <tr key={item.id} className="border-t border-gray-100 align-top hover:bg-gray-50">
                                        <td className="px-3 py-3 w-1/4">
                                            <p className="font-semibold text-gray-900">{item.title}</p>
                                            <p className="mt-1 text-xs text-gray-600 line-clamp-2">{item.description}</p>
                                        </td>
                                        <td className="px-3 py-3">
                                            <p className="font-medium text-gray-800">{item.teamName}</p>
                                            <p className="mt-1 text-xs text-gray-600">Leader: {item.reportedByName}</p>
                                            <p className="mt-0.5 text-xs text-gray-600">SĐT: {item.reportedByPhone}</p>
                                        </td>
                                        <td className="px-3 py-3 w-1/4">
                                            <p className="text-xs text-gray-900 font-medium">{item.rescueRequestTitle}</p>
                                        </td>
                                        <td className="px-3 py-3">
                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium border ${getStatusClass(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 text-xs text-gray-600">
                                            <p>{formatDateTime(item.createdAt)}</p>
                                        </td>
                                        <td className="px-3 py-3">
                                            <button
                                                type="button"
                                                onClick={() => handleOpenDetail(item)}
                                                className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
                                            >
                                                <EyeIcon className="h-4 w-4" />
                                                Chi tiết
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer phân trang */}
                {filteredIncidents.length > 0 && (
                    <div className="shrink-0 px-3 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-between rounded-b-lg">
                        <span>
                            Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredIncidents.length)} / {filteredIncidents.length} sự cố
                        </span>
                        {totalPages > 1 && (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
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
                                                : 'border-gray-300 bg-white hover:bg-gray-100'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    ›
                                </button>
                            </div>
                        )}
                        <span>{filteredIncidents.length} kết quả</span>
                    </div>
                )}
            </div>

            {/* ===== MODAL ===== */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="max-h-[92vh] w-full max-w-3xl overflow-auto rounded-xl bg-white shadow-xl">
                        {/* Header */}
                        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-200 bg-white px-5 py-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Chi tiết sự cố</h2>
                                <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium border ${getStatusClass(selectedItem.status)}`}>
                                    {selectedItem.status}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={handleCloseDetail}
                                className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-4 px-5 py-4 text-sm">
                            {/* Incident content */}
                            <div className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                                <h3 className="font-semibold text-lg text-gray-900">{selectedItem.title}</h3>
                                <p className="mt-2 text-gray-700 whitespace-pre-wrap">{selectedItem.description}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="rounded-lg border border-gray-200 p-3">
                                    <p className="text-xs text-gray-500 font-semibold mb-2">Thông tin báo cáo</p>
                                    <p className="text-gray-700">Đội: <span className="font-semibold">{selectedItem.teamName}</span></p>
                                    <p className="mt-1 text-gray-700">Người báo: {selectedItem.reportedByName} - {selectedItem.reportedByPhone}</p>
                                    <p className="mt-1 text-gray-700">Thời gian báo: {formatDateTime(selectedItem.createdAt)}</p>
                                </div>
                                <div className="rounded-lg border border-gray-200 p-3">
                                    <p className="text-xs text-gray-500 font-semibold mb-2">Nhiệm vụ liên quan</p>
                                    <p className="font-medium text-gray-800">{selectedItem.rescueRequestTitle}</p>
                                </div>
                            </div>

                            {/* Images */}
                            {selectedItem.images && selectedItem.images.length > 0 && (
                                <div className="rounded-lg border border-gray-200 p-3">
                                    <p className="text-xs text-gray-500 font-semibold mb-2">Hình ảnh hiện trường</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {selectedItem.images.map((img, idx) => (
                                            <a key={idx} href={img} target="_blank" rel="noreferrer" className="block border border-gray-200 rounded overflow-hidden">
                                                <img src={img} alt="Incident" className="h-32 w-full object-cover" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Resolved result */}
                            {selectedItem.status === 'RESOLVED' ? (
                                <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                                    <p className="text-xs text-green-700 font-semibold mb-1">Kết quả xử lý</p>
                                    <p className="text-gray-800 font-medium">
                                        Hành động: {ACTION_META[selectedItem.coordinatorAction] || selectedItem.coordinatorAction}
                                    </p>
                                    <p className="mt-1 text-gray-700">Phản hồi: {selectedItem.coordinatorResponse}</p>
                                    <p className="mt-1 text-xs text-gray-500">Cập nhật lúc: {formatDateTime(selectedItem.resolvedAt)}</p>
                                </div>
                            ) : (
                                /* ===== RESOLUTION PANEL (PENDING only) ===== */
                                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-4">
                                    <p className="text-sm font-bold text-blue-900">Xử lý sự cố – Dành cho Điều phối viên</p>

                                    {/* Action selector */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Quyết định hành động</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={handleSetContinue}
                                                className={`rounded-lg border px-3 py-2.5 text-sm font-semibold transition-all ${
                                                    actionType === 'CONTINUE'
                                                        ? 'border-green-400 bg-green-100 text-green-800 ring-2 ring-green-300'
                                                        : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                                                }`}
                                            >
                                                ✅ Yêu cầu đội tiếp tục
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleSetAbort}
                                                className={`rounded-lg border px-3 py-2.5 text-sm font-semibold transition-all ${
                                                    actionType === 'ABORT'
                                                        ? 'border-red-400 bg-red-100 text-red-800 ring-2 ring-red-300'
                                                        : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                                                }`}
                                            >
                                                🚫 Hủy & Giao đội khác
                                            </button>
                                        </div>
                                    </div>

                                    {/* Note */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                                            Ghi chú / Chỉ đạo <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={resolveNote}
                                            onChange={(e) => setResolveNote(e.target.value)}
                                            rows={3}
                                            placeholder={
                                                actionType === 'ABORT'
                                                    ? 'VD: Đội thiếu 3 người, không đủ khả năng thực hiện. Giao cho đội B...'
                                                    : 'VD: Chấp thuận cho đội tiếp tục với số quân hiện tại...'
                                            }
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                        />
                                    </div>

                                    {/* ===== ABORT CONFIGURATION PANEL ===== */}
                                    {actionType === 'ABORT' && (
                                        <div className="rounded-lg border border-red-200 bg-red-50 p-3 space-y-4">
                                            <p className="text-xs font-bold text-red-800 uppercase tracking-wide">⚠️ Cấu hình hủy nhiệm vụ</p>

                                            {/* 0. Post-departure toggle */}
                                            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg bg-orange-50 border border-orange-200 hover:bg-orange-100 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={isPostDeparture}
                                                    onChange={(e) => setIsPostDeparture(e.target.checked)}
                                                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                                />
                                                <div>
                                                    <p className="text-sm font-semibold text-orange-900">🚗 Đội đã xuất phát khi sự cố xảy ra</p>
                                                    <p className="text-xs text-orange-700 mt-0.5">
                                                        Nếu tích: Đội cũ → <strong>Nghỉ trực (OFF_DUTY)</strong>, xe → <strong>Bảo trì (MAINTENANCE)</strong>, vật tư <strong>không hoàn lại kho</strong>. Đội cũ phải gửi báo cáo tình trạng.
                                                    </p>
                                                </div>
                                            </label>

                                            {/* 1. Select new team */}
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                                    Giao nhiệm vụ cho đội mới
                                                    <span className="text-red-500 ml-1">*</span>
                                                </label>
                                                {loadingTeams ? (
                                                    <p className="text-sm text-gray-500 py-1">Đang tải danh sách đội...</p>
                                                ) : availableTeams.length === 0 ? (
                                                    <div className="rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-xs text-orange-700">
                                                        ⚠️ Hiện không có đội nào sẵn sàng. Vui lòng điều phối đội trước khi tiếp tục.
                                                    </div>
                                                ) : (
                                                    <select
                                                        value={newTeamId}
                                                        onChange={(e) => {
                                                            setNewTeamId(e.target.value);
                                                            setNewVehicleId('');
                                                            setSelectedSupplies([]);
                                                        }}
                                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none bg-white"
                                                    >
                                                        <option value="">-- Chọn đội mới --</option>
                                                        {availableTeams.map((team) => (
                                                            <option key={team.id} value={team.id}>{team.name}</option>
                                                        ))}
                                                    </select>
                                                )}
                                            </div>

                                            {/* 3. If new team chosen: assign new vehicle */}
                                            {newTeamId && (
                                                <>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                                                            Gán phương tiện cho đội mới
                                                            <span className="ml-1 text-gray-500 font-normal">(tùy chọn)</span>
                                                        </label>
                                                        {loadingVehicles ? (
                                                            <p className="text-sm text-gray-500 py-1">Đang tải phương tiện...</p>
                                                        ) : availableVehicles.length === 0 ? (
                                                            <div className="rounded-md border border-gray-200 bg-white px-3 py-2 text-xs text-gray-500">
                                                                Không có phương tiện nào sẵn sàng.
                                                            </div>
                                                        ) : (
                                                            <select
                                                                value={newVehicleId}
                                                                onChange={(e) => setNewVehicleId(e.target.value)}
                                                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none bg-white"
                                                            >
                                                                <option value="">-- Không gán phương tiện --</option>
                                                                {availableVehicles.map((v) => (
                                                                    <option key={v.id} value={v.id}>
                                                                        {v.name} – {v.type} ({v.licensePlate})
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        )}
                                                    </div>

                                                    {/* 4. Assign supplies to new team */}
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-700 mb-2">
                                                            Cấp phát vật tư cho đội mới
                                                            <span className="ml-1 text-gray-500 font-normal">(tùy chọn – để trống = không cấp)</span>
                                                        </label>
                                                        {loadingSupplies ? (
                                                            <p className="text-sm text-gray-500 py-1">Đang tải kho vật tư...</p>
                                                        ) : supplyList.length === 0 ? (
                                                            <div className="rounded-md border border-gray-200 bg-white px-3 py-2 text-xs text-gray-500">
                                                                Kho vật tư hiện đang trống.
                                                            </div>
                                                        ) : (
                                                            <div className="rounded-md border border-gray-200 bg-white overflow-hidden">
                                                                <table className="w-full text-xs">
                                                                    <thead className="bg-gray-50 text-gray-600">
                                                                        <tr>
                                                                            <th className="px-3 py-2 text-left font-semibold">Tên vật tư</th>
                                                                            <th className="px-3 py-2 text-center font-semibold">Tồn kho</th>
                                                                            <th className="px-3 py-2 text-center font-semibold w-36">Số lượng cấp</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {supplyList.map((supply) => {
                                                                            const qty = getQty(supply.id);
                                                                            return (
                                                                                <tr key={supply.id} className="border-t border-gray-100">
                                                                                    <td className="px-3 py-2">
                                                                                        <p className="font-medium text-gray-800">{supply.name}</p>
                                                                                        {supply.unit && <p className="text-gray-500">{supply.unit}</p>}
                                                                                    </td>
                                                                                    <td className="px-3 py-2 text-center text-gray-600">{supply.quantity}</td>
                                                                                    <td className="px-3 py-2">
                                                                                        <div className="flex items-center justify-center gap-1">
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => setSupplyQty(supply.id, Math.max(0, qty - 1))}
                                                                                                className="rounded border border-gray-300 p-0.5 hover:bg-gray-100"
                                                                                            >
                                                                                                <MinusIcon className="h-3 w-3" />
                                                                                            </button>
                                                                                            <input
                                                                                                type="number"
                                                                                                min={0}
                                                                                                max={supply.quantity}
                                                                                                value={qty}
                                                                                                onChange={(e) => {
                                                                                                    const v = Math.min(supply.quantity, Math.max(0, parseInt(e.target.value) || 0));
                                                                                                    setSupplyQty(supply.id, v);
                                                                                                }}
                                                                                                className="w-14 rounded border border-gray-300 px-1 py-0.5 text-center text-xs focus:outline-none focus:border-blue-400"
                                                                                            />
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => setSupplyQty(supply.id, Math.min(supply.quantity, qty + 1))}
                                                                                                className="rounded border border-gray-300 p-0.5 hover:bg-gray-100"
                                                                                            >
                                                                                                <PlusIcon className="h-3 w-3" />
                                                                                            </button>
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                            );
                                                                        })}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            )}

                                            {/* Summary */}
                                            <div className="rounded-md border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600 space-y-1">
                                                <p className="font-semibold text-gray-700">Kết quả sau khi xác nhận:</p>
                                                {isPostDeparture ? (
                                                    <>
                                                        <p>• Đội cũ ({selectedItem.teamName}) → <strong className="text-orange-700">Nghỉ trực (OFF_DUTY)</strong> — chờ về + gửi báo cáo tình trạng</p>
                                                        <p>• Xe cũ → <strong className="text-orange-700">Bảo trì (MAINTENANCE)</strong> — không trả về kho ngay</p>
                                                        <p>• Vật tư cũ → <strong className="text-red-700">KHÔNG hoàn lại kho</strong> (đã mang đi)</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p>• Đội cũ ({selectedItem.teamName}) → giải phóng về trạng thái <strong>Sẵn sàng</strong></p>
                                                        <p>• Xe cũ → thu hồi về kho (AVAILABLE)</p>
                                                        <p>• Vật tư cũ → <strong>thu hồi toàn bộ về kho</strong></p>
                                                    </>
                                                )}
                                                {newTeamId ? (
                                                    <>
                                                        <p>• Đội mới (<strong>{selectedNewTeam?.name}</strong>) → nhận nhiệm vụ ngay (IN_PROGRESS)</p>
                                                        {newVehicleId && <p>• Phương tiện: <strong>{selectedNewVehicle?.name}</strong> → gán cho đội mới</p>}
                                                        {selectedSupplies.filter(s => s.quantity > 0).length > 0 && (
                                                            <p>• Vật tư mới → cấp {selectedSupplies.filter(s => s.quantity > 0).length} loại cho đội mới</p>
                                                        )}
                                                    </>
                                                ) : (
                                                    <p>• <strong>Vui lòng chọn đội mới để giao nhiệm vụ</strong></p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action buttons */}
                                    <div className="flex justify-end gap-2 pt-1">
                                        <button
                                            type="button"
                                            onClick={handleCloseDetail}
                                            className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50"
                                        >
                                            Đóng
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleResolve}
                                            disabled={resolving || !canSubmit}
                                            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 transition-colors ${
                                                actionType === 'ABORT'
                                                    ? 'bg-red-600 hover:bg-red-700'
                                                    : 'bg-green-600 hover:bg-green-700'
                                            }`}
                                        >
                                            {resolving ? 'Đang xử lý...' : (
                                                <>
                                                    {actionType === 'ABORT' ? '🚫 Xác nhận Hủy nhiệm vụ' : '✅ Xác nhận Tiếp tục'}
                                                    <ArrowRightIcon className="h-4 w-4" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
