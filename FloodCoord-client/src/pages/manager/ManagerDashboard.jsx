import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ManagerDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-8">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
                            <p className="text-gray-600 mt-2">Welcome, {user?.email}!</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            Logout
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                            <h3 className="text-lg font-semibold text-blue-900">Vehicle Management</h3>
                            <p className="text-blue-700 mt-2">Manage vehicles and their availability</p>
                        </div>

                        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                            <h3 className="text-lg font-semibold text-green-900">Supply Management</h3>
                            <p className="text-green-700 mt-2">Manage supplies and inventory</p>
                        </div>

                        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                            <h3 className="text-lg font-semibold text-purple-900">Resource Allocation</h3>
                            <p className="text-purple-700 mt-2">Allocate resources to operations</p>
                        </div>

                        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                            <h3 className="text-lg font-semibold text-yellow-900">Reports</h3>
                            <p className="text-yellow-700 mt-2">View resource utilization reports</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
