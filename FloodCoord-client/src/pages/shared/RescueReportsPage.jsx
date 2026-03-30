import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ArrowPathIcon,
    EyeIcon,
    MapPinIcon,
    TruckIcon,
    UserGroupIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { rescueReportApi } from '../../services/rescueReportApi';

const PRIORITY_META = {
    CRITICAL: 'bg-red-100 text-red-700 border border-red-200',
    HIGH: 'bg-orange-100 text-orange-700 border border-orange-200',
    MEDIUM: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    LOW: 'bg-blue-100 text-blue-700 border border-blue-200'
};

export default function RescueReportsPage() {
    const [reports, setReports] = useState([]);
    const [levelFilter, setLevelFilter] = useState('ALL');
    const [keyword, setKeyword] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    const loadReports = useCallback(async () => {
        setLoading(true);
        setErrorMessage('');

        try {
            const response = await rescueReportApi.getReportedRequests();
            setReports(Array.isArray(response) ? response : []);
        } catch (error) {
            setErrorMessage(
                error?.response?.data?.message ||
                'Không thể tải danh sách báo cáo đã nộp. Vui lòng thử lại.'
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadReports();
    }, [loadReports]);

    const handleOpenDetail = async (item) => {
        setSelectedItem(item);
        setSelectedDetail(item.report || null);
        setDetailLoading(true);
        try {
            const reportDetail = await rescueReportApi.getReportDetail(item.requestId);
            setSelectedDetail(reportDetail || item.report || null);
        } catch {
            setSelectedDetail(item.report || null);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleCloseDetail = () => {
        setSelectedItem(null);
        setSelectedDetail(null);
        setDetailLoading(false);
    };

    const filteredReports = useMemo(() => {
        const lowerKeyword = keyword.trim().toLowerCase();

        return reports
            .filter((item) => {
                if (levelFilter !== 'ALL' && item.emergencyLevel !== levelFilter) {
                    return false;
                }

                if (!lowerKeyword) {
                    return true;
                }

                const searchableValues = [
                    item.title,
                    item.description,
                    item.trackingCode,
                    item.contactName,
                    item.contactPhone,
                    item.assignedTeamName,
                    item.report?.leaderName,
                    item.location?.addressText,
                    item.report?.reportNote
                ];

                return searchableValues.some((value) =>
                    String(value || '').toLowerCase().includes(lowerKeyword)
                );
            })
            .sort((firstItem, secondItem) => {
                const firstTime = new Date(firstItem.createdAt || 0).getTime();
                const secondTime = new Date(secondItem.createdAt || 0).getTime();
                return secondTime - firstTime;
            });
    }, [reports, keyword, levelFilter]);

    const stats = useMemo(() => {
        const criticalCount = reports.filter((item) => item.emergencyLevel === 'CRITICAL').length;
        const highCount = reports.filter((item) => item.emergencyLevel === 'HIGH').length;
        const totalRescued = reports.reduce((sum, item) => sum + (item.report?.rescuedPeople || 0), 0);
        return {
            total: reports.length,
            critical: criticalCount,
            high: highCount,
            rescued: totalRescued
        };
    }, [reports]);

    const formatDateTime = (value) => {
        if (!value) return '—';
        return new Date(value).toLocaleString('vi-VN');
    };

    const getPriorityClass = (level) => PRIORITY_META[level] || 'bg-gray-100 text-gray-700 border border-gray-200';

    return (
        <div className="h-full overflow-auto p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Báo cáo nhiệm vụ đã nộp</h1>
                    <p className="text-sm text-gray-500">Hiển thị đầy đủ các yêu cầu cứu hộ có trạng thái REPORTED.</p>
                </div>
                <button
                    type="button"
                    onClick={loadReports}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                >
                    <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Làm mới
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <p className="text-xs text-gray-500">Tổng số báo cáo</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <p className="text-xs text-red-700">Mức CRITICAL</p>
                    <p className="mt-1 text-2xl font-bold text-red-800">{stats.critical}</p>
                </div>
                <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                    <p className="text-xs text-orange-700">Mức HIGH</p>
                    <p className="mt-1 text-2xl font-bold text-orange-800">{stats.high}</p>
                </div>
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-xs text-emerald-700">Tổng người đã cứu</p>
                    <p className="mt-1 text-2xl font-bold text-emerald-800">{stats.rescued}</p>
                </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                        type="text"
                        value={keyword}
                        onChange={(event) => setKeyword(event.target.value)}
                        placeholder="Tìm theo mã, tiêu đề, đội, leader, địa chỉ..."
                        className="md:col-span-2 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                    <select
                        value={levelFilter}
                        onChange={(event) => setLevelFilter(event.target.value)}
                        className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    >
                        <option value="ALL">Tất cả mức độ</option>
                        <option value="CRITICAL">CRITICAL</option>
                        <option value="HIGH">HIGH</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="LOW">LOW</option>
                    </select>
                </div>

                {errorMessage ? (
                    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {errorMessage}
                    </div>
                ) : null}

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600">
                            <tr>
                                <th className="px-3 py-2 text-left font-semibold">Yêu cầu</th>
                                <th className="px-3 py-2 text-left font-semibold">Đội/Leader</th>
                                <th className="px-3 py-2 text-left font-semibold">Báo cáo</th>
                                <th className="px-3 py-2 text-left font-semibold">Mốc thời gian</th>
                                <th className="px-3 py-2 text-left font-semibold">Xem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-3 py-6 text-center text-gray-500">
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            ) : filteredReports.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-3 py-8 text-center text-gray-500">
                                        Không có báo cáo phù hợp.
                                    </td>
                                </tr>
                            ) : (
                                filteredReports.map((item) => {
                                    return (
                                        <tr key={item.requestId} className="border-t border-gray-100 align-top">
                                            <td className="px-3 py-3">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-semibold text-gray-900">{item.title || '—'}</span>
                                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getPriorityClass(item.emergencyLevel)}`}>
                                                        {item.emergencyLevel || 'N/A'}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-xs font-mono text-gray-500">{item.trackingCode || '—'}</p>
                                                <p className="mt-1 text-xs text-gray-600 whitespace-pre-wrap">
                                                    {item.description || 'Không có mô tả'}
                                                </p>
                                            </td>
                                            <td className="px-3 py-3">
                                                <p className="font-medium text-gray-800">{item.assignedTeamName || 'Chưa gán đội'}</p>
                                                <p className="mt-1 text-xs text-gray-600">Leader: {item.report?.leaderName || '—'}</p>
                                                <p className="mt-1 text-xs text-gray-600">SĐT đội: {item.assignedTeamLeaderPhone || '—'}</p>
                                                <p className="mt-1 text-xs text-gray-600">Liên hệ dân: {item.contactName || '—'} - {item.contactPhone || '—'}</p>
                                            </td>
                                            <td className="px-3 py-3">
                                                <p className="text-xs text-gray-700">Đã cứu: <span className="font-semibold">{item.report?.rescuedPeople ?? 0}</span> người</p>
                                                <p className="mt-1 text-xs text-gray-600 whitespace-pre-wrap">Ghi chú: {item.report?.reportNote || 'Không có'}</p>
                                                <p className="mt-1 text-xs text-gray-600">Trạng thái request: {item.status || '—'}</p>
                                            </td>
                                            <td className="px-3 py-3 text-xs text-gray-600">
                                                <p>Tạo lúc: {formatDateTime(item.createdAt)}</p>
                                                <p className="mt-1">Báo cáo lúc: {formatDateTime(item.report?.reportedAt)}</p>
                                            </td>
                                            <td className="px-3 py-3">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenDetail(item)}
                                                    className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
                                                >
                                                    <EyeIcon className="h-4 w-4" />
                                                    Xem
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedItem ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-xl bg-white shadow-xl">
                        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-200 bg-white px-5 py-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Chi tiết report - {selectedItem.trackingCode}</h2>
                                <p className="text-xs text-gray-500">{selectedItem.title}</p>
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
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                <div className="rounded-lg border border-gray-200 p-3">
                                    <p className="text-xs text-gray-500">Thông tin yêu cầu</p>
                                    <p className="mt-1 font-semibold text-gray-900">{selectedItem.description || 'Không có mô tả'}</p>
                                    <p className="mt-2 text-gray-700">Mức độ: <span className="font-semibold">{selectedItem.emergencyLevel}</span></p>
                                    <p className="mt-1 text-gray-700">Số người gặp nạn: <span className="font-semibold">{selectedItem.peopleCount || 0}</span></p>
                                    <p className="mt-1 text-gray-700">Đánh giá người dân: <span className="font-semibold">{selectedItem.citizenRating || '—'}</span></p>
                                    <p className="mt-1 text-gray-700">Phản hồi: {selectedItem.citizenFeedback || '—'}</p>
                                </div>

                                <div className="rounded-lg border border-gray-200 p-3">
                                    <p className="text-xs text-gray-500">Đội xử lý</p>
                                    <p className="mt-1 flex items-center gap-1 text-gray-800"><UserGroupIcon className="h-4 w-4" /> {selectedItem.assignedTeamName || '—'}</p>
                                    <p className="mt-1 text-gray-700">SĐT Leader đội: {selectedItem.assignedTeamLeaderPhone || '—'}</p>
                                    <p className="mt-1 flex items-center gap-1 text-gray-800">
                                        <TruckIcon className="h-4 w-4" />
                                        {selectedItem.vehicle ? `${selectedItem.vehicle.name} (${selectedItem.vehicle.licensePlate})` : 'Không có xe'}
                                    </p>
                                    <p className="mt-2 text-xs text-gray-500">Vật tư</p>
                                    {selectedItem.supplies?.length > 0 ? (
                                        <ul className="mt-1 space-y-1 text-gray-700">
                                            {selectedItem.supplies.map((supply) => (
                                                <li key={supply.supplyId}>- {supply.supplyName}: {supply.quantity} {supply.unit}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="mt-1 text-gray-500">Không có vật tư</p>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-lg border border-gray-200 p-3">
                                <p className="text-xs text-gray-500">Vị trí</p>
                                <p className="mt-1 flex items-start gap-1 text-gray-800">
                                    <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0" />
                                    <span>{selectedItem.location?.addressText || '—'}</span>
                                </p>
                                <p className="mt-1 text-gray-700">
                                    Tọa độ: {selectedItem.location?.latitude ?? '—'}, {selectedItem.location?.longitude ?? '—'}
                                </p>
                                <p className="mt-1 text-gray-700">Mực nước: {selectedItem.location?.floodDepth ?? 0} m</p>
                            </div>

                            <div className="rounded-lg border border-gray-200 p-3">
                                <p className="text-xs text-gray-500">Nội dung report</p>
                                {detailLoading ? (
                                    <p className="mt-1 text-gray-500">Đang tải chi tiết report...</p>
                                ) : (
                                    <>
                                        <p className="mt-1 text-gray-700">Leader: <span className="font-semibold">{selectedDetail?.leaderName || selectedItem.report?.leaderName || '—'}</span></p>
                                        <p className="mt-1 text-gray-700">Đã cứu: <span className="font-semibold">{selectedDetail?.rescuedPeople ?? selectedItem.report?.rescuedPeople ?? 0}</span> người</p>
                                        <p className="mt-1 text-gray-700">Ghi chú: {selectedDetail?.reportNote || selectedItem.report?.reportNote || 'Không có'}</p>
                                        <p className="mt-1 text-gray-700">Thời điểm nộp: {formatDateTime(selectedDetail?.reportedAt || selectedItem.report?.reportedAt)}</p>
                                    </>
                                )}
                            </div>

                            <div className="rounded-lg border border-gray-200 p-3">
                                <p className="text-xs text-gray-500">Media hiện trường</p>
                                {selectedItem.media?.length > 0 ? (
                                    <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        {selectedItem.media.map((media) => (
                                            <a
                                                key={media.mediaId}
                                                href={media.mediaUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="overflow-hidden rounded-md border border-gray-200"
                                            >
                                                <img
                                                    src={media.mediaUrl}
                                                    alt="Rescue request media"
                                                    className="h-40 w-full object-cover"
                                                />
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="mt-1 text-gray-500">Không có media.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
