import React, { useEffect, useState } from 'react';
import { XMarkIcon, MapPinIcon, UserIcon, PhoneIcon, ClockIcon, UserGroupIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { coordinatorApi } from '../../services/coordinatorApi';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

/**
 * RequestDetailModal — Hiển thị chi tiết đầy đủ yêu cầu cứu hộ
 *
 * Hiển thị:
 * - Tên yêu cầu, người gửi, SĐT người gửi
 * - Địa điểm cần cứu trợ (+ bản đồ)
 * - Số người cần cứu trợ
 * - Hình ảnh / Video đính kèm
 * - Mô tả chi tiết
 *
 * Cuối modal:
 * - Nếu PENDING → nút "Xác thực yêu cầu"
 * - Nếu VERIFIED/VALIDATED → nút "Phân công đội cứu hộ"
 */
export default function RequestDetailModal({ request, isOpen, onClose, onValidate, onAssign }) {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && request) {
            loadDetails();
        }
    }, [isOpen, request]);

    const loadDetails = async () => {
        setLoading(true);
        try {
            const data = await coordinatorApi.getRequestDetail(request.requestId || request.id);
            setDetails(data);
        } catch (error) {
            console.error('Failed to load request details:', error);
            setDetails(request);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !request) return null;

    const displayData = details || request;
    const location = displayData.location || {};
    const hasLocation = location.latitude && location.longitude;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
                {/* Header — cố định */}
                <div className="flex-shrink-0 flex items-start justify-between p-5 border-b border-gray-200">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                            <PriorityBadge priority={displayData.emergencyLevel} />
                            <StatusBadge status={displayData.status} />
                            {displayData.trackingCode && (
                                <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                                    {displayData.trackingCode}
                                </span>
                            )}
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            {displayData.title || 'Chi tiết yêu cầu cứu hộ'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>

                {/* Content — cuộn được */}
                <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-5">
                    {loading && (
                        <div className="text-center py-4 text-gray-400 text-sm">Đang tải chi tiết...</div>
                    )}

                    {/* Thông tin người gửi — ưu tiên lấy từ request (list API) vì detail API có thể không trả về */}
                    {(() => {
                        const senderName = request?.contactName || displayData.contactName || request?.citizenName || displayData.citizenName || 'Không rõ';
                        const senderPhone = request?.contactPhone || displayData.contactPhone || null;
                        return (
                            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                                <h3 className="text-sm font-semibold text-blue-900 mb-3">Thông tin người gửi</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2 text-sm text-blue-800">
                                        <UserIcon className="h-4 w-4 flex-shrink-0" />
                                        <span><strong>Người gửi:</strong> {senderName}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-blue-800">
                                        <PhoneIcon className="h-4 w-4 flex-shrink-0" />
                                        <span>
                                            <strong>Số điện thoại:</strong>{' '}
                                            {senderPhone ? (
                                                <a href={`tel:${senderPhone}`} className="hover:underline">{senderPhone}</a>
                                            ) : 'Không có'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    {/* Thông tin chính */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Số người cần cứu</p>
                            <div className="flex items-center gap-2">
                                <UserGroupIcon className="h-5 w-5 text-gray-400" />
                                <p className="text-lg font-semibold text-gray-900">
                                    {displayData.peopleCount || 0}
                                </p>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Thời gian gửi</p>
                            <div className="flex items-center gap-2">
                                <ClockIcon className="h-5 w-5 text-gray-400" />
                                <p className="text-sm font-semibold text-gray-900">
                                    {formatDate(displayData.createdAt)}
                                </p>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Độ sâu lũ lụt</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {location.floodDepth ? `${location.floodDepth}m` : 'N/A'}
                            </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Mức độ khẩn cấp</p>
                            <PriorityBadge priority={displayData.emergencyLevel} />
                        </div>
                    </div>

                    {/* Địa điểm cần cứu trợ */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Địa điểm cần cứu trợ</h3>
                        <div className="flex items-start gap-2 mb-3">
                            <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-700">
                                {location.addressText || 'Chưa xác định địa chỉ'}
                            </p>
                        </div>
                        {hasLocation && (
                            <div className="h-56 rounded-lg overflow-hidden border border-gray-300">
                                <MapContainer
                                    center={[location.latitude, location.longitude]}
                                    zoom={15}
                                    style={{ height: '100%', width: '100%' }}
                                >
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <Marker position={[location.latitude, location.longitude]}>
                                        <Popup>
                                            <div className="text-sm">
                                                <p className="font-semibold">{displayData.title}</p>
                                                <p className="text-xs text-gray-600">{location.addressText}</p>
                                            </div>
                                        </Popup>
                                    </Marker>
                                </MapContainer>
                            </div>
                        )}
                    </div>

                    {/* Hình ảnh / Video đính kèm */}
                    {displayData.media && displayData.media.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">
                                Hình ảnh / Video đính kèm ({displayData.media.length})
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {displayData.media.map((media) => (
                                    <div key={media.mediaId} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                        {media.mediaType === 'IMAGE' ? (
                                            <img
                                                src={media.mediaUrl}
                                                alt="Bằng chứng"
                                                className="w-full h-full object-cover cursor-pointer hover:opacity-90"
                                                onClick={() => window.open(media.mediaUrl, '_blank')}
                                            />
                                        ) : (
                                            <video src={media.mediaUrl} controls preload="metadata" className="w-full h-full object-contain bg-black" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Mô tả chi tiết */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Mô tả</h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                {displayData.description || 'Không có mô tả.'}
                            </p>
                        </div>
                    </div>

                    {/* Đội đã được phân công */}
                    {displayData.assignedTeamName && (
                        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                            <h3 className="text-sm font-semibold text-green-900 mb-2">Đội được phân công</h3>
                            <p className="text-sm text-green-800">{displayData.assignedTeamName}</p>
                            {displayData.coordinatorNote && (
                                <p className="text-xs text-green-700 mt-2">
                                    Ghi chú: {displayData.coordinatorNote}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Lý do từ chối — chỉ hiển khi REJECTED */}
                    {displayData.status === 'REJECTED' && (
                        <div className="bg-rose-50 border border-rose-200 p-4 rounded-lg">
                            <h3 className="text-sm font-semibold text-rose-900 mb-2 flex items-center gap-2">
                                <XCircleIcon className="h-4 w-4" />
                                Lý do từ chối
                            </h3>
                            {displayData.rejectReasons && displayData.rejectReasons.length > 0 ? (
                                <ul className="text-sm text-rose-800 list-disc list-inside space-y-1">
                                    {displayData.rejectReasons.map((reason, i) => (
                                        <li key={i}>{reason}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-rose-800">Không có lý do cụ thể</p>
                            )}
                            {displayData.rejectNote && (
                                <p className="text-xs text-rose-700 mt-2">Ghi chú: {displayData.rejectNote}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer — cố định, nút hành động theo trạng thái */}
                <div className="flex-shrink-0 flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Đóng
                    </button>
                    {displayData.status === 'PENDING' && onValidate && (
                        <button
                            onClick={() => {
                                onClose();
                                onValidate(displayData);
                            }}
                            className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                            Xác thực yêu cầu
                        </button>
                    )}
                    {(displayData.status === 'VERIFIED' || displayData.status === 'VALIDATED') && onAssign && (
                        <button
                            onClick={() => {
                                onClose();
                                onAssign(displayData);
                            }}
                            className="px-5 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700"
                        >
                            Phân công đội cứu hộ
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
