import React, { useState, useEffect, useMemo } from 'react';
import { supplyApi } from '../../services/supplyApi';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, AlertCircle, Clock, Apple, Pill } from 'lucide-react';
import StatCard from '../../components/manager/StatCard';
import EmptyState from '../../components/manager/EmptyState';
import SupplyCard from '../../components/manager/SupplyCard';
import SupplyFormModal from '../../components/manager/SupplyFormModal';
import SupplyDetailModal from '../../components/manager/SupplyDetailModal';

export default function SupplyManagement() {
    const navigate = useNavigate();
    const [supplies, setSupplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingSupply, setEditingSupply] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedSupply, setSelectedSupply] = useState(null);
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
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-6 py-8">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-[#059669] tracking-tight">Quản lý Vật tư (Lô hàng)</h1>
                        <p className="text-slate-500 mt-1 flex items-center gap-2">
                            <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full"></span>
                            Quản lý tồn kho theo từng lô hàng - Cho phép cùng tên nhưng khác hạn sử dụng
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={openCreateModal}
                            className="px-5 py-2.5 rounded-xl bg-[#059669] text-white shadow-lg shadow-emerald-900/20 hover:bg-emerald-700 hover:scale-105 hover:shadow-emerald-900/30 transition-all duration-300 flex items-center gap-2 font-medium"
                        >
                            <Plus size={18} /> Nhập lô hàng mới
                        </button>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <StatCard label="Tổng lô hàng" count={stats.total} icon={Package} color="text-slate-600" />
                    <StatCard label="Đồ ăn & Nước" count={stats.foodWater} icon={Apple} color="text-green-600" />
                    <StatCard label="Y tế" count={stats.medical} icon={Pill} color="text-red-600" />
                    <StatCard label="Sắp hết hạn" count={stats.expiringSoon} icon={Clock} color="text-yellow-500" />
                </div>

                {/* Main Content */}
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 flex items-center gap-3">
                        <AlertCircle size={20} /> {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#059669]"></div>
                    </div>
                ) : supplies.length === 0 ? (
                    <EmptyState 
                        onAdd={openCreateModal}
                        icon={Package}
                        title="Chưa có lô hàng nào"
                        description="Hệ thống chưa ghi nhận lô hàng cứu trợ nào. Hãy nhập lô hàng đầu tiên để bắt đầu quản lý kho."
                        buttonText="+ Nhập lô hàng đầu tiên"
                    />
                ) : (
                    <div className="flex flex-col gap-2">
                        {supplies.map(supply => (
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
            </div>

            {/* Modal */}
            <SupplyFormModal
                showModal={showModal}
                editingSupply={editingSupply}
                formData={formData}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
                onClose={handleCloseModal}
            />

            {/* Detail Modal */}
            <SupplyDetailModal
                supply={selectedSupply}
                onClose={handleCloseDetailModal}
                onEdit={(supply) => { handleCloseDetailModal(); handleEdit(supply); }}
            />
        </div>
    );
}
