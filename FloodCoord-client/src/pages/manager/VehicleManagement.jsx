import React, { useState, useEffect } from 'react';
import { vehicleApi } from '../../services/vehicleApi';
import { useNavigate } from 'react-router-dom';

export default function VehicleManagement() {
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'BOAT',
        licensePlate: '',
        capacity: '',
        status: 'AVAILABLE'
    });

    const vehicleTypes = ['BOAT', 'TRUCK', 'HELICOPTER', 'AMBULANCE', 'RESCUE_VAN'];
    const vehicleStatuses = ['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'BROKEN'];

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const data = await vehicleApi.getAllVehicles();
            setVehicles(data);
            setError('');
        } catch (err) {
            setError('Không thể tải danh sách phương tiện');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const vehicleData = {
                ...formData,
                capacity: parseInt(formData.capacity)
            };

            if (editingVehicle) {
                await vehicleApi.updateVehicle(editingVehicle.id, vehicleData);
            } else {
                await vehicleApi.createVehicle(vehicleData);
            }

            setShowModal(false);
            resetForm();
            fetchVehicles();
        } catch (err) {
            setError(editingVehicle ? 'Không thể cập nhật phương tiện' : 'Không thể tạo phương tiện');
            console.error(err);
        }
    };

    const handleEdit = (vehicle) => {
        setEditingVehicle(vehicle);
        setFormData({
            name: vehicle.name,
            type: vehicle.type,
            licensePlate: vehicle.licensePlate,
            capacity: vehicle.capacity.toString(),
            status: vehicle.status
        });
        setShowModal(true);
    };

    const handleDelete = async (vehicleId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa phương tiện này?')) {
            try {
                await vehicleApi.deleteVehicle(vehicleId);
                fetchVehicles();
            } catch (err) {
                setError('Không thể xóa phương tiện');
                console.error(err);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            type: 'BOAT',
            licensePlate: '',
            capacity: '',
            status: 'AVAILABLE'
        });
        setEditingVehicle(null);
    };

    const openCreateModal = () => {
        resetForm();
        setShowModal(true);
    };

    const getStatusColor = (status) => {
        const colors = {
            AVAILABLE: 'bg-green-100 text-green-800',
            IN_USE: 'bg-blue-100 text-blue-800',
            MAINTENANCE: 'bg-yellow-100 text-yellow-800',
            BROKEN: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getTypeIcon = (type) => {
        const icons = {
            BOAT: '🚤',
            TRUCK: '🚚',
            HELICOPTER: '🚁',
            AMBULANCE: '🚑',
            RESCUE_VAN: '🚐'
        };
        return icons[type] || '🚗';
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Quản lý Phương tiện</h1>
                            <p className="text-gray-600 mt-1">Quản lý tất cả phương tiện cứu hộ</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate('/manager/dashboard')}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                            >
                                ← Quay lại
                            </button>
                            <button
                                onClick={openCreateModal}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                            >
                                + Thêm phương tiện
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {/* Vehicles Grid */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        <p className="mt-4 text-gray-600">Đang tải...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {vehicles.map(vehicle => (
                            <div key={vehicle.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-4xl">{getTypeIcon(vehicle.type)}</span>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{vehicle.name}</h3>
                                            <p className="text-sm text-gray-500">{vehicle.type}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(vehicle.status)}`}>
                                        {vehicle.status}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Biển số:</span>
                                        <span className="font-semibold">{vehicle.licensePlate}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Sức chứa:</span>
                                        <span className="font-semibold">{vehicle.capacity} người</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(vehicle)}
                                        className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        onClick={() => handleDelete(vehicle.id)}
                                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && vehicles.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg">
                        <p className="text-gray-500 text-lg">Chưa có phương tiện nào</p>
                        <button
                            onClick={openCreateModal}
                            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            Tạo phương tiện đầu tiên
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                        <h2 className="text-2xl font-bold mb-6">
                            {editingVehicle ? 'Cập nhật phương tiện' : 'Tạo phương tiện mới'}
                        </h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Tên phương tiện *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="VD: Cano Cao Tốc V-01"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Loại phương tiện *
                                </label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    {vehicleTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Biển số *
                                </label>
                                <input
                                    type="text"
                                    name="licensePlate"
                                    value={formData.licensePlate}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="VD: CANO-9999"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Sức chứa (người) *
                                </label>
                                <input
                                    type="number"
                                    name="capacity"
                                    value={formData.capacity}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="VD: 10"
                                    min="1"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Trạng thái *
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    {vehicleStatuses.map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                                >
                                    {editingVehicle ? 'Cập nhật' : 'Tạo mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
