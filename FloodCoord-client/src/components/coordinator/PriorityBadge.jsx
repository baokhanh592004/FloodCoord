import React from 'react';

export default function PriorityBadge({ priority }) {
    const getBadgeStyles = () => {
        switch (priority?.toUpperCase()) {
            case 'CRITICAL':
                return 'bg-red-100 text-red-700 border-red-300';
            case 'HIGH':
                return 'bg-orange-100 text-orange-700 border-orange-300';
            case 'MEDIUM':
                return 'bg-green-100 text-green-700 border-green-300';
            case 'NORMAL':
                return 'bg-green-100 text-green-700 border-green-300';
            case 'LOW':
                return 'bg-gray-100 text-gray-700 border-gray-300';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };

    const getDisplayText = () => {
        switch (priority?.toUpperCase()) {
            case 'CRITICAL':
                return 'Critical';
            case 'HIGH':
                return 'High';
            case 'MEDIUM':
                return 'Medium';
            case 'NORMAL':
                return 'Medium';
            case 'LOW':
                return 'Low';
            default:
                return priority;
        }
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeStyles()}`}>
            {getDisplayText()}
        </span>
    );
}
