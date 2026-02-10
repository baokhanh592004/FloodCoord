import React, { useState, useEffect } from 'react';
import { supplyApi } from '../../services/supplyApi';
import { useNavigate } from 'react-router-dom';

export default function SupplyManagement() {
    const navigate = useNavigate();
    const [supplies, setSupplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingSupply, setEditingSupply] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'FOOD_WATER',
        quantity: '',
        unit: '',
        description: '',
        importedDate: '',
        expiryDate: ''
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
                expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : null
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
            expiryDate: supply.expiryDate ? supply.expiryDate.substring(0, 16) : ''
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
            expiryDate: ''
        });
        setEditingSupply(null);
    };

    const openCreateModal = () => {
        resetForm();
        setShowModal(true);
    };

    const getTypeColor = (type) => {
        const colors = {
            FOOD_WATER: 'bg-green-100 text-green-800',
            MEDICAL: 'bg-red-100 text-red-800',
            EQUIPMENT: 'bg-blue-100 text-blue-800',
            OTHER: 'bg-gray-100 text-gray-800'
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    const getTypeLabel = (type) => {
        const found = supplyTypes.find(t => t.value === type);
        return found ? found.label : type;
    };

    const getTypeIcon = (type) => {
        const icons = {
            FOOD_WATER: '🍱',
            MEDICAL: '💊',
            EQUIPMENT: '🔦',
            OTHER: '📦'
        };
        return icons[type] || '📦';
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

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Quản lý Vật tư</h1>
                            <p className="text-gray-600 mt-1">Quản lý tồn kho và vật tư cứu trợ</p>
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
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                            >
                                + Thêm vật tư
                            </button>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow p-4">
                        <p className="text-gray-600 text-sm">Tổng vật tư</p>
                        <p className="text-2xl font-bold text-blue-600">{supplies.length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <p className="text-gray-600 text-sm">Đồ ăn & Nước</p>
                        <p className="text-2xl font-bold text-green-600">
                            {supplies.filter(s => s.type === 'FOOD_WATER').length}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <p className="text-gray-600 text-sm">Y tế</p>
                        <p className="text-2xl font-bold text-red-600">
                            {supplies.filter(s => s.type === 'MEDICAL').length}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <p className="text-gray-600 text-sm">Sắp hết hạn</p>
                        <p className="text-2xl font-bold text-yellow-600">
                            {supplies.filter(s => isExpiringSoon(s.expiryDate)).length}
                        </p>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {/* Supplies Grid */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                        <p className="mt-4 text-gray-600">Đang tải...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {supplies.map(supply => (
                            <div key={supply.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-4xl">{getTypeIcon(supply.type)}</span>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{supply.name}</h3>
                                            <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(supply.type)}`}>
                                                {getTypeLabel(supply.type)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Số lượng:</span>
                                        <span className="font-bold text-lg text-blue-600">
                                            {supply.quantity} {supply.unit}
                                        </span>
                                    </div>

                                    {supply.description && (
                                        <div>
                                            <p className="text-gray-600 text-sm">Ghi chú:</p>
                                            <p className="text-sm">{supply.description}</p>
                                        </div>
                                    )}

                                    <div className="border-t pt-2 mt-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Nhập kho:</span>
                                            <span className="font-semibold">{formatDate(supply.importedDate)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm mt-1">
                                            <span className="text-gray-600">Hạn sử dụng:</span>
                                            <span className={`font-semibold ${
                                                isExpired(supply.expiryDate) ? 'text-red-600' :
                                                isExpiringSoon(supply.expiryDate) ? 'text-yellow-600' :
                                                'text-gray-900'
                                            }`}>
                                                {formatDate(supply.expiryDate)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Warning badges */}
                                    {isExpired(supply.expiryDate) && (
                                        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-1 rounded text-xs">
                                            ⚠️ Đã hết hạn
                                        </div>
                                    )}
                                    {isExpiringSoon(supply.expiryDate) && !isExpired(supply.expiryDate) && (
                                        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-1 rounded text-xs">
                                            ⏰ Sắp hết hạn
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(supply)}
                                        className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        onClick={() => handleDelete(supply.id)}
                                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && supplies.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg">
                        <p className="text-gray-500 text-lg">Chưa có vật tư nào</p>
                        <button
                            onClick={openCreateModal}
                            className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                        >
                            Thêm vật tư đầu tiên
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
                    <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 my-8">
                        <h2 className="text-2xl font-bold mb-6">
                            {editingSupply ? 'Cập nhật vật tư' : 'Thêm vật tư mới'}
                        </h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        Tên vật tư *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="VD: Mì tôm Hảo Hảo"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        Loại vật tư *
                                    </label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required
                                    >
                                        {supplyTypes.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        Số lượng *
                                    </label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="VD: 100"
                                        min="0"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        Đơn vị *
                                    </label>
                                    <input
                                        type="text"
                                        name="unit"
                                        value={formData.unit}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="VD: Thùng, Hộp, Cái..."
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Mô tả / Ghi chú
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="VD: Lô 1 - Ưu tiên xuất trước"
                                    rows="2"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        Ngày nhập kho
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="importedDate"
                                        value={formData.importedDate}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        Hạn sử dụng
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="expiryDate"
                                        value={formData.expiryDate}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
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
                                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                                >
                                    {editingSupply ? 'Cập nhật' : 'Thêm mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
