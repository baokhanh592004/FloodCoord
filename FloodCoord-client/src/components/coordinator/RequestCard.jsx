import React from 'react';
import { MapPinIcon, UserGroupIcon, ClockIcon } from '@heroicons/react/24/outline';
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';

export default function RequestCard({ request, onValidate, onAssign, onViewDetails }) {
    const formatTimeAgo = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        
        if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
        return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
    };

    return (
        <div className="bg-white border border-neutral-100 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
             onClick={onViewDetails}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-mono text-neutral-400">{request.trackingCode || request.requestId}</span>
                        <PriorityBadge priority={request.emergencyLevel} />
                        <StatusBadge status={request.status} />
                    </div>
                    <h3 className="text-base font-semibold text-neutral-900 mb-1">
                        {request.title || request.description?.substring(0, 50)}
                    </h3>
                </div>
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-neutral-600">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    <span className="line-clamp-1">
                        {request.location?.addressText || request.contactName || 'Vị trí không được chỉ định'}
                    </span>
                </div>
                <div className="flex items-center text-sm text-neutral-600">
                    <UserGroupIcon className="h-4 w-4 mr-2" />
                    <span>{request.peopleCount || 0} people</span>
                </div>
                <div className="flex items-center text-sm text-neutral-600">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    <span>{formatTimeAgo(request.createdAt)}</span>
                </div>
            </div>

            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                {request.status === 'PENDING' && onValidate && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onValidate(request);
                        }}
                        className="flex-1 px-3 py-2 bg-coordinator text-white text-sm font-medium rounded-md hover:bg-coordinator-dark transition-colors"
                    >
                        Xác thực
                    </button>
                )}
                {(request.status === 'VERIFIED' || request.status === 'VALIDATED') && onAssign && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onAssign(request);
                        }}
                        className="flex-1 px-3 py-2 bg-success text-white text-sm font-medium rounded-md hover:bg-success-dark transition-colors"
                    >
                        Phân công đội cứu hộ
                    </button>
                )}
                {(request.status === 'IN_PROGRESS' || request.status === 'ASSIGNED') && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails(request);
                        }}
                        className="flex-1 px-3 py-2 bg-warning text-white text-sm font-medium rounded-md hover:bg-warning-dark transition-colors"
                    >
                        Theo dõi
                    </button>
                )}
            </div>
        </div>
    );
}
