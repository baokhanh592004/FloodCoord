import React, { useState, useEffect, useMemo } from 'react';
import { supplyApi } from '../../services/supplyApi';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, AlertCircle, Clock, Apple, Pill, Wrench, Box, X } from 'lucide-react';
import StatCard from '../../components/coordinator/StatCard';
import SupplyCard from '../../components/manager/SupplyCard';
import SupplyFormModal from '../../components/manager/SupplyFormModal';
import SupplyDetailModal from '../../components/manager/SupplyDetailModal';
import {
    ArchiveBoxIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
    PlusIcon,
} from '@heroicons/react/24/outline';

export default function SupplyManagement() {
    const navigate = useNavigate();
    const [supplies, setSupplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingSupply, setEditingSupply] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedSupply, setSelectedSupply] = useState(null);
    const [filterType, setFilterType] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        type: 'FOOD_WATER',
        quantity: '',
        unit: '',
        description: '',
        importedDate: '',
        expiryDate: '',
        exportedDate: ''
    });

    const supplyTypes = [
        { value: 'FOOD_WATER', label: 'Đồ ăn, nước uống' },
        { value: 'MEDICAL', label: 'Thuốc men, y tế' },
        { value: 'EQUIPMENT', label: 'Thiết bị cứu hộ' },
        { value: 'OTHER', label: 'Khác' }
    ];

    useEffect(() => {
        fetchSupplies();
    }, []);

    const fetchSupplies = async () => {
        try {
            setLoading(true);
            const data = await supplyApi.getAllSupplies();
            setSupplies(data);
            setError('');
        } catch (err) {
            setError('Không thể tải danh sách vật tư');
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
            const supplyData = {
                name: formData.name,
                type: formData.type,
                quantity: parseInt(formData.quantity),
                unit: formData.unit,
                description: formData.description,
                importedDate: formData.importedDate ? new Date(formData.importedDate).toISOString() : null,
                expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : null,
                exportedDate: formData.exportedDate ? new Date(formData.exportedDate).toISOString() : null
            };

            if (editingSupply) {
                await supplyApi.updateSupply(editingSupply.id, supplyData);
            } else {
                await supplyApi.createSupply(supplyData);
            }

            setShowModal(false);
            resetForm();
            fetchSupplies();
        } catch (err) {
            setError(editingSupply ? 'Không thể cập nhật vật tư' : 'Không thể tạo vật tư');
            console.error(err);
        }
    };

    const handleEdit = (supply) => {
        setEditingSupply(supply);
        setFormData({
            name: supply.name,
            type: supply.type,
            quantity: supply.quantity.toString(),
            unit: supply.unit,
            description: supply.description || '',
            importedDate: supply.importedDate ? supply.importedDate.substring(0, 16) : '',
            expiryDate: supply.expiryDate ? supply.expiryDate.substring(0, 16) : '',
            exportedDate: supply.exportedDate ? supply.exportedDate.substring(0, 16) : ''
        });
        setShowModal(true);
    };

    const handleDelete = async (supplyId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa vật tư này?')) {
            try {
                await supplyApi.deleteSupply(supplyId);
                fetchSupplies();
            } catch (err) {
                setError('Không thể xóa vật tư');
                console.error(err);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            type: 'FOOD_WATER',
            quantity: '',
            unit: '',
            description: '',
            importedDate: '',
            expiryDate: '',
            exportedDate: ''
        });
        setEditingSupply(null);
    };

    const openCreateModal = () => {
        resetForm();
        setShowModal(true);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Không có';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isExpiringSoon = (expiryDate) => {
        if (!expiryDate) return false;
        const expiry = new Date(expiryDate);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    };

    const isExpired = (expiryDate) => {
        if (!expiryDate) return false;
        return new Date(expiryDate) < new Date();
    };

    // Tính toán thống kê nhanh
    const stats = useMemo(() => {
        return {
            total: supplies.length,
            foodWater: supplies.filter(s => s.type === 'FOOD_WATER').length,
            medical: supplies.filter(s => s.type === 'MEDICAL').length,
            expiringSoon: supplies.filter(s => isExpiringSoon(s.expiryDate)).length
        };
    }, [supplies]);

    const filteredSupplies = useMemo(() => {
        return supplies.filter(s => {
            const matchType = filterType === 'ALL' || s.type === filterType;
            const matchSearch = !searchTerm ||
                s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (s.description || '').toLowerCase().includes(searchTerm.toLowerCase());
            return matchType && matchSearch;
        });
    }, [supplies, filterType, searchTerm]);

    const handleCloseModal = () => {
        setShowModal(false);
        resetForm();
    };

    const handleViewDetail = (supply) => {
        setSelectedSupply(supply);
        setShowDetailModal(true);
    };

    const handleCloseDetailModal = () => {
        setShowDetailModal(false);
        setSelectedSupply(null);
    };

    return (
        <div className="p-6 space-y-6 overflow-y-auto h-full">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Vật tư</h1>
                    <p className="text-sm text-gray-500">Quản lý tồn kho theo từng lô hàng cứu trợ.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                    <PlusIcon className="h-4 w-4" /> Nhập lô hàng mới
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={<ArchiveBoxIcon className="h-6 w-6" />} count={stats.total} label="Tổng lô hàng" color="blue" />
                <StatCard icon={<Apple size={24} />} count={stats.foodWater} label="Đồ ăn &amp; Nước" color="green" />
                <StatCard icon={<Pill size={24} />} count={stats.medical} label="Y tế" color="red" />
                <StatCard icon={<ClockIcon className="h-6 w-6" />} count={stats.expiringSoon} label="Sắp hết hạn" color="yellow" />
            </div>

            {/* Filter & Search */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-xs">
                    <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm tên vật tư, ghi chú..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-9 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <XMarkIcon className="h-4 w-4" />
                        </button>
                    )}
                </div>
                <div className="flex gap-1.5 flex-wrap">
                    {[
                        { value: 'ALL',        label: 'Tất cả',       icon: Package },
                        { value: 'FOOD_WATER', label: 'Đồ ăn & Nước', icon: Apple },
                        { value: 'MEDICAL',    label: 'Y tế',        icon: Pill },
                        { value: 'EQUIPMENT',  label: 'Thiết bị',   icon: Wrench },
                        { value: 'OTHER',      label: 'Khác',         icon: Box },
                    ].map(({ value, label, icon: Icon }) => (
                        <button
                            key={value}
                            onClick={() => setFilterType(value)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                filterType === value
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            <Icon size={13} />{label}
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                                filterType === value ? 'bg-white/25 text-white' : 'bg-white text-gray-500'
                            }`}>
                                {value === 'ALL' ? supplies.length : supplies.filter(s => s.type === value).length}
                            </span>
                        </button>
                    ))}
                </div>
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
            ) : supplies.length === 0 ? (
                <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-lg">
                    <Package size={40} className="mx-auto text-gray-300 mb-3" />
                    <h3 className="text-base font-semibold text-gray-700 mb-1">Chưa có lô hàng nào</h3>
                    <p className="text-sm text-gray-500 mb-4">Hãy nhập lô hàng đầu tiên để bắt đầu quản lý kho.</p>
                    <button onClick={openCreateModal} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                        + Nhập lô hàng đầu tiên
                    </button>
                </div>
            ) : filteredSupplies.length === 0 ? (
                <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-lg">
                    <MagnifyingGlassIcon className="h-9 w-9 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium text-sm">Không tìm thấy lô hàng nào</p>
                    <button onClick={() => { setFilterType('ALL'); setSearchTerm(''); }} className="mt-2 text-sm text-blue-600 hover:underline">
                        Xóa bộ lọc
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {filteredSupplies.map(supply => (
                        <SupplyCard
                            key={supply.id}
                            supply={supply}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onViewDetail={handleViewDetail}
                        />
                    ))}
                </div>
            )}

            {/* Modals */}
            <SupplyFormModal
                showModal={showModal}
                editingSupply={editingSupply}
                formData={formData}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
                onClose={handleCloseModal}
            />
            <SupplyDetailModal
                supply={selectedSupply}
                onClose={handleCloseDetailModal}
                onEdit={(supply) => { handleCloseDetailModal(); handleEdit(supply); }}
            />
        </div>
    );
}
