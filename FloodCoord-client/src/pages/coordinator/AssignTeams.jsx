import React, { useEffect, useMemo, useState } from 'react';
import { coordinatorDashboardApi } from '../../services/coordinatorDashboardApi';
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
                coordinatorDashboardApi.getRequests(),
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
        const timer = setTimeout(() => {
            loadData();
        }, 0);

        return () => clearTimeout(timer);
    }, []);

    const verifiedRequests = useMemo(
        () => requests.filter((r) => r.status === 'VERIFIED' || r.status === 'VALIDATED'),
        [requests]
    );

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900">Phân công đội cứu hộ</h1>
                <p className="text-sm text-neutral-600">Phân công đội cứu hộ cho các yêu cầu đã xác minh.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    {verifiedRequests.map((req) => (
                        <div key={req.requestId}>
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
                        <div className="text-sm text-neutral-400">Không có yêu cầu đã xác minh để phân công.</div>
                    )}
                </div>

                <div className="bg-white border border-neutral-100 rounded-lg p-5">
                    <h2 className="text-lg font-semibold text-neutral-900 mb-4">Thông tin nhanh</h2>
                    <div className="space-y-4">
                        <div className="bg-neutral-50 p-4 rounded-lg">
                            <p className="text-sm text-neutral-600">Đội cứu hộ khả dụng</p>
                            <p className="text-2xl font-bold text-neutral-900">
                                {teams.filter((t) => t.status === 'AVAILABLE').length}
                            </p>
                        </div>
                        <div className="bg-neutral-50 p-4 rounded-lg">
                            <p className="text-sm text-neutral-600">Xe cứu hộ khả dụng</p>
                            <p className="text-2xl font-bold text-neutral-900">
                                {vehicles.filter((v) => v.status === 'AVAILABLE').length}
                            </p>
                        </div>
                        <div className="bg-neutral-50 p-4 rounded-lg">
                            <p className="text-sm text-neutral-600">Vật tư khả dụng</p>
                            <p className="text-2xl font-bold text-neutral-900">{supplies.length}</p>
                        </div>
                    </div>
                    <p className="text-xs text-neutral-400 mt-4">
                        Nhấn "Phân công đội" trên thẻ yêu cầu để điều phối tài nguyên
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
