import React, { useEffect, useMemo, useState } from 'react';
import { coordinatorApi } from '../../services/coordinatorApi';
import { teamApi } from '../../services/teamApi';
import { vehicleApi } from '../../services/vehicleApi';
import { supplyApi } from '../../services/supplyApi';
import StatCard from '../../components/coordinator/StatCard';
import RequestCard from '../../components/coordinator/RequestCard';
import TeamCard from '../../components/coordinator/TeamCard';
import ResourceCounter from '../../components/coordinator/ResourceCounter';
import VerifyRequestModal from '../../components/coordinator/VerifyRequestModal';
import AssignTaskModal from '../../components/coordinator/AssignTaskModal';
import RequestDetailModal from '../../components/coordinator/RequestDetailModal';
import {
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ClockIcon,
    UserGroupIcon,
    TruckIcon,
    ArrowPathIcon,
    LifebuoyIcon,
    CubeIcon,
} from '@heroicons/react/24/outline';

export default function CoordinatorDashboard() {
    const [requests, setRequests] = useState([]);
    const [teams, setTeams] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [supplies, setSupplies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const [reqData, teamData, vehicleData, supplyData] = await Promise.all([
                coordinatorApi.getAllRequests(),
                teamApi.getAllTeams(),
                vehicleApi.getAllVehicles(),
                supplyApi.getAllSupplies(),
            ]);

            setRequests(reqData || []);
            setTeams(teamData || []);
            setVehicles(vehicleData || []);
            setSupplies(supplyData || []);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
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
        const inProgress = requests.filter((r) => r.status === 'IN_PROGRESS').length;
        const teamsAvailable = teams.filter((t) => t.status === 'AVAILABLE' && t.isActive !== false).length;
        const vehiclesReady = vehicles.filter((v) => v.status === 'AVAILABLE').length;

        return {
            pending,
            validated,
            inProgress,
            teamsAvailable,
            vehiclesReady,
        };
    }, [requests, teams, vehicles]);

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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard icon={<ExclamationTriangleIcon className="h-6 w-6" />} count={stats.pending} label="Pending" color="red" />
                <StatCard icon={<CheckCircleIcon className="h-6 w-6" />} count={stats.validated} label="Validated" color="blue" />
                <StatCard icon={<ClockIcon className="h-6 w-6" />} count={stats.inProgress} label="In Progress" color="yellow" />
                <StatCard icon={<UserGroupIcon className="h-6 w-6" />} count={stats.teamsAvailable} label="Teams Available" color="green" />
                <StatCard icon={<TruckIcon className="h-6 w-6" />} count={stats.vehiclesReady} label="Vehicles Ready" color="cyan" />
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

                <div className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Rescue Teams</h2>
                            <span className="text-xs text-gray-500">{teams.length} teams</span>
                        </div>
                        <div className="space-y-3">
                            {teams.slice(0, 5).map((team) => (
                                <TeamCard key={team.id} team={team} />
                            ))}
                            {teams.length === 0 && (
                                <div className="text-sm text-gray-500">No teams available.</div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-5">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Resources Available</h2>
                        <div className="space-y-3">
                            <ResourceCounter
                                icon={<LifebuoyIcon className="h-5 w-5" />}
                                label="Boats"
                                current={vehicles.filter((v) => v.type === 'BOAT' && v.status === 'AVAILABLE').length}
                                total={vehicles.filter((v) => v.type === 'BOAT').length}
                            />
                            <ResourceCounter
                                icon={<TruckIcon className="h-5 w-5" />}
                                label="Trucks"
                                current={vehicles.filter((v) => v.type === 'TRUCK' && v.status === 'AVAILABLE').length}
                                total={vehicles.filter((v) => v.type === 'TRUCK').length}
                            />
                            <ResourceCounter
                                icon={<CubeIcon className="h-5 w-5" />}
                                label="Relief Kits"
                                current={supplies.reduce((sum, s) => sum + (s.quantity || 0), 0)}
                                total={supplies.reduce((sum, s) => sum + (s.quantity || 0), 0)}
                            />
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-5">

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
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                        <div className="space-y-2">
                            <button className="w-full text-left px-3 py-2 text-sm border border-gray-200 rounded-md hover:bg-gray-50">
                                Validate Requests
                            </button>
                            <button className="w-full text-left px-3 py-2 text-sm border border-gray-200 rounded-md hover:bg-gray-50">
                                Assign Teams
                            </button>
                            <button className="w-full text-left px-3 py-2 text-sm border border-gray-200 rounded-md hover:bg-gray-50">
                                Operations Map
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
