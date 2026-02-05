import React from 'react';
import { UserGroupIcon } from '@heroicons/react/24/outline';

export default function TeamCard({ team }) {
    const getStatusColor = () => {
        if (!team.isActive) return 'bg-gray-100 text-gray-700';
        
        switch (team.status?.toUpperCase()) {
            case 'AVAILABLE':
                return 'bg-green-100 text-green-700';
            case 'BUSY':
                return 'bg-orange-100 text-orange-700';
            case 'OFF_DUTY':
                return 'bg-gray-100 text-gray-700';
            default:
                return 'bg-blue-100 text-blue-700';
        }
    };

    const getStatusText = () => {
        if (!team.isActive) return 'Inactive';
        
        switch (team.status?.toUpperCase()) {
            case 'AVAILABLE':
                return 'Available';
            case 'BUSY':
                return 'On Mission';
            case 'OFF_DUTY':
                return 'Resting';
            default:
                return 'Available';
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">{team.name}</h3>
                    <p className="text-xs text-gray-500">{team.members?.length || 0} members</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
                    {getStatusText()}
                </span>
            </div>
            
            {team.leaderName && (
                <div className="flex items-center text-xs text-gray-600 mb-2">
                    <UserGroupIcon className="h-3.5 w-3.5 mr-1.5" />
                    <span>Leader: {team.leaderName}</span>
                </div>
            )}
            
            {team.description && (
                <p className="text-xs text-gray-500 line-clamp-2">{team.description}</p>
            )}
        </div>
    );
}
