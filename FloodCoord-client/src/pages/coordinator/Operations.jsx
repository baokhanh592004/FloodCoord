import React, { useEffect, useMemo, useState } from 'react';
import { coordinatorApi } from '../../services/coordinatorApi';
import StatusBadge from '../../components/coordinator/StatusBadge';
import { MapIcon } from '@heroicons/react/24/outline';

export default function Operations() {
    const [requests, setRequests] = useState([]);

    const loadData = async () => {
        try {
            const data = await coordinatorApi.getAllRequests();
            setRequests(data || []);
        } catch (error) {
            console.error('Failed to load operations data:', error);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const activeRequests = useMemo(
        () =>
            requests.filter((r) =>
                ['IN_PROGRESS', 'MOVING', 'ARRIVED', 'RESCUING'].includes(r.status)
            ),
        [requests]
    );

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Operations</h1>
                <p className="text-sm text-gray-600">Track ongoing rescue missions and team progress.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-5">
                    <div className="flex items-center gap-2 text-gray-500 mb-4">
                        <MapIcon className="h-5 w-5" />
                        <span className="text-sm">Operations Map (placeholder)</span>
                    </div>
                    <div className="h-80 bg-gray-50 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-sm text-gray-500">
                        Map integration will be added in Phase 4
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Missions</h2>
                    <div className="space-y-3">
                        {activeRequests.map((req) => (
                            <div key={req.requestId || req.id} className="border border-gray-200 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-semibold text-gray-900">
                                        {req.title || req.trackingCode}
                                    </span>
                                    <StatusBadge status={req.status} />
                                </div>
                                <p className="text-xs text-gray-500">
                                    {req.location?.addressText || 'Location not specified'}
                                </p>
                            </div>
                        ))}
                        {activeRequests.length === 0 && (
                            <div className="text-sm text-gray-500">No active missions.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
