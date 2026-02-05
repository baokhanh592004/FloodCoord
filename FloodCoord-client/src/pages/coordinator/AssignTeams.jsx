import React, { useEffect, useMemo, useState } from 'react';
import { coordinatorApi } from '../../services/coordinatorApi';
import { teamApi } from '../../services/teamApi';
import { vehicleApi } from '../../services/vehicleApi';
import { supplyApi } from '../../services/supplyApi';
import RequestCard from '../../components/coordinator/RequestCard';

export default function AssignTeams() {
    const [requests, setRequests] = useState([]);
    const [teams, setTeams] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [supplies, setSupplies] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [formData, setFormData] = useState({
        rescueTeamId: '',
        vehicleId: '',
        note: '',
        emergencyLevel: '',
        supplies: [],
    });

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

    const handleAssign = async () => {
        if (!selectedRequest || !formData.rescueTeamId) return;

        try {
            await coordinatorApi.assignTask(selectedRequest.requestId || selectedRequest.id, {
                rescueTeamId: Number(formData.rescueTeamId),
                vehicleId: formData.vehicleId ? Number(formData.vehicleId) : null,
                note: formData.note,
                emergencyLevel: formData.emergencyLevel || selectedRequest.emergencyLevel,
                supplies: formData.supplies,
            });
            loadData();
            setSelectedRequest(null);
        } catch (error) {
            console.error('Assign task failed:', error);
        }
    };

    const handleSupplyToggle = (supplyId) => {
        setFormData((prev) => {
            const exists = prev.supplies.find((s) => s.supplyId === supplyId);
            if (exists) {
                return { ...prev, supplies: prev.supplies.filter((s) => s.supplyId !== supplyId) };
            }
            return { ...prev, supplies: [...prev.supplies, { supplyId, quantity: 1 }] };
        });
    };

    const updateSupplyQuantity = (supplyId, quantity) => {
        setFormData((prev) => ({
            ...prev,
            supplies: prev.supplies.map((s) =>
                s.supplyId === supplyId ? { ...s, quantity: Number(quantity) } : s
            ),
        }));
    };

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
                                onAssign={(r) => setSelectedRequest(r)}
                                onViewDetails={() => setSelectedRequest(req)}
                            />
                        </div>
                    ))}
                    {verifiedRequests.length === 0 && (
                        <div className="text-sm text-gray-500">No verified requests to assign.</div>
                    )}
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Assignment Panel</h2>
                    {!selectedRequest && (
                        <div className="text-sm text-gray-500">Select a request to assign a team.</div>
                    )}

                    {selectedRequest && (
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-900">Request</p>
                                <p className="text-xs text-gray-500">{selectedRequest.title || selectedRequest.description}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rescue Team</label>
                                <select
                                    value={formData.rescueTeamId}
                                    onChange={(e) => setFormData({ ...formData, rescueTeamId: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                                >
                                    <option value="">Select team</option>
                                    {teams.map((team) => (
                                        <option key={team.id} value={team.id}>
                                            {team.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
                                <select
                                    value={formData.vehicleId}
                                    onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                                >
                                    <option value="">Optional</option>
                                    {vehicles.map((vehicle) => (
                                        <option key={vehicle.id} value={vehicle.id}>
                                            {vehicle.name} ({vehicle.type})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Supplies</label>
                                <div className="space-y-2">
                                    {supplies.slice(0, 6).map((supply) => {
                                        const selected = formData.supplies.find((s) => s.supplyId === supply.id);
                                        return (
                                            <div key={supply.id} className="flex items-center justify-between">
                                                <label className="flex items-center gap-2 text-sm text-gray-600">
                                                    <input
                                                        type="checkbox"
                                                        checked={!!selected}
                                                        onChange={() => handleSupplyToggle(supply.id)}
                                                    />
                                                    {supply.name}
                                                </label>
                                                {selected && (
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={selected.quantity}
                                                        onChange={(e) => updateSupplyQuantity(supply.id, e.target.value)}
                                                        className="w-16 px-2 py-1 border border-gray-200 rounded text-sm"
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                                <textarea
                                    rows="3"
                                    value={formData.note}
                                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                                    placeholder="Instructions for the team..."
                                />
                            </div>

                            <button
                                onClick={handleAssign}
                                className="w-full px-4 py-2 bg-teal-600 text-white rounded-md text-sm font-medium hover:bg-teal-700"
                            >
                                Assign Team
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
