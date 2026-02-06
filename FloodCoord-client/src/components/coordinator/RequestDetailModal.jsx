import React, { useEffect, useState } from 'react';
import { XMarkIcon, MapPinIcon, UserIcon, PhoneIcon, ClockIcon } from '@heroicons/react/24/outline';
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
 * RequestDetailModal - Full details view of a rescue request
 * 
 * FUNCTION:
 * - Display complete request information
 * - Show location on interactive map
 * - Display media attachments (photos/videos)
 * - Show timeline and status history
 * - Display assigned team info
 * 
 * FLOW:
 * 1. User clicks request card from any page
 * 2. Modal fetches full request details from API
 * 3. Shows all info: location, media, contact, team, timeline
 * 4. Coordinator can close or take action (validate/assign)
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
            setDetails(request); // Fallback to basic request data
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
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-gray-200">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <PriorityBadge priority={displayData.emergencyLevel} />
                            <StatusBadge status={displayData.status} />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            {displayData.title || 'Rescue Request Details'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Request ID: {displayData.trackingCode || displayData.requestId}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Description */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
                        <p className="text-sm text-gray-700">{displayData.description}</p>
                    </div>

                    {/* Key Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500">People Count</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {displayData.peopleCount || 0}
                            </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500">Reported</p>
                            <p className="text-sm font-semibold text-gray-900">
                                {formatDate(displayData.createdAt)}
                            </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500">Flood Depth</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {location.floodDepth ? `${location.floodDepth}m` : 'N/A'}
                            </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500">Contact</p>
                            <p className="text-sm font-semibold text-gray-900">
                                {displayData.contactName || displayData.citizenName || 'Unknown'}
                            </p>
                        </div>
                    </div>

                    {/* Contact Info */}
                    {(displayData.contactName || displayData.contactPhone) && (
                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                            <h3 className="text-sm font-semibold text-blue-900 mb-3">Contact Information</h3>
                            <div className="space-y-2">
                                {displayData.contactName && (
                                    <div className="flex items-center gap-2 text-sm text-blue-800">
                                        <UserIcon className="h-4 w-4" />
                                        <span>{displayData.contactName}</span>
                                    </div>
                                )}
                                {displayData.contactPhone && (
                                    <div className="flex items-center gap-2 text-sm text-blue-800">
                                        <PhoneIcon className="h-4 w-4" />
                                        <a href={`tel:${displayData.contactPhone}`} className="hover:underline">
                                            {displayData.contactPhone}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Location Map */}
                    {hasLocation && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Location</h3>
                            <div className="flex items-start gap-2 mb-3">
                                <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-gray-700">{location.addressText}</p>
                            </div>
                            <div className="h-64 rounded-lg overflow-hidden border border-gray-300">
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
                        </div>
                    )}

                    {/* Media */}
                    {displayData.media && displayData.media.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Media Attachments</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {displayData.media.map((media) => (
                                    <div key={media.mediaId} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                        {media.mediaType === 'IMAGE' ? (
                                            <img
                                                src={media.mediaUrl}
                                                alt="Evidence"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <video src={media.mediaUrl} controls className="w-full h-full" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Assigned Team */}
                    {displayData.assignedTeamName && (
                        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                            <h3 className="text-sm font-semibold text-green-900 mb-2">Assigned Team</h3>
                            <p className="text-sm text-green-800">{displayData.assignedTeamName}</p>
                            {displayData.coordinatorNote && (
                                <p className="text-xs text-green-700 mt-2">
                                    Note: {displayData.coordinatorNote}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Close
                    </button>
                    {displayData.status === 'PENDING' && onValidate && (
                        <button
                            onClick={() => {
                                onClose();
                                onValidate(displayData);
                            }}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                            Validate Request
                        </button>
                    )}
                    {(displayData.status === 'VERIFIED' || displayData.status === 'VALIDATED') && onAssign && (
                        <button
                            onClick={() => {
                                onClose();
                                onAssign(displayData);
                            }}
                            className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700"
                        >
                            Assign Team
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
