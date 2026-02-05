import React, { useEffect, useMemo, useState } from 'react';
import { coordinatorApi } from '../../services/coordinatorApi';
import RequestCard from '../../components/coordinator/RequestCard';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function RequestQueue() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const loadRequests = async () => {
        setLoading(true);
        try {
            const data = await coordinatorApi.getAllRequests();
            setRequests(data || []);
        } catch (error) {
            console.error('Failed to load requests:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const filteredRequests = useMemo(() => {
        return requests.filter((req) => {
            const matchesSearch =
                req.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.trackingCode?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [requests, searchTerm, statusFilter]);

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Request Queue</h1>
                <p className="text-sm text-gray-600">Review, validate, and manage incoming rescue requests.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search requests..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                    <option value="ALL">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="VERIFIED">Validated</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                </select>
            </div>

            <div className="space-y-4">
                {filteredRequests.map((req) => (
                    <RequestCard key={req.requestId || req.id} request={req} />
                ))}
                {filteredRequests.length === 0 && !loading && (
                    <div className="text-sm text-gray-500">No requests found.</div>
                )}
                {loading && (
                    <div className="text-sm text-gray-500">Loading requests...</div>
                )}
            </div>
        </div>
    );
}
