import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ArrowPathIcon,
    EyeIcon,
    XMarkIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import { incidentReportApi } from '../../services/incidentReportApi';

const STATUS_META = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    RESOLVED: 'bg-green-100 text-green-800 border-green-200',
};

const ACTION_META = {
    CONTINUE: 'Tiếp tục nhiệm vụ',
    ABORT: 'Hủy nhiệm vụ'
};

export default function IncidentReportsPage() {
    const [incidents, setIncidents] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedItem, setSelectedItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    const [resolveNote, setResolveNote] = useState('');
    const [actionType, setActionType] = useState('CONTINUE');
    const [resolving, setResolving] = useState(false);

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

    const handleOpenDetail = (item) => {
        setSelectedItem(item);
        setResolveNote('');
        setActionType('CONTINUE');
    };

    const handleCloseDetail = () => {
        setSelectedItem(null);
    };

    const handleResolve = async () => {
        if (!selectedItem) return;
        setResolving(true);
        try {
            await incidentReportApi.resolveIncident(selectedItem.id, {
                action: actionType,
                response: resolveNote
            });
            // Tải lại sau khi xử lý thành công
            await loadIncidents();
            handleCloseDetail();
        } catch (error) {
            alert(error?.response?.data?.message || 'Có lỗi xảy ra khi xử lý sự cố');
        } finally {
            setResolving(false);
        }
    };

    const filteredIncidents = useMemo(() => {
        const lowerKeyword = keyword.trim().toLowerCase();

        return incidents
            .filter((item) => {
                if (statusFilter !== 'ALL' && item.status !== statusFilter) {
                    return false;
                }

                if (!lowerKeyword) {
                    return true;
                }

                const searchableValues = [
                    item.title,
                    item.description,
                    item.rescueRequestTitle,
                    item.teamName,
                    item.reportedByName,
                    item.reportedByPhone
                ];

                return searchableValues.some((value) =>
                    String(value || '').toLowerCase().includes(lowerKeyword)
                );
            })
            .sort((a, b) => {
                const timeA = new Date(a.createdAt || 0).getTime();
                const timeB = new Date(b.createdAt || 0).getTime();
                return timeB - timeA;
            });
    }, [incidents, keyword, statusFilter]);

    const stats = useMemo(() => {
        const pendingCount = incidents.filter((item) => item.status === 'PENDING').length;
        const resolvedCount = incidents.filter((item) => item.status === 'RESOLVED').length;
        return {
            total: incidents.length,
            pending: pendingCount,
            resolved: resolvedCount
        };
    }, [incidents]);

    const formatDateTime = (value) => {
        if (!value) return '—';
        return new Date(value).toLocaleString('vi-VN');
    };

    const getStatusClass = (status) => STATUS_META[status] || 'bg-gray-100 text-gray-700 border border-gray-200';

    return (
        <div className="h-full overflow-auto p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Báo cáo Sự cố (Incident Reports)</h1>
                    <p className="text-sm text-gray-500">Quản lý các sự cố phát sinh trong quá trình cứu hộ (xe hỏng, sạt lở...)</p>
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

            <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                        type="text"
                        value={keyword}
                        onChange={(event) => setKeyword(event.target.value)}
                        placeholder="Tìm theo tiêu đề, tên đội, số điện thoại..."
                        className="md:col-span-2 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                    <select
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
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
                                <tr>
                                    <td colSpan={6} className="px-3 py-6 text-center text-gray-500">
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            ) : filteredIncidents.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-3 py-8 text-center text-gray-500">
                                        Không có sự cố nào phù hợp.
                                    </td>
                                </tr>
                            ) : (
                                filteredIncidents.map((item) => (
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
            </div>

            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-xl bg-white shadow-xl">
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
                                className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-4 px-5 py-4 text-sm">
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

                            {selectedItem.status === 'RESOLVED' ? (
                                <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                                    <p className="text-xs text-green-700 font-semibold mb-1">Kết quả xử lý</p>
                                    <p className="text-gray-800 font-medium">Hành động: {ACTION_META[selectedItem.coordinatorAction] || selectedItem.coordinatorAction}</p>
                                    <p className="mt-1 text-gray-700">Phản hồi: {selectedItem.coordinatorResponse}</p>
                                    <p className="mt-1 text-xs text-gray-500">Cập nhật lúc: {formatDateTime(selectedItem.resolvedAt)}</p>
                                </div>
                            ) : (
                                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                    <p className="text-sm font-semibold text-blue-900 mb-3">Xử lý sự cố (Dành cho Điều phối viên)</p>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Quyết định hành động</label>
                                            <select
                                                value={actionType}
                                                onChange={(e) => setActionType(e.target.value)}
                                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                            >
                                                <option value="CONTINUE">Yêu cầu Đội tiếp tục nhiệm vụ (CONTINUE)</option>
                                                <option value="ABORT">Hủy nhiệm vụ & Giải phóng Đội (ABORT)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Ghi chú phản hồi / Chỉ đạo</label>
                                            <textarea
                                                value={resolveNote}
                                                onChange={(e) => setResolveNote(e.target.value)}
                                                rows={3}
                                                placeholder="VD: Chuyển hướng qua đường X, hoặc đã điều thêm xe bọc thép hỗ trợ..."
                                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                            />
                                        </div>
                                        <div className="flex justify-end gap-2 pt-2">
                                            <button
                                                type="button"
                                                onClick={handleCloseDetail}
                                                className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                                            >
                                                Hủy
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleResolve}
                                                disabled={resolving || !resolveNote.trim()}
                                                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                                            >
                                                {resolving ? 'Đang xử lý...' : 'Xác nhận xử lý'}
                                            </button>
                                        </div>
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
