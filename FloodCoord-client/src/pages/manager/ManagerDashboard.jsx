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
                        <div 
                            onClick={() => navigate('/manager/vehicles')}
                            className="bg-blue-50 p-6 rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-100 transition"
                        >
                            <h3 className="text-lg font-semibold text-blue-900">🚗 Quản lý Phương tiện</h3>
                            <p className="text-blue-700 mt-2">Quản lý các phương tiện cứu hộ</p>
                            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                                Xem chi tiết →
                            </button>
                        </div>

                        <div 
                            onClick={() => navigate('/manager/rescue-teams')}
                            className="bg-red-50 p-6 rounded-lg border border-red-200 cursor-pointer hover:bg-red-100 transition"
                        >
                            <h3 className="text-lg font-semibold text-red-900">🚨 Quản lý Đội Cứu hộ</h3>
                            <p className="text-red-700 mt-2">Quản lý đội cứu hộ và thành viên</p>
                            <button className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                                Xem chi tiết →
                            </button>
                        </div>

                        <div 
                            onClick={() => navigate('/manager/supplies')}
                            className="bg-green-50 p-6 rounded-lg border border-green-200 cursor-pointer hover:bg-green-100 transition"
                        >
                            <h3 className="text-lg font-semibold text-green-900">📦 Quản lý Vật tư</h3>
                            <p className="text-green-700 mt-2">Quản lý vật tư và kho hàng</p>
                            <button className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                                Xem chi tiết →
                            </button>
                        </div>

                        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                            <h3 className="text-lg font-semibold text-purple-900">🎯 Phân bổ Tài nguyên</h3>
                            <p className="text-purple-700 mt-2">Phân bổ tài nguyên cho chiến dịch</p>
                            <button className="mt-4 px-4 py-2 bg-gray-300 text-gray-600 rounded cursor-not-allowed">
                                Sắp ra mắt
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
