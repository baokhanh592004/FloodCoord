import React, { useCallback, useEffect, useState } from 'react';
import {
    XMarkIcon, MapPinIcon, UserIcon, PhoneIcon, ClockIcon,
    UserGroupIcon, XCircleIcon, TruckIcon, BeakerIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { coordinatorApi } from '../../services/coordinatorApi';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { MODAL_STYLE_MAP } from '../shared/styleMaps';
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

export default function RequestDetailModal({ request, isOpen, onClose, onValidate, onAssign }) {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(false);

    const loadDetails = useCallback(async () => {
        if (!request) return;
        setLoading(true);
        try {
            const data = await coordinatorApi.getRequestDetail(request.requestId);
            setDetails(data);
        } catch (error) {
            console.error('Failed to load request details:', error);
            setDetails(request);
        } finally {
            setLoading(false);
        }
    }, [request]);

    useEffect(() => {
        if (isOpen && request) {
            loadDetails();
        }
    }, [isOpen, request, loadDetails]);

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
        <div className={MODAL_STYLE_MAP.overlaySoft}>
            <div className={`${MODAL_STYLE_MAP.shell} max-w-4xl`}>
                {/* Header — cố định */}
                <div className={MODAL_STYLE_MAP.headerStart}>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                            <PriorityBadge priority={displayData.emergencyLevel} />
                            <StatusBadge status={displayData.status} />
                            {(displayData.trackingCode || request?.trackingCode) && (
                                <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                                    {displayData.trackingCode || request?.trackingCode}
                                </span>
                            )}
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            {displayData.title || 'Chi tiết yêu cầu cứu hộ'}
                        </h2>
                    </div>
                    <button onClick={onClose} className={MODAL_STYLE_MAP.closeButton}>
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>

                {/* Content — cuộn được */}
                <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-5">
                    {loading && (
                        <div className="text-center py-4 text-gray-400 text-sm italic">Đang tải chi tiết mới nhất...</div>
                    )}

                    {/* 1. Thông tin người gửi */}
                    {(() => {
                        const senderName = request?.contactName || displayData.contactName || request?.citizenName || displayData.citizenName || 'Không rõ';
                        const senderPhone = request?.contactPhone || displayData.contactPhone || null;
                        return (
                            <div className="bg-coordinator-50 border border-coordinator-100 p-4 rounded-lg">
                                <h3 className="text-sm font-semibold text-coordinator-900 mb-3 uppercase tracking-wider">Thông tin người gửi</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2 text-sm text-coordinator-dark">
                                        <UserIcon className="h-4 w-4 shrink-0" />
                                        <span><strong>Người gửi:</strong> {senderName}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-coordinator-dark">
                                        <PhoneIcon className="h-4 w-4 shrink-0" />
                                        <span>
                                            <strong>Số điện thoại:</strong>{' '}
                                            {senderPhone ? (
                                                <a href={`tel:${senderPhone}`} className="hover:underline font-medium">{senderPhone}</a>
                                            ) : 'Không có'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    {/* 2. Đội cứu hộ đã phân công (PHẦN MỚI CẬP NHẬT) */}
                    {(displayData.assignedTeamName || displayData.assignedVehicleName) && (
                        <div className="bg-teal-50 border border-teal-200 p-4 rounded-lg">
                            <h3 className="text-sm font-bold text-teal-900 mb-3 uppercase tracking-wider flex items-center gap-2">
                                <ShieldCheckIcon className="h-5 w-5" />
                                Đội cứu hộ đã phân công
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <p className="text-sm text-teal-800">
                                        <strong>Đội:</strong> {displayData.assignedTeamName}
                                    </p>
                                    {displayData.assignedTeamLeaderPhone && (
                                        <p className="text-sm text-teal-800 flex items-center gap-2">
                                            <PhoneIcon className="h-4 w-4" />
                                            <strong>SĐT Trưởng nhóm:</strong>
                                            <a href={`tel:${displayData.assignedTeamLeaderPhone}`} className="hover:underline font-medium">{displayData.assignedTeamLeaderPhone}</a>
                                        </p>
                                    )}
                                </div>
                                {/* Thay đoạn hiển thị Phương tiện cũ bằng đoạn này */}
                                <div className="space-y-2">
                                    <p className="text-sm text-teal-800 flex items-center gap-2">
                                        <TruckIcon className="h-4 w-4" />
                                        <strong>Phương tiện:</strong>
                                        <span className="font-medium">
                                            {/* Kiểm tra details trước, sau đó mới đến request */}
                                            {details?.assignedVehicleName || request?.assignedVehicleName || (loading ? "Đang tải..." : "Chưa rõ")}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {/* Nhu yếu phẩm mang theo */}
                            {displayData.assignedSupplies && displayData.assignedSupplies.length > 0 && (
                                <div className="mt-4 pt-3 border-t border-teal-200">
                                    <p className="text-xs font-bold text-teal-900 uppercase mb-2 flex items-center gap-1">
                                        <BeakerIcon className="h-4 w-4" /> Nhu yếu phẩm mang theo:
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {displayData.assignedSupplies.map((item, idx) => (
                                            <span key={idx} className="bg-white border border-teal-300 text-teal-800 px-2 py-1 rounded text-xs shadow-sm">
                                                {item.supplyName}: <strong>{item.quantity} {item.unit}</strong>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {displayData.coordinatorNote && (
                                <p className="text-xs text-teal-700 mt-2 italic">Ghi chú: {displayData.coordinatorNote}</p>
                            )}
                        </div>
                    )}

                    {/* 3. Thông số chính - Ép 4 cột trên 1 hàng */}
                    <div className="grid grid-cols-4 gap-2 md:gap-4"> {/* Dùng grid-cols-4 cho tất cả màn hình */}

                        {/* Cột 1: Số người */}
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <p className="text-xs text-gray-500 mb-1 whitespace-nowrap">Số người</p>
                            <div className="flex items-center gap-2">
                                <UserGroupIcon className="h-5 w-5 text-blue-500" />
                                <p className="text-lg font-bold text-gray-900">{displayData.peopleCount || 0}</p>
                            </div>
                        </div>

                        {/* Cột 2: Độ sâu lũ */}
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <p className="text-xs text-gray-500 mb-1 whitespace-nowrap">Độ sâu lũ</p>
                            <p className="text-lg font-bold text-coordinator">
                                {location.floodDepth ? `${location.floodDepth}m` : 'N/A'}
                            </p>
                        </div>

                        {/* Cột 3: Mức độ khẩn cấp */}
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <p className="text-xs text-gray-500 mb-1 whitespace-nowrap">Khẩn cấp</p>
                            <PriorityBadge priority={displayData.emergencyLevel} />
                        </div>

                        {/* Cột 4: Thời gian gửi (ĐÃ XÓA col-span-2) */}
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <p className="text-xs text-gray-500 mb-1 whitespace-nowrap">Thời gian</p>
                            <div className="flex items-center gap-1">
                                <ClockIcon className="h-4 w-4 text-gray-400 shrink-0" />
                                <p className="text-[11px] md:text-sm font-semibold text-gray-900 leading-tight">
                                    {formatDate(displayData.createdAt)}
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* 4. Địa điểm & Bản đồ */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wider">Vị trí hiện trường</h3>
                        <div className="flex items-start gap-2 mb-3 bg-gray-50 p-3 rounded border border-gray-100">
                            <MapPinIcon className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                            <p className="text-sm text-gray-700 font-medium">
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

                    {/* 5. Hình ảnh / Video */}
                    {displayData.media && displayData.media.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wider">
                                Bằng chứng hiện trường ({displayData.media.length})
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {displayData.media.map((media) => (
                                    <div key={media.mediaId} className="aspect-video bg-black rounded-lg overflow-hidden shadow-sm">
                                        {media.mediaType?.includes('IMAGE') || media.mediaType === 'string' ? (
                                            <img
                                                src={media.mediaUrl}
                                                alt="Bằng chứng"
                                                className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                                onClick={() => window.open(media.mediaUrl, '_blank')}
                                            />
                                        ) : (
                                            <video src={media.mediaUrl} controls preload="metadata" className="w-full h-full object-contain" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 6. Mô tả */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wider">Mô tả chi tiết</h3>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 leading-relaxed">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap italic">
                                {displayData.description || 'Không có mô tả.'}
                            </p>
                        </div>
                    </div>

                    {/* 7. Lý do từ chối */}
                    {displayData.status === 'REJECTED' && (
                        <div className="bg-rose-50 border border-rose-200 p-4 rounded-lg">
                            <h3 className="text-sm font-semibold text-rose-900 mb-2 flex items-center gap-2 uppercase tracking-wider">
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
                                <p className="text-sm text-rose-800 font-medium">Không có lý do cụ thể</p>
                            )}
                            {displayData.rejectNote && (
                                <p className="text-xs text-rose-700 mt-2 border-t border-rose-100 pt-2">Ghi chú: {displayData.rejectNote}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer — cố định */}
                <div className={MODAL_STYLE_MAP.footerEnd}>
                    <button
                        onClick={onClose}
                        className={MODAL_STYLE_MAP.secondaryButton}
                    >
                        Đóng
                    </button>
                    {displayData.status === 'PENDING' && onValidate && (
                        <button
                            onClick={() => { onClose(); onValidate(displayData); }}
                            className={MODAL_STYLE_MAP.primaryCoordinator}
                        >
                            Xác thực yêu cầu
                        </button>
                    )}
                    {(displayData.status === 'VERIFIED' || displayData.status === 'VALIDATED') && !displayData.assignedTeamId && !displayData.assignedTeamName && onAssign && (
                        <button
                            onClick={() => { onClose(); onAssign(displayData); }}
                            className="px-5 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 shadow-sm"
                        >
                            Phân công đội cứu hộ
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}