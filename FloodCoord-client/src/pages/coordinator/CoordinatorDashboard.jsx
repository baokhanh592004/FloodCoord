import React, { useEffect, useMemo, useState } from 'react';
import { coordinatorApi } from '../../services/coordinatorApi';
import StatCard from '../../components/coordinator/StatCard';
import RequestCard from '../../components/coordinator/RequestCard';
import VerifyRequestModal from '../../components/coordinator/VerifyRequestModal';
import AssignTaskModal from '../../components/coordinator/AssignTaskModal';
import RequestDetailModal from '../../components/coordinator/RequestDetailModal';
import {
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ClockIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline';

export default function CoordinatorDashboard() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            // Coordinator can only access rescue requests
            // Teams, vehicles, and supplies require MANAGER/ADMIN roles
            const reqData = await coordinatorApi.getAllRequests();
            setRequests(reqData || []);
        } catch (error) {
            console.error('Failed to load requests:', error);
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const stats = useMemo(() => {
        const pending = requests.filter((r) => r.status === 'PENDING').length;
        const validated = requests.filter((r) => r.status === 'VERIFIED' || r.status === 'VALIDATED').length;
        const inProgress = requests.filter((r) => r.status === 'IN_PROGRESS' || r.status === 'MOVING' || r.status === 'ARRIVED' || r.status === 'RESCUING').length;

        return {
            pending,
            validated,
            inProgress,
        };
    }, [requests]);

    const recentRequests = requests.slice(0, 5);

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Coordinator Dashboard</h1>
                    <p className="text-sm text-gray-600">Validate requests, assign teams, and coordinate rescue operations.</p>
                </div>
                <button
                    onClick={loadData}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-md text-sm font-medium hover:bg-teal-700 disabled:opacity-60"
                >
                    <ArrowPathIcon className="h-4 w-4" />
                    {loading ? 'Refreshing...' : 'Refresh Data'}
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard icon={<ExclamationTriangleIcon className="h-6 w-6" />} count={stats.pending} label="Pending Requests" color="red" />
                <StatCard icon={<CheckCircleIcon className="h-6 w-6" />} count={stats.validated} label="Validated Requests" color="blue" />
                <StatCard icon={<ClockIcon className="h-6 w-6" />} count={stats.inProgress} label="In Progress" color="yellow" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Incoming Requests</h2>
                            <p className="text-xs text-gray-500">Validate and assign rescue requests</p>
                        </div>
                        <div className="text-sm text-gray-500">Showing {recentRequests.length} items</div>
                    </div>

                    <div className="space-y-4">
                        {recentRequests.map((req) => (
                            <RequestCard
                                key={req.requestId || req.id}
                                request={req}
                                onValidate={(r) => {
                                    setSelectedRequest(r);
                                    setShowVerifyModal(true);
                                }}
                                onAssign={(r) => {
                                    setSelectedRequest(r);
                                    setShowAssignModal(true);
                                }}
                                onViewDetails={(r) => {
                                    setSelectedRequest(r);
                                    setShowDetailModal(true);
                                }}
                            />
                        ))}
                        {recentRequests.length === 0 && (
                            <div className="text-sm text-gray-500">No incoming requests.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <VerifyRequestModal
                request={selectedRequest}
                isOpen={showVerifyModal}
                onClose={() => setShowVerifyModal(false)}
                onSuccess={loadData}
            />
            <AssignTaskModal
                request={selectedRequest}
                isOpen={showAssignModal}
                onClose={() => setShowAssignModal(false)}
                onSuccess={loadData}
            />
            <RequestDetailModal
                request={selectedRequest}
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                onValidate={(r) => {
                    setSelectedRequest(r);
                    setShowVerifyModal(true);
                }}
                onAssign={(r) => {
                    setSelectedRequest(r);
                    setShowAssignModal(true);
                }}
            />
        </div>
    );
}
