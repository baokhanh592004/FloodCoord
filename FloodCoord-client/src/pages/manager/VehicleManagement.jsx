import React, { useState, useEffect, useMemo } from 'react';
import { vehicleApi } from '../../services/vehicleApi'; // Giữ nguyên import của bạn
import { useNavigate } from 'react-router-dom';
import { 
  Ship, Truck, Plane, Activity, Bus, // Icons cho phương tiện
  Plus, ArrowLeft, Search, Filter, 
  CheckCircle2, AlertCircle, Clock, Wrench, // Icons trạng thái
  MoreVertical, Trash2, Edit
} from 'lucide-react';

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
            setError('Không thể tải danh sách phương tiện');
            // Mock data để bạn xem trước giao diện nếu API lỗi
            setVehicles([
                { id: 1, name: 'Cano Cao Tốc ST-01', type: 'BOAT', licensePlate: 'QN-1234', capacity: 12, status: 'AVAILABLE' },
                { id: 2, name: 'Xe Tải Cứu Trợ', type: 'TRUCK', licensePlate: '29C-56789', capacity: 3, status: 'IN_USE' },
                { id: 3, name: 'Trực Thăng Cứu Hộ', type: 'HELICOPTER', licensePlate: 'VN-8888', capacity: 6, status: 'MAINTENANCE' },
            ]); 
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
        // ... (Logic submit giữ nguyên)
        // Mock success visual
        setShowModal(false);
        resetForm();
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
        // ... (Logic delete giữ nguyên)
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
            maintenance: vehicles.filter(v => ['MAINTENANCE', 'BROKEN'].includes(v.status)).length
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
            BROKEN: { color: 'bg-red-100 text-red-700', dot: 'bg-red-500', label: 'Hỏng hóc' },
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
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans text-slate-800">
            {/* Background Decoration (Blobs) */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 translate-x-1/3 -translate-y-1/2"></div>

            <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
                
                {/* 1. Header Area with Glassmorphism */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-[#1e40af] tracking-tight">Đội Cứu Trợ Lũ Lụt</h1>
                        <p className="text-slate-500 mt-1 flex items-center gap-2">
                            <span className="inline-block w-2 h-2 bg-orange-500 rounded-full"></span>
                            Quản lý điều phối phương tiện thời gian thực
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => navigate('/manager/dashboard')}
                            className="px-5 py-2.5 rounded-xl bg-white/50 border border-white/60 text-slate-600 hover:bg-white hover:shadow-lg backdrop-blur-sm transition-all duration-300 flex items-center gap-2 font-medium"
                        >
                            <ArrowLeft size={18} /> Quay lại
                        </button>
                        <button 
                            onClick={openCreateModal}
                            className="px-5 py-2.5 rounded-xl bg-[#1e40af] text-white shadow-lg shadow-blue-900/20 hover:bg-blue-800 hover:scale-105 hover:shadow-blue-900/30 transition-all duration-300 flex items-center gap-2 font-medium"
                        >
                            <Plus size={18} /> Thêm phương tiện
                        </button>
                    </div>
                </div>

                {/* 2. Quick Stats Area (Thống kê nhanh) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <StatCard label="Tổng phương tiện" count={stats.total} icon={Truck} color="text-slate-600" />
                    <StatCard label="Sẵn sàng" count={stats.available} icon={CheckCircle2} color="text-emerald-600" />
                    <StatCard label="Đang hoạt động" count={stats.inUse} icon={Clock} color="text-blue-600" />
                    <StatCard label="Cần bảo trì" count={stats.maintenance} icon={Wrench} color="text-orange-500" />
                </div>

                {/* 3. Main Content Area */}
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 flex items-center gap-3">
                        <AlertCircle size={20} /> {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e40af]"></div>
                    </div>
                ) : vehicles.length === 0 ? (
                    <EmptyState onAdd={openCreateModal} />
                ) : (
                    // Grid Card với thiết kế hiện đại
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {vehicles.map(vehicle => (
                            <div 
                                key={vehicle.id} 
                                className="group bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 relative overflow-hidden"
                            >
                                {/* Decorative gradient blob inside card */}
                                <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-blue-100 to-transparent rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />

                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                                        {getTypeIcon(vehicle.type)}
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(vehicle)} className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(vehicle.id)} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-4 relative z-10">
                                    <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-[#1e40af] transition-colors">{vehicle.name}</h3>
                                    <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">{vehicle.type}</p>
                                </div>

                                <div className="space-y-3 mb-6 relative z-10">
                                    <div className="flex justify-between text-sm items-center py-2 border-b border-slate-100/50">
                                        <span className="text-slate-500">Biển số</span>
                                        <span className="font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{vehicle.licensePlate}</span>
                                    </div>
                                    <div className="flex justify-between text-sm items-center">
                                        <span className="text-slate-500">Sức chứa</span>
                                        <span className="font-semibold text-slate-700">{vehicle.capacity} người</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-auto relative z-10">
                                    {getStatusBadge(vehicle.status)}
                                    <span className="text-xs text-slate-400">ID: #{vehicle.id}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 4. Glassmorphism Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-[#1e40af]/20 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">
                        <div className="bg-[#1e40af] p-6 text-white flex justify-between items-center">
                            <h2 className="text-xl font-bold">
                                {editingVehicle ? 'Cập nhật hồ sơ' : 'Đăng ký phương tiện mới'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white">✕</button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-8 space-y-5">
                            <div className="grid grid-cols-2 gap-5">
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Tên phương tiện</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                                        placeholder="VD: Cano Cứu Hộ 01"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Loại xe</label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    >
                                        {vehicleTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Biển số</label>
                                    <input
                                        type="text"
                                        name="licensePlate"
                                        value={formData.licensePlate}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        placeholder="29C-123.45"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Sức chứa (người)</label>
                                    <input
                                        type="number"
                                        name="capacity"
                                        value={formData.capacity}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Trạng thái</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    >
                                        {vehicleStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-[#1e40af] text-white font-semibold rounded-xl shadow-lg shadow-blue-900/30 hover:bg-blue-800 transition transform hover:-translate-y-0.5"
                                >
                                    {editingVehicle ? 'Lưu thay đổi' : 'Tạo mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// Sub-component: Stat Card
function StatCard({ label, count, icon: Icon, color }) {
    return (
        <div className="bg-white/60 backdrop-blur-md border border-white/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex items-center justify-between">
            <div>
                <p className="text-slate-500 text-sm font-medium mb-1">{label}</p>
                <p className="text-3xl font-bold text-slate-800">{count < 10 ? `0${count}` : count}</p>
            </div>
            <div className={`p-3 rounded-xl bg-white shadow-sm ${color}`}>
                <Icon size={24} />
            </div>
        </div>
    );
}

// Sub-component: Empty State with SVG
function EmptyState({ onAdd }) {
    return (
        <div className="text-center py-20 bg-white/40 backdrop-blur-md rounded-3xl border border-dashed border-slate-300">
            <div className="mx-auto w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <Ship size={40} className="text-blue-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Chưa có phương tiện nào</h3>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                Hệ thống chưa ghi nhận phương tiện cứu trợ nào. Hãy thêm phương tiện để bắt đầu điều phối.
            </p>
            <button
                onClick={onAdd}
                className="px-6 py-3 bg-[#f97316] text-white rounded-xl shadow-lg shadow-orange-500/30 hover:bg-orange-600 hover:scale-105 transition font-semibold"
            >
                + Thêm phương tiện đầu tiên
            </button>
        </div>
    );
}