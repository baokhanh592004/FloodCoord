import React, { useState, useEffect } from 'react';
import { XMarkIcon, ExclamationTriangleIcon, PhotoIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { coordinatorApi } from '../../services/coordinatorApi';
import toast from 'react-hot-toast';

/**
 * VerifyRequestModal - Modal xác thực yêu cầu cứu hộ
 *
 * FLOW:
 * 1. Coordinator mở modal từ yêu cầu PENDING
 * 2. Xem lại ảnh/video đính kèm (load từ getRequestDetail)
 * 3. Kiểm tra: địa điểm có gặp sự cố thật? Video/ảnh không phải AI?
 * 4. Phân loại mức độ khẩn cấp + thêm ghi chú
 * 5. Bấm "Duyệt" → hiện modal xác nhận nhỏ → gọi API → PENDING → VALIDATED
 */
const REJECT_REASONS = [
    { id: 'fake_media', label: 'Ảnh/Video không xác thực (nghi AI tạo)' },
    { id: 'wrong_location', label: 'Địa điểm không khớp với sự cố' },
    { id: 'duplicate', label: 'Yêu cầu trùng lặp' },
    { id: 'insufficient_info', label: 'Thông tin không đầy đủ' },
    { id: 'no_emergency', label: 'Không phải tình huống khẩn cấp' },
    { id: 'other', label: 'Lý do khác' },
];

export default function VerifyRequestModal({ request, isOpen, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        emergencyLevel: 'HIGH',
        note: '',
        locationConfirmed: false,
        mediaAuthentic: false,
    });
    const [loading, setLoading] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [details, setDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectReasons, setRejectReasons] = useState([]);
    const [rejectNote, setRejectNote] = useState('');

    // Reset form + load chi tiết (bao gồm media) khi mở modal
    useEffect(() => {
        if (isOpen && request) {
            setFormData({
                emergencyLevel: request.emergencyLevel || 'HIGH',
                note: '',
                locationConfirmed: false,
                mediaAuthentic: false,
            });
            setShowConfirmDialog(false);
            setShowRejectDialog(false);
            setRejectReasons([]);
            setRejectNote('');
            setDetails(null);
            loadDetails();
        }
    }, [isOpen, request]);

    const loadDetails = async () => {
        if (!request) return;
        setLoadingDetails(true);
        try {
            const data = await coordinatorApi.getRequestDetail(request.requestId || request.id);
            setDetails(data);
        } catch (error) {
            console.error('Failed to load request details for verify:', error);
        } finally {
            setLoadingDetails(false);
        }
    };

    if (!isOpen || !request) return null;

    const displayData = details || request;
    const media = displayData.media || request?.media || [];
    const canVerify = formData.locationConfirmed && formData.mediaAuthentic;

    const handleClickVerify = () => {
        if (!canVerify) {
            toast.error('Vui lòng xác minh đầy đủ trước khi duyệt');
            return;
        }
        setShowConfirmDialog(true);
    };

    const handleConfirmVerify = async () => {
        setLoading(true);
        try {
            await coordinatorApi.verifyRequest(request.requestId || request.id, {
                emergencyLevel: formData.emergencyLevel,
                note: formData.note,
                approved: true,
            });
            toast.success('Xác thực yêu cầu thành công!');
            setShowConfirmDialog(false);
            onSuccess?.();
            onClose();
        } catch (error) {
            toast.error('Xác thực thất bại: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleClickReject = () => {
        setShowRejectDialog(true);
    };

    const handleConfirmReject = async () => {
        if (rejectReasons.length === 0) {
            toast.error('Vui lòng chọn ít nhất 1 lý do từ chối');
            return;
        }
        setLoading(true);
        try {
            // Reject dùng cùng endpoint verify với approved: false
            const reasonLabels = rejectReasons.map(
                (id) => REJECT_REASONS.find((r) => r.id === id)?.label || id
            );
            await coordinatorApi.verifyRequest(request.requestId || request.id, {
                emergencyLevel: formData.emergencyLevel,
                note: [reasonLabels.join('; '), rejectNote].filter(Boolean).join(' — '),
                approved: false,
            });
            toast.success('Đã từ chối yêu cầu');
            setShowRejectDialog(false);
            onSuccess?.();
            onClose();
        } catch (error) {
            toast.error('Từ chối thất bại: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const toggleRejectReason = (reasonId) => {
        setRejectReasons((prev) =>
            prev.includes(reasonId) ? prev.filter((r) => r !== reasonId) : [...prev, reasonId]
        );
    };

    // Sender info: ưu tiên list API (request prop) vì detail API không trả contactName/Phone
    const senderName = request?.contactName || displayData.contactName || request?.citizenName || displayData.citizenName || 'Không rõ';
    const senderPhone = request?.contactPhone || displayData.contactPhone || null;

    return (
        <>
            {/* Main Modal */}
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
                    {/* Header — cố định */}
                    <div className="flex-shrink-0 flex items-center justify-between p-5 border-b border-gray-200">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Xác Thực Yêu Cầu</h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Kiểm tra media đính kèm và xác minh yêu cầu trước khi duyệt
                            </p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Content — cuộn được */}
                    <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-5">
                        {/* Thông tin yêu cầu */}
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase">Tiêu đề</label>
                                <p className="text-sm text-gray-900">{displayData.title || 'Không có tiêu đề'}</p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase">Người gửi</label>
                                <p className="text-sm text-gray-900">
                                    {senderName}
                                    {senderPhone && (
                                        <span className="ml-2 text-gray-500">• {senderPhone}</span>
                                    )}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase">Mô tả</label>
                                <p className="text-sm text-gray-900">{displayData.description}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Số người</label>
                                    <p className="text-sm text-gray-900">{displayData.peopleCount || 0} người</p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Địa điểm cứu trợ</label>
                                    <p className="text-sm text-gray-900 line-clamp-2">
                                        {displayData.location?.addressText || 'Chưa xác định'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Media đính kèm — hiển thị ảnh/video để coordinator kiểm tra */}
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <PhotoIcon className="h-4 w-4 text-gray-500" />
                                Hình ảnh / Video đính kèm
                                {media.length > 0 && (
                                    <span className="text-xs font-normal text-gray-400">({media.length} tệp)</span>
                                )}
                            </h3>
                            {loadingDetails ? (
                                <div className="text-center py-4 text-gray-400 text-xs">Đang tải media...</div>
                            ) : media.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {media.map((m) => (
                                        <div key={m.mediaId} className="aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                            {m.mediaType === 'IMAGE' ? (
                                                <img
                                                    src={m.mediaUrl}
                                                    alt="Bằng chứng"
                                                    className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                                    onClick={() => window.open(m.mediaUrl, '_blank')}
                                                />
                                            ) : (
                                                <video src={m.mediaUrl} controls preload="metadata" className="w-full h-full object-contain bg-black" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400 text-center py-3">Không có media đính kèm</p>
                            )}
                        </div>

                        {/* Phần xác minh — 2 checkbox bắt buộc */}
                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg space-y-3">
                            <h3 className="text-sm font-semibold text-amber-900 flex items-center gap-2">
                                <ExclamationTriangleIcon className="h-4 w-4" />
                                Xác minh thông tin
                            </h3>

                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.locationConfirmed}
                                    onChange={(e) => setFormData({ ...formData, locationConfirmed: e.target.checked })}
                                    className="mt-0.5 h-4 w-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                                />
                                <div>
                                    <p className="text-sm font-medium text-gray-800">
                                        Xác nhận địa điểm đang gặp sự cố
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Tôi đã kiểm tra và xác nhận rằng địa điểm được gửi kèm đang thực sự gặp sự cố lũ lụt / thiên tai.
                                    </p>
                                </div>
                            </label>

                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.mediaAuthentic}
                                    onChange={(e) => setFormData({ ...formData, mediaAuthentic: e.target.checked })}
                                    className="mt-0.5 h-4 w-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                                />
                                <div>
                                    <p className="text-sm font-medium text-gray-800">
                                        Xác nhận ảnh/video không phải do AI tạo
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Tôi đã kiểm tra hình ảnh/video đính kèm và xác nhận chúng là thật, không phải do AI sinh ra.
                                    </p>
                                </div>
                            </label>
                        </div>

                        {/* Phân loại mức độ khẩn cấp */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Mức độ khẩn cấp <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.emergencyLevel}
                                onChange={(e) => setFormData({ ...formData, emergencyLevel: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            >
                                <option value="CRITICAL">🔴 Nghiêm trọng — Đe dọa đến tính mạng</option>
                                <option value="HIGH">🟠 Cao — Cần chú ý khẩn cấp</option>
                                <option value="MEDIUM">🟡 Bình thường — Ưu tiên bình thường</option>
                                <option value="LOW">⚪ Thấp — Không khẩn cấp</option>
                            </select>
                        </div>

                        {/* Ghi chú */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Ghi chú của điều phối viên
                            </label>
                            <textarea
                                rows="2"
                                value={formData.note}
                                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                placeholder="Thêm ghi chú xác thực, hướng dẫn đặc biệt..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            />
                        </div>
                    </div>

                    {/* Footer — cố định */}
                    <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-t border-gray-200 bg-gray-50">
                        <button
                            onClick={handleClickReject}
                            disabled={loading}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 disabled:opacity-50"
                        >
                            <XCircleIcon className="h-4 w-4" />
                            Không duyệt
                        </button>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={onClose}
                                disabled={loading}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleClickVerify}
                                disabled={loading || !canVerify}
                                className="px-6 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Duyệt & Xác thực
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog — modal nhỏ xác nhận lần cuối */}
            {showConfirmDialog && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                                <ExclamationTriangleIcon className="h-5 w-5 text-teal-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Xác nhận duyệt</h3>
                                <p className="text-sm text-gray-500">Hành động này không thể hoàn tác</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-6">
                            Bạn có chắc chắn muốn xác thực yêu cầu <strong>"{request.title}"</strong>? 
                            Yêu cầu sẽ chuyển sang trạng thái <span className="text-teal-600 font-medium">Đã xác thực</span> và sẵn sàng để phân công đội cứu hộ.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowConfirmDialog(false)}
                                disabled={loading}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Quay lại
                            </button>
                            <button
                                onClick={handleConfirmVerify}
                                disabled={loading}
                                className="px-6 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:opacity-50"
                            >
                                {loading ? 'Đang xử lý...' : 'Xác nhận duyệt'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Dialog — modal từ chối yêu cầu */}
            {showRejectDialog && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                <XCircleIcon className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Từ chối yêu cầu</h3>
                                <p className="text-sm text-gray-500">Chọn lý do từ chối</p>
                            </div>
                        </div>

                        <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                            {REJECT_REASONS.map((reason) => (
                                <label key={reason.id} className="flex items-start gap-2 cursor-pointer p-2 rounded hover:bg-gray-50">
                                    <input
                                        type="checkbox"
                                        checked={rejectReasons.includes(reason.id)}
                                        onChange={() => toggleRejectReason(reason.id)}
                                        className="mt-0.5 h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                                    />
                                    <span className="text-sm text-gray-700">{reason.label}</span>
                                </label>
                            ))}
                        </div>

                        <textarea
                            rows="2"
                            value={rejectNote}
                            onChange={(e) => setRejectNote(e.target.value)}
                            placeholder="Ghi chú thêm (không bắt buộc)..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-4"
                        />

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowRejectDialog(false)}
                                disabled={loading}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Quay lại
                            </button>
                            <button
                                onClick={handleConfirmReject}
                                disabled={loading || rejectReasons.length === 0}
                                className="px-6 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Đang xử lý...' : 'Xác nhận từ chối'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
