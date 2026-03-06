import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { coordinatorApi } from '../../services/coordinatorApi';
import VerifyRequestModal from '../../components/coordinator/VerifyRequestModal';
import AssignTaskModal from '../../components/coordinator/AssignTaskModal';
import RequestDetailModal from '../../components/coordinator/RequestDetailModal';
import PriorityBadge from '../../components/coordinator/PriorityBadge';
import StatusBadge from '../../components/coordinator/StatusBadge';
import {
    MagnifyingGlassIcon,
    ArrowPathIcon,
    EyeIcon,
    ShieldCheckIcon,
    TruckIcon,
    SignalIcon,
    ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';

/**
 * RequestQueue — Trang danh sách yêu cầu cứu hộ dạng bảng.
 *
 * Tính năng:
 * - Bảng hiển thị: #, Tên, Địa điểm, Thời gian gửi, Mức độ, Trạng thái, Hành động
 * - Sort mặc định: mới nhất trước (createdAt DESC)
 * - Auto-refresh mỗi 30 giây
 * - Tích hợp xác thực (PENDING → VALIDATED) + phân công đội (VALIDATED → IN_PROGRESS)
 * - Nút xem chi tiết, xác thực, phân công, theo dõi tùy theo trạng thái
 */
const ITEMS_PER_PAGE = 10;

export default function RequestQueue() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [lastRefresh, setLastRefresh] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Hàm load dữ liệu, dùng useCallback để tránh tạo lại mỗi render
    const loadRequests = useCallback(async () => {
        setLoading(true);
        try {
            const data = await coordinatorApi.getAllRequests();
            const list = data || [];
            setRequests(list);
            setLastRefresh(new Date());

            // Enrich: list API thiếu location/media, detail API thiếu contactName/contactPhone
            // Gọi detail API cho từng yêu cầu rồi merge dữ liệu
            Promise.allSettled(
                list.map((req) => coordinatorApi.getRequestDetail(req.requestId || req.id))
            ).then((results) => {
                const detailMap = {};
                list.forEach((req, i) => {
                    if (results[i].status === 'fulfilled') {
                        detailMap[req.requestId || req.id] = results[i].value;
                    }
                });
                setRequests((prev) =>
                    prev.map((req) => {
                        const detail = detailMap[req.requestId || req.id];
                        if (detail) {
                            return {
                                ...detail,                          // detail: location, media, ...
                                ...req,                             // list: contactName, contactPhone, ... (ưu tiên)
                                location: detail.location || req.location,
                                media: detail.media || req.media,
                            };
                        }
                        return req;
                    })
                );
            });
        } catch (error) {
            console.error('Failed to load requests:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load lần đầu + auto-refresh mỗi 30 giây
    useEffect(() => {
        loadRequests();
        const interval = setInterval(loadRequests, 30000);
        return () => clearInterval(interval); // Dọn dẹp khi unmount
    }, [loadRequests]);

    // Reset về trang 1 khi thay đổi filter hoặc tìm kiếm
    useEffect(() => { setCurrentPage(1); }, [statusFilter, searchTerm]);

    // Tính thời gian đã gửi (vd: "5 phút trước", "2 giờ trước")
    const formatTimeAgo = (dateString) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMin = Math.floor(diffMs / 60000);
        if (diffMin < 1) return 'Vừa xong';
        if (diffMin < 60) return `${diffMin} phút trước`;
        const diffHour = Math.floor(diffMin / 60);
        if (diffHour < 24) return `${diffHour} giờ trước`;
        const diffDay = Math.floor(diffHour / 24);
        return `${diffDay} ngày trước`;
    };

    // Format ngày giờ đầy đủ cho tooltip
    const formatDateTime = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    // Lọc + sort (mới nhất trước)
    const filteredRequests = useMemo(() => {
        return requests
            .filter((req) => {
                const term = searchTerm.toLowerCase();
                const matchesSearch =
                    req.title?.toLowerCase().includes(term) ||
                    req.description?.toLowerCase().includes(term) ||
                    req.trackingCode?.toLowerCase().includes(term) ||
                    req.location?.addressText?.toLowerCase().includes(term);
                const matchesStatus =
                    statusFilter === 'ALL' ||
                    req.status === statusFilter ||
                    (statusFilter === 'VERIFIED' && req.status === 'VALIDATED') ||
                    (statusFilter === 'IN_PROGRESS' && ['IN_PROGRESS', 'MOVING', 'ARRIVED', 'RESCUING'].includes(req.status)) ||
                    (statusFilter === 'REJECTED' && req.status === 'REJECTED');
                return matchesSearch && matchesStatus;
            })
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [requests, searchTerm, statusFilter]);

    // Pagination
    const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
    const paginatedRequests = filteredRequests.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Đếm số yêu cầu theo trạng thái
    const statusCounts = useMemo(() => ({
        ALL: requests.length,
        PENDING: requests.filter((r) => r.status === 'PENDING').length,
        VERIFIED: requests.filter((r) => r.status === 'VERIFIED' || r.status === 'VALIDATED').length,
        IN_PROGRESS: requests.filter((r) => ['IN_PROGRESS', 'MOVING', 'ARRIVED', 'RESCUING'].includes(r.status)).length,
        COMPLETED: requests.filter((r) => r.status === 'COMPLETED').length,
        REJECTED: requests.filter((r) => r.status === 'REJECTED').length,
    }), [requests]);

    return (
        <div className="h-full flex flex-col p-4 gap-3">
            {/* Header — compact */}
            <div className="flex-shrink-0 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Danh sách yêu cầu</h1>
                    <p className="text-xs text-gray-500">
                        Xem, xác thực và phân công đội cứu hộ cho các yêu cầu.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {lastRefresh && (
                        <span className="text-xs text-gray-400">
                            Cập nhật: {lastRefresh.toLocaleTimeString('vi-VN')}
                        </span>
                    )}
                    <button
                        onClick={loadRequests}
                        disabled={loading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 text-white text-xs font-medium rounded-md hover:bg-teal-700 disabled:opacity-60 transition-colors"
                    >
                        <ArrowPathIcon className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                        {loading ? 'Đang tải...' : 'Làm mới'}
                    </button>
                </div>
            </div>

            {/* Filters: search + status tabs — compact */}
            <div className="flex-shrink-0 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                <div className="relative flex-1 max-w-sm">
                    <MagnifyingGlassIcon className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm theo tên, địa điểm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-md text-xs focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                </div>
                <div className="flex gap-0.5 bg-gray-100 p-0.5 rounded-lg flex-wrap">
                    {[
                        { key: 'ALL', label: 'Tất cả' },
                        { key: 'PENDING', label: 'Chờ duyệt' },
                        { key: 'VERIFIED', label: 'Đã xác thực' },
                        { key: 'IN_PROGRESS', label: 'Đang thực thi' },
                        { key: 'COMPLETED', label: 'Hoàn thành' },
                        { key: 'REJECTED', label: 'Không duyệt' },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setStatusFilter(tab.key)}
                            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                                statusFilter === tab.key
                                    ? 'bg-white text-teal-700 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab.label}
                            <span className="ml-1 text-gray-400">({statusCounts[tab.key]})</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Table — fills remaining space, scrolls internally */}
            <div className="flex-1 min-h-0 bg-white border border-gray-200 rounded-lg flex flex-col overflow-hidden">
                <div className="flex-1 min-h-0 overflow-auto">
                    <table className="w-full text-xs">
                        <thead className="sticky top-0 z-10">
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="text-left px-3 py-2 font-semibold text-gray-600 w-10">#</th>
                                <th className="text-left px-3 py-2 font-semibold text-gray-600">Tiêu đề</th>
                                <th className="text-left px-3 py-2 font-semibold text-gray-600">Người gửi</th>
                                <th className="text-left px-3 py-2 font-semibold text-gray-600">Địa điểm cứu trợ</th>
                                <th className="text-left px-3 py-2 font-semibold text-gray-600 w-28">Thời gian</th>
                                <th className="text-center px-3 py-2 font-semibold text-gray-600 w-24">Mức độ</th>
                                <th className="text-center px-3 py-2 font-semibold text-gray-600 w-28">Trạng thái</th>
                                <th className="text-center px-3 py-2 font-semibold text-gray-600 w-32">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedRequests.map((req, index) => (
                                <tr key={req.requestId || req.id} className="hover:bg-gray-50 transition-colors">
                                    {/* # Thứ tự */}
                                    <td className="px-3 py-2 text-gray-400 font-mono">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>

                                    {/* Tiêu đề */}
                                    <td className="px-3 py-2">
                                        <p className="font-medium text-gray-900">
                                            {req.title || 'Yêu cầu cứu hộ'}
                                        </p>
                                    </td>

                                    {/* Người gửi (tên + SĐT) */}
                                    <td className="px-3 py-2">
                                        <p className="text-gray-900 font-medium">
                                            {req.contactName || req.citizenName || 'Không rõ'}
                                        </p>
                                        {(req.contactPhone) && (
                                            <p className="text-gray-400 mt-0.5">
                                                {req.contactPhone}
                                            </p>
                                        )}
                                    </td>

                                    {/* Địa điểm cứu trợ — sau khi enrich sẽ có location từ detail API */}
                                    <td className="px-3 py-2">
                                        <p className="text-gray-700">
                                            {req.location?.addressText || 'Đang tải...'}
                                        </p>
                                    </td>

                                    {/* Thời gian gửi */}
                                    <td className="px-3 py-2" title={formatDateTime(req.createdAt)}>
                                        <span className="text-gray-600">{formatTimeAgo(req.createdAt)}</span>
                                    </td>

                                    {/* Mức độ */}
                                    <td className="px-3 py-2 text-center">
                                        <PriorityBadge priority={req.emergencyLevel} />
                                    </td>

                                    {/* Trạng thái */}
                                    <td className="px-3 py-2 text-center">
                                        <StatusBadge status={req.status} />
                                    </td>

                                    {/* Hành động */}
                                    <td className="px-3 py-2">
                                        <div className="flex items-center justify-center gap-0.5">
                                            {/* Xem chi tiết — luôn hiện */}
                                            <button
                                                onClick={() => { setSelectedRequest(req); setShowDetailModal(true); }}
                                                title="Xem chi tiết"
                                                className="p-1 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors"
                                            >
                                                <EyeIcon className="h-4 w-4" />
                                            </button>

                                            {/* Xác thực — chỉ hiện nếu PENDING */}
                                            {req.status === 'PENDING' && (
                                                <button
                                                    onClick={() => { setSelectedRequest(req); setShowVerifyModal(true); }}
                                                    title="Xác thực yêu cầu"
                                                    className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                                                >
                                                    <ShieldCheckIcon className="h-4 w-4" />
                                                </button>
                                            )}

                                            {/* Phân công đội — chỉ hiện nếu VERIFIED/VALIDATED */}
                                            {(req.status === 'VERIFIED' || req.status === 'VALIDATED') && (
                                                <button
                                                    onClick={() => { setSelectedRequest(req); setShowAssignModal(true); }}
                                                    title="Phân công đội cứu hộ"
                                                    className="p-1 text-green-500 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                                                >
                                                    <TruckIcon className="h-4 w-4" />
                                                </button>
                                            )}

                                            {/* Theo dõi — nếu đang thực thi */}
                                            {['IN_PROGRESS', 'MOVING', 'ARRIVED', 'RESCUING', 'ASSIGNED'].includes(req.status) && (
                                                <button
                                                    onClick={() => { setSelectedRequest(req); setShowDetailModal(true); }}
                                                    title="Theo dõi"
                                                    className="p-1 text-yellow-500 hover:text-yellow-700 hover:bg-yellow-50 rounded transition-colors"
                                                >
                                                    <SignalIcon className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Trạng thái rỗng / đang tải */}
                    {filteredRequests.length === 0 && !loading && (
                        <div className="text-center py-10 text-gray-400">
                            <ClipboardDocumentListIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-xs">Không tìm thấy yêu cầu nào.</p>
                        </div>
                    )}
                    {loading && filteredRequests.length === 0 && (
                        <div className="text-center py-10 text-gray-400">
                            <ArrowPathIcon className="h-6 w-6 mx-auto mb-2 animate-spin" />
                            <p className="text-xs">Đang tải yêu cầu...</p>
                        </div>
                    )}
                </div>

                {/* Footer: phân trang */}
                {filteredRequests.length > 0 && (
                    <div className="flex-shrink-0 px-3 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-between">
                        <span>
                            Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredRequests.length)} / {filteredRequests.length} yêu cầu
                        </span>
                        {totalPages > 1 && (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-2 py-1 rounded border border-gray-300 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    ‹
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-2 py-1 rounded border ${
                                            currentPage === page
                                                ? 'bg-teal-600 text-white border-teal-600'
                                                : 'border-gray-300 hover:bg-white'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-2 py-1 rounded border border-gray-300 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    ›
                                </button>
                            </div>
                        )}
                        <span>Tự động làm mới mỗi 30 giây</span>
                    </div>
                )}
            </div>

            {/* Modals — tích hợp xác thực + phân công ngay trên trang này */}
            <VerifyRequestModal
                request={selectedRequest}
                isOpen={showVerifyModal}
                onClose={() => setShowVerifyModal(false)}
                onSuccess={(action) => {
                    // Optimistic update: cập nhật status ngay trong local state
                    // để UI phản hồi tức thì, không cần chờ backend refresh
                    if (action === 'rejected' && selectedRequest) {
                        setRequests((prev) =>
                            prev.map((r) =>
                                (r.requestId || r.id) === (selectedRequest.requestId || selectedRequest.id)
                                    ? { ...r, status: 'REJECTED' }
                                    : r
                            )
                        );
                    } else if (action === 'verified' && selectedRequest) {
                        setRequests((prev) =>
                            prev.map((r) =>
                                (r.requestId || r.id) === (selectedRequest.requestId || selectedRequest.id)
                                    ? { ...r, status: 'VERIFIED' }
                                    : r
                            )
                        );
                    }
                    // Vẫn gọi loadRequests để đồng bộ đầy đủ từ server
                    loadRequests();
                }}
            />
            <AssignTaskModal
                request={selectedRequest}
                isOpen={showAssignModal}
                onClose={() => setShowAssignModal(false)}
                onSuccess={loadRequests}
            />
            <RequestDetailModal
                request={selectedRequest}
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                onValidate={(r) => {
                    setSelectedRequest(r);
                    setShowDetailModal(false);
                    setShowVerifyModal(true);
                }}
                onAssign={(r) => {
                    setSelectedRequest(r);
                    setShowDetailModal(false);
                    setShowAssignModal(true);
                }}
            />
        </div>
    );
}
