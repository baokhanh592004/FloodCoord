import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { coordinatorApi } from '../../services/coordinatorApi';
import toast from 'react-hot-toast';

/**
 * VerifyRequestModal - Modal for coordinator to validate pending requests
 * 
 * FUNCTION:
 * - Review pending rescue requests
 * - Adjust emergency level if needed
 * - Add coordinator notes
 * - Approve (PENDING -> VERIFIED) or Reject
 * 
 * FLOW:
 * 1. Coordinator opens modal from pending request
 * 2. Reviews details and adjusts priority
 * 3. Clicks "Approve" -> calls coordinatorApi.verifyRequest()
 * 4. Backend changes status to VERIFIED
 * 5. Request moves to "Assign Teams" queue
 */
export default function VerifyRequestModal({ request, isOpen, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        emergencyLevel: request?.emergencyLevel || 'HIGH',
        note: '',
    });
    const [loading, setLoading] = useState(false);

    if (!isOpen || !request) return null;

    const handleVerify = async () => {
        setLoading(true);
        try {
            await coordinatorApi.verifyRequest(request.requestId || request.id, formData);
            toast.success('Request validated successfully!');
            onSuccess?.();
            onClose();
        } catch (error) {
            toast.error('Failed to validate request: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Validate Request</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Review and approve rescue request
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Request Details */}
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase">Request ID</label>
                            <p className="text-sm text-gray-900">{request.trackingCode || request.requestId}</p>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase">Title</label>
                            <p className="text-sm text-gray-900">{request.title || 'No title'}</p>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase">Description</label>
                            <p className="text-sm text-gray-900">{request.description}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase">People Count</label>
                                <p className="text-sm text-gray-900">{request.peopleCount || 0} people</p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase">Location</label>
                                <p className="text-sm text-gray-900 line-clamp-2">
                                    {request.location?.addressText || 'Location not specified'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Validation Form */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Emergency Level <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.emergencyLevel}
                            onChange={(e) => setFormData({ ...formData, emergencyLevel: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        >
                            <option value="CRITICAL">🔴 Critical - Life threatening</option>
                            <option value="HIGH">🟠 High - Urgent attention needed</option>
                            <option value="MEDIUM">🟡 Medium - Standard priority</option>
                            <option value="NORMAL">🟡 Normal - Standard priority</option>
                            <option value="LOW">⚪ Low - Non-urgent</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            Adjust priority based on the situation severity
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Coordinator Notes
                        </label>
                        <textarea
                            rows="4"
                            value={formData.note}
                            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                            placeholder="Add verification notes, special instructions, or concerns..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleVerify}
                        disabled={loading}
                        className="px-6 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:opacity-50"
                    >
                        {loading ? 'Validating...' : 'Approve & Validate'}
                    </button>
                </div>
            </div>
        </div>
    );
}
