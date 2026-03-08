import React, { useState, useEffect, useMemo } from 'react';
import { vehicleApi } from '../../services/vehicleApi';
import { useNavigate } from 'react-router-dom';
import { Ship, Truck, Plane, Activity, Bus, Plus, AlertCircle, Trash2, Edit } from 'lucide-react';
import StatCard from '../../components/coordinator/StatCard';
import {
    TruckIcon,
    CheckCircleIcon,
    ClockIcon,
    WrenchScrewdriverIcon,
    ArrowPathIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

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
    const vehicleStatuses = ['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'UNAVAILABLE'];

    // --- Giữ nguyên Logic Fetch/CRUD ---
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
            setError('Không thể tải danh sách phương tiện. Vui lòng kiểm tra kết nối với server.');
            console.error('Fetch vehicles error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSubmit = {
                name: formData.name,
                type: formData.type,
                licensePlate: formData.licensePlate,
                capacity: parseInt(formData.capacity),
                status: formData.status
            };

            if (editingVehicle) {
                await vehicleApi.updateVehicle(editingVehicle.id, dataToSubmit);
            } else {
                await vehicleApi.createVehicle(dataToSubmit);
            }
            
            await fetchVehicles();
            setShowModal(false);
            resetForm();
            setError('');
        } catch (err) {
            // Xử lý lỗi validation từ backend
            if (err.response?.status === 400 || err.response?.status === 500) {
                const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Có lỗi xảy ra';
                setError(errorMsg);
            } else {
                setError('Không thể lưu thông tin phương tiện');
            }
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
        if (!window.confirm('Bạn có chắc chắn muốn xóa phương tiện này?')) {
            return;
        }

        try {
            await vehicleApi.deleteVehicle(vehicleId);
            await fetchVehicles();
            setError('');
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Không thể xóa phương tiện';
            setError(errorMsg);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', type: 'BOAT', licensePlate: '', capacity: '', status: 'AVAILABLE' });
        setEditingVehicle(null);
    };

    const openCreateModal = () => {
        resetForm();
        setShowModal(true);
    };

    // --- UI Helpers & Stats ---
    
    // Tính toán thống kê nhanh
    const stats = useMemo(() => {
        return {
            total: vehicles.length,
            available: vehicles.filter(v => v.status === 'AVAILABLE').length,
            inUse: vehicles.filter(v => v.status === 'IN_USE').length,
            maintenance: vehicles.filter(v => ['MAINTENANCE', 'UNAVAILABLE'].includes(v.status)).length
        };
    }, [vehicles]);

    const getTypeIcon = (type) => {
        const iconProps = { size: 32, strokeWidth: 1.5 };
        switch(type) {
            case 'BOAT': return <Ship {...iconProps} className="text-blue-600" />;
            case 'TRUCK': return <Truck {...iconProps} className="text-slate-600" />;
            case 'HELICOPTER': return <Plane {...iconProps} className="text-orange-600" />;
            case 'AMBULANCE': return <Activity {...iconProps} className="text-red-600" />;
            case 'RESCUE_VAN': return <Bus {...iconProps} className="text-teal-600" />;
            default: return <Truck {...iconProps} />;
        }
    };

    const getStatusBadge = (status) => {
        const config = {
            AVAILABLE: { color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', label: 'Sẵn sàng' },
            IN_USE: { color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500', label: 'Đang làm nhiệm vụ' },
            MAINTENANCE: { color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500', label: 'Bảo trì' },
            UNAVAILABLE: { color: 'bg-red-100 text-red-700', dot: 'bg-red-500', label: 'Không khả dụng' },
        };
        const current = config[status] || config['AVAILABLE'];

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide ${current.color}`}>
                <span className={`w-2 h-2 rounded-full ${current.dot} animate-pulse`} />
                {current.label}
            </span>
        );
    };

    return (
        // Background chính với màu xám nhẹ pha chút xanh biển sâu (Deep Blue hint)
        <div className="p-6 space-y-6 overflow-y-auto h-full">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý phương tiện</h1>
                    <p className="text-sm text-gray-500">Quản lý và điều phối phương tiện cứu hộ trong hệ thống.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                    <Plus size={16} /> Thêm phương tiện
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={<TruckIcon className="h-6 w-6" />} count={stats.total} label="Tổng phương tiện" color="blue" />
                <StatCard icon={<CheckCircleIcon className="h-6 w-6" />} count={stats.available} label="Sẵn sàng" color="green" />
                <StatCard icon={<ClockIcon className="h-6 w-6" />} count={stats.inUse} label="Đang hoạt động" color="yellow" />
                <StatCard icon={<WrenchScrewdriverIcon className="h-6 w-6" />} count={stats.maintenance} label="Cần bảo trì" color="red" />
            </div>

            {/* Error */}
            {error && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-3 text-sm">
                    <AlertCircle size={18} /> {error}
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
            ) : vehicles.length === 0 ? (
                <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-lg">
                    <Ship size={40} className="mx-auto text-gray-300 mb-3" />
                    <h3 className="text-base font-semibold text-gray-700 mb-1">Chưa có phương tiện nào</h3>
                    <p className="text-sm text-gray-500 mb-4">Hãy thêm phương tiện đầu tiên để bắt đầu điều phối.</p>
                    <button onClick={openCreateModal} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                        + Thêm phương tiện
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vehicles.map(vehicle => (
                        <div key={vehicle.id} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-100">
                                    {getTypeIcon(vehicle.type)}
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => handleEdit(vehicle)} className="p-1.5 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-md transition-colors">
                                        <Edit size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(vehicle.id)} className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-md transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="mb-3">
                                <h3 className="font-semibold text-gray-900 mb-0.5">{vehicle.name}</h3>
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{vehicle.type}</p>
                            </div>

                            <div className="space-y-2 mb-4 text-sm">
                                <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                                    <span className="text-gray-500">Biển số</span>
                                    <span className="font-mono font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded text-xs">{vehicle.licensePlate}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Sức chứa</span>
                                    <span className="font-medium text-gray-700">{vehicle.capacity} người</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                {getStatusBadge(vehicle.status)}
                                <span className="text-xs text-gray-400">#{vehicle.id}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {editingVehicle ? 'Cập nhật phương tiện' : 'Thêm phương tiện mới'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors">
                                <XMarkIcon className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {editingVehicle && editingVehicle.status === 'IN_USE' && (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2 text-sm">
                                    <ExclamationTriangleIcon className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                                    <p className="text-amber-700">Phương tiện đang hoạt động — không thể thay đổi trạng thái.</p>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên phương tiện</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                                        placeholder="VD: Cano Cứu Hộ 01" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại xe</label>
                                    <select name="type" value={formData.type} onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40">
                                        {vehicleTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Biển số</label>
                                    <input type="text" name="licensePlate" value={formData.licensePlate} onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                                        placeholder="29C-123.45" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sức chứa (người)</label>
                                    <input type="number" name="capacity" value={formData.capacity} onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                                    <select name="status" value={formData.status} onChange={handleInputChange}
                                        disabled={editingVehicle && editingVehicle.status === 'IN_USE'}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed">
                                        {vehicleStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors">
                                    Hủy
                                </button>
                                <button type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                                    {editingVehicle ? 'Lưu thay đổi' : 'Thêm mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}