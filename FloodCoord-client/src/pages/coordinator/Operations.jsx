import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { coordinatorApi } from '../../services/coordinatorApi';
import StatusBadge from '../../components/coordinator/StatusBadge';
import PriorityBadge from '../../components/coordinator/PriorityBadge';
import RequestDetailModal from '../../components/coordinator/RequestDetailModal';
import { MapIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

// Fix Leaflet marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function Operations() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await coordinatorApi.getAllRequests();
            setRequests(data || []);
        } catch (error) {
            console.error('Failed to load operations data:', error);
        } finally {
            setLoading(false);
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Operations</h1>
                    <p className="text-sm text-gray-600">Track ongoing rescue missions and team progress.</p>
                </div>
                <button
                    onClick={loadData}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-md text-sm font-medium hover:bg-teal-700 disabled:opacity-60"
                >
                    <ArrowPathIcon className="h-4 w-4" />
                    {loading ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-5">
                    <div className="flex items-center gap-2 text-gray-700 mb-4">
                        <MapIcon className="h-5 w-5" />
                        <span className="text-sm font-semibold">Live Operations Map</span>
                    </div>
                    <div className="h-96 rounded-lg overflow-hidden border border-gray-300">
                        <MapContainer
                            center={[10.8231, 106.6297]}
                            zoom={12}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            {activeRequests.map((req) => {
                                const loc = req.location;
                                if (!loc?.latitude || !loc?.longitude) return null;

                                return (
                                    <Marker
                                        key={req.requestId || req.id}
                                        position={[loc.latitude, loc.longitude]}
                                        eventHandlers={{
                                            click: () => {
                                                setSelectedRequest(req);
                                                setShowDetailModal(true);
                                            },
                                        }}
                                    >
                                        <Popup>
                                            <div className="text-sm">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <PriorityBadge priority={req.emergencyLevel} />
                                                    <StatusBadge status={req.status} />
                                                </div>
                                                <p className="font-semibold text-gray-900">{req.title || 'Emergency Request'}</p>
                                                <p className="text-xs text-gray-600 mt-1">{loc.addressText}</p>
                                                {req.assignedTeamName && (
                                                    <p className="text-xs text-green-700 mt-2">
                                                        🚨 Team: {req.assignedTeamName}
                                                    </p>
                                                )}
                                            </div>
                                        </Popup>
                                    </Marker>
                                );
                            })}
                        </MapContainer>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Missions</h2>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {activeRequests.map((req) => (
                            <div
                                key={req.requestId || req.id}
                                className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={() => {
                                    setSelectedRequest(req);
                                    setShowDetailModal(true);
                                }}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-semibold text-gray-900">
                                        {req.title || req.trackingCode}
                                    </span>
                                    <StatusBadge status={req.status} />
                                </div>
                                <p className="text-xs text-gray-500 mb-2">
                                    {req.location?.addressText || 'Location not specified'}
                                </p>
                                {req.assignedTeamName && (
                                    <p className="text-xs text-green-700">🚨 {req.assignedTeamName}</p>
                                )}
                            </div>
                        ))}
                        {activeRequests.length === 0 && !loading && (
                            <div className="text-sm text-gray-500">No active missions at the moment.</div>
                        )}
                        {loading && (
                            <div className="text-sm text-gray-500">Loading missions...</div>
                        )}
                    </div>
                </div>
            </div>

            <RequestDetailModal
                request={selectedRequest}
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
            />
        </div>
    );
}
