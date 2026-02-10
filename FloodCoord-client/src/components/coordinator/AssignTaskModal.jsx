import React, { useEffect, useState } from 'react';
import { XMarkIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import { coordinatorApi } from '../../services/coordinatorApi';
import { teamApi } from '../../services/teamApi';
import { vehicleApi } from '../../services/vehicleApi';
import { supplyApi } from '../../services/supplyApi';
import toast from 'react-hot-toast';

/**
 * AssignTaskModal - Modal for assigning resources to verified requests
 * 
 * FUNCTION:
 * - Select rescue team (required)
 * - Select vehicle (optional)
 * - Select supplies with quantities (optional)
 * - Add instructions for the team
 * 
 * FLOW:
 * 1. Coordinator opens modal from verified request
 * 2. Selects team, vehicle, supplies
 * 3. Clicks "Assign" -> calls coordinatorApi.assignTask()
 * 4. Backend:
 *    - Changes request status to IN_PROGRESS
 *    - Links team to request
 *    - Marks vehicle as IN_USE
 *    - Deducts supply quantities
 * 5. Team receives assignment and can start mission
 */
export default function AssignTaskModal({ request, isOpen, onClose, onSuccess }) {
    const [teams, setTeams] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [supplies, setSupplies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        rescueTeamId: '',
        vehicleId: '',
        note: '',
        emergencyLevel: '',
        supplies: [],
    });

    useEffect(() => {
        if (isOpen) {
            loadResources();
            setFormData({
                rescueTeamId: '',
                vehicleId: '',
                note: '',
                emergencyLevel: request?.emergencyLevel || '',
                supplies: [],
            });
        }
    }, [isOpen, request]);

    const loadResources = async () => {
        try {
            const [teamData, vehicleData, supplyData] = await Promise.all([
                teamApi.getAllTeams(),
                vehicleApi.getAllVehicles(),
                supplyApi.getAllSupplies(),
            ]);
            setTeams(teamData || []);
            setVehicles(vehicleData || []);
            setSupplies(supplyData || []);
        } catch (error) {
            console.error('Failed to load resources:', error);
        }
    };

    const handleAssign = async () => {
        if (!formData.rescueTeamId) {
            toast.error('Please select a rescue team');
            return;
        }

        setLoading(true);
        try {
            await coordinatorApi.assignTask(request.requestId || request.id, {
                rescueTeamId: Number(formData.rescueTeamId),
                vehicleId: formData.vehicleId ? Number(formData.vehicleId) : null,
                note: formData.note,
                emergencyLevel: formData.emergencyLevel || request.emergencyLevel,
                supplies: formData.supplies.map((s) => ({
                    supplyId: s.supplyId,
                    quantity: s.quantity,
                })),
            });
            toast.success('Team assigned successfully!');
            onSuccess?.();
            onClose();
        } catch (error) {
            toast.error('Failed to assign team: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleSupply = (supplyId) => {
        setFormData((prev) => {
            const exists = prev.supplies.find((s) => s.supplyId === supplyId);
            if (exists) {
                return {
                    ...prev,
                    supplies: prev.supplies.filter((s) => s.supplyId !== supplyId),
                };
            }
            return {
                ...prev,
                supplies: [...prev.supplies, { supplyId, quantity: 1 }],
            };
        });
    };

    const updateQuantity = (supplyId, delta) => {
        setFormData((prev) => ({
            ...prev,
            supplies: prev.supplies.map((s) =>
                s.supplyId === supplyId
                    ? { ...s, quantity: Math.max(1, s.quantity + delta) }
                    : s
            ),
        }));
    };

    if (!isOpen || !request) return null;

    const availableTeams = teams.filter((t) => t.isActive !== false);
    const availableVehicles = vehicles.filter((v) => v.status === 'AVAILABLE');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Assign Rescue Team</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Dispatch team and resources to rescue location
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Request Summary */}
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                        <p className="text-sm font-semibold text-blue-900 mb-1">
                            {request.title || request.trackingCode}
                        </p>
                        <p className="text-xs text-blue-700">
                            📍 {request.location?.addressText || 'Location not specified'}
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                            👥 {request.peopleCount || 0} people need rescue
                        </p>
                    </div>

                    {/* Team Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rescue Team <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.rescueTeamId}
                            onChange={(e) => setFormData({ ...formData, rescueTeamId: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500"
                        >
                            <option value="">Select a team</option>
                            {availableTeams.map((team) => (
                                <option key={team.id} value={team.id}>
                                    {team.name} - {team.members?.length || 0} members
                                    {team.status === 'BUSY' ? ' (Busy)' : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Vehicle Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Vehicle <span className="text-gray-400">(Optional)</span>
                        </label>
                        <select
                            value={formData.vehicleId}
                            onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500"
                        >
                            <option value="">No vehicle needed</option>
                            {availableVehicles.map((vehicle) => (
                                <option key={vehicle.id} value={vehicle.id}>
                                    {vehicle.name} - {vehicle.type} (Capacity: {vehicle.capacity})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Supplies Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Supplies <span className="text-gray-400">(Optional)</span>
                        </label>
                        <div className="border border-gray-300 rounded-md max-h-48 overflow-y-auto">
                            {supplies.map((supply) => {
                                const selected = formData.supplies.find((s) => s.supplyId === supply.id);
                                return (
                                    <div
                                        key={supply.id}
                                        className="flex items-center justify-between p-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                                    >
                                        <label className="flex items-center gap-3 flex-1 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={!!selected}
                                                onChange={() => toggleSupply(supply.id)}
                                                className="h-4 w-4 text-teal-600 rounded"
                                            />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">{supply.name}</p>
                                                <p className="text-xs text-gray-500">
                                                    {supply.type} • Available: {supply.quantity} {supply.unit}
                                                </p>
                                            </div>
                                        </label>
                                        {selected && (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updateQuantity(supply.id, -1)}
                                                    className="p-1 rounded hover:bg-gray-200"
                                                >
                                                    <MinusIcon className="h-4 w-4 text-gray-600" />
                                                </button>
                                                <span className="w-10 text-center text-sm font-medium">
                                                    {selected.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(supply.id, 1)}
                                                    className="p-1 rounded hover:bg-gray-200"
                                                >
                                                    <PlusIcon className="h-4 w-4 text-gray-600" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Instructions */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Instructions for Team
                        </label>
                        <textarea
                            rows="3"
                            value={formData.note}
                            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                            placeholder="Special instructions, route information, safety precautions..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500"
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
                        onClick={handleAssign}
                        disabled={loading || !formData.rescueTeamId}
                        className="px-6 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:opacity-50"
                    >
                        {loading ? 'Assigning...' : 'Assign Team'}
                    </button>
                </div>
            </div>
        </div>
    );
}
