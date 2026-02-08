import React, { useEffect, useMemo, useState } from 'react';
import { coordinatorApi } from '../../services/coordinatorApi';
import { teamApi } from '../../services/teamApi';
import { vehicleApi } from '../../services/vehicleApi';
import { supplyApi } from '../../services/supplyApi';
import RequestCard from '../../components/coordinator/RequestCard';
import AssignTaskModal from '../../components/coordinator/AssignTaskModal';
import RequestDetailModal from '../../components/coordinator/RequestDetailModal';

export default function AssignTeams() {
    const [requests, setRequests] = useState([]);
    const [teams, setTeams] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [supplies, setSupplies] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const loadData = async () => {
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
            console.error('Failed to load assign teams data:', error);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const verifiedRequests = useMemo(
        () => requests.filter((r) => r.status === 'VERIFIED' || r.status === 'VALIDATED'),
        [requests]
    );

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Assign Teams</h1>
                <p className="text-sm text-gray-600">Assign rescue teams to validated requests.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    {verifiedRequests.map((req) => (
                        <div key={req.requestId || req.id}>
                            <RequestCard
                                request={req}
                                onAssign={(r) => {
                                    setSelectedRequest(r);
                                    setShowAssignModal(true);
                                }}
                                onViewDetails={(r) => {
                                    setSelectedRequest(r);
                                    setShowDetailModal(true);
                                }}
                            />
                        </div>
                    ))}
                    {verifiedRequests.length === 0 && (
                        <div className="text-sm text-gray-500">No verified requests to assign.</div>
                    )}
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Info</h2>
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600">Available Teams</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {teams.filter((t) => t.status === 'AVAILABLE').length}
                            </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600">Available Vehicles</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {vehicles.filter((v) => v.status === 'AVAILABLE').length}
                            </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600">Supplies Ready</p>
                            <p className="text-2xl font-bold text-gray-900">{supplies.length}</p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">
                        💡 Click "Assign Team" on a request card to dispatch resources
                    </p>
                </div>
            </div>

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
                onAssign={(r) => {
                    setSelectedRequest(r);
                    setShowAssignModal(true);
                }}
            />
        </div>
    );
}
