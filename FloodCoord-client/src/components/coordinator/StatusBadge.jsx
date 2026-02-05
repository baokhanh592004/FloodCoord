import React from 'react';

export default function StatusBadge({ status }) {
    const getBadgeStyles = () => {
        switch (status?.toUpperCase()) {
            case 'PENDING':
                return 'bg-gray-100 text-gray-700 border-gray-300';
            case 'VERIFIED':
                return 'bg-cyan-100 text-cyan-700 border-cyan-300';
            case 'IN_PROGRESS':
                return 'bg-blue-100 text-blue-700 border-blue-300';
            case 'MOVING':
                return 'bg-purple-100 text-purple-700 border-purple-300';
            case 'ARRIVED':
                return 'bg-indigo-100 text-indigo-700 border-indigo-300';
            case 'RESCUING':
                return 'bg-yellow-100 text-yellow-700 border-yellow-300';
            case 'COMPLETED':
                return 'bg-green-100 text-green-700 border-green-300';
            case 'CANCELLED':
                return 'bg-red-100 text-red-700 border-red-300';
            case 'ASSIGNED':
                return 'bg-green-100 text-green-700 border-green-300';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };

    const getDisplayText = () => {
        switch (status?.toUpperCase()) {
            case 'PENDING':
                return 'Pending';
            case 'VERIFIED':
                return 'Validated';
            case 'IN_PROGRESS':
                return 'In Progress';
            case 'MOVING':
                return 'Moving';
            case 'ARRIVED':
                return 'Arrived';
            case 'RESCUING':
                return 'Rescuing';
            case 'COMPLETED':
                return 'Completed';
            case 'CANCELLED':
                return 'Cancelled';
            case 'ASSIGNED':
                return 'Assigned';
            default:
                return status;
        }
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeStyles()}`}>
            {getDisplayText()}
        </span>
    );
}
