import React, { useState, useEffect, useMemo } from 'react';
import { supplyApi } from '../../services/supplyApi';
import { Package, AlertCircle, Apple, Pill, Wrench, Box } from 'lucide-react';
import StatCard from '../../components/coordinator/StatCard';
import SupplyFormModal from '../../components/manager/SupplyFormModal';
import SupplyDetailModal from '../../components/manager/SupplyDetailModal';
import {
    ArchiveBoxIcon,
    ClockIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
    PlusIcon,
    PencilSquareIcon,
    TrashIcon,
    EyeIcon,
} from '@heroicons/react/24/outline';

const ITEMS_PER_PAGE = 10;

export default function SupplyManagement() {
    const [supplies, setSupplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingSupply, setEditingSupply] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedSupply, setSelectedSupply] = useState(null);
    const [filterType, setFilterType] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
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

    useEffect(() => { fetchSupplies(); }, []);
    useEffect(() => { setCurrentPage(1); }, [filterType, searchTerm]);

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
        setFormData(prev => ({ ...prev, [name]: value }));
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

    const openCreateModal = () => { resetForm(); setShowModal(true); };

    const formatDate = (dateString) => {
        if (!dateString) return 'Không có';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const isExpiringSoon = (expiryDate) => {
        if (!expiryDate) return false;
        const days = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
        return days <= 30 && days > 0;
    };

    const isExpired = (expiryDate) => {
        if (!expiryDate) return false;
        return new Date(expiryDate) < new Date();
    };

    const stats = useMemo(() => ({
        total: supplies.length,
        foodWater: supplies.filter(s => s.type === 'FOOD_WATER').length,
        medical: supplies.filter(s => s.type === 'MEDICAL').length,
        expiringSoon: supplies.filter(s => isExpiringSoon(s.expiryDate)).length
    }), [supplies]);

    const filteredSupplies = useMemo(() => supplies.filter(s => {
        const matchType = filterType === 'ALL' || s.type === filterType;
        const matchSearch = !searchTerm ||
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.description || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchType && matchSearch;
    }), [supplies, filterType, searchTerm]);

    const totalPages = Math.ceil(filteredSupplies.length / ITEMS_PER_PAGE);
    const paginatedSupplies = filteredSupplies.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div className="h-full flex flex-col p-4 gap-3 overflow-hidden">
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Quản lý Vật tư</h1>
                    <p className="text-xs text-gray-500">Quản lý tồn kho theo từng lô hàng cứu trợ.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 transition-colors"
                >
                    <PlusIcon className="h-3.5 w-3.5" /> Nhập lô hàng mới
                </button>
            </div>

            {/* Stat Cards */}
            <div className="shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard icon={<ArchiveBoxIcon className="h-6 w-6" />} count={stats.total}        label="Tổng lô hàng"  color="blue" />
                <StatCard icon={<Apple size={24} />}                     count={stats.foodWater}    label="Đồ ăn & Nước"  color="green" />
                <StatCard icon={<Pill size={24} />}                      count={stats.medical}      label="Y tế"           color="red" />
                <StatCard icon={<ClockIcon className="h-6 w-6" />}       count={stats.expiringSoon} label="Sắp hết hạn"   color="yellow" />
            </div>

            {/* Filter & Search */}
            <div className="shrink-0 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                <div className="relative flex-1 max-w-sm">
                    <MagnifyingGlassIcon className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm tên vật tư, ghi chú..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-8 pr-8 py-1.5 border border-gray-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600">
                            <XMarkIcon className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
                <div className="flex gap-0.5 bg-gray-100 p-0.5 rounded-lg flex-wrap">
                    {[
                        { value: 'ALL',        label: 'Tất cả',       icon: Package },
                        { value: 'FOOD_WATER', label: 'Đồ ăn & Nước', icon: Apple },
                        { value: 'MEDICAL',    label: 'Y tế',         icon: Pill },
                        { value: 'EQUIPMENT',  label: 'Thiết bị',     icon: Wrench },
                        { value: 'OTHER',      label: 'Khác',         icon: Box },
                    ].map(({ value, label, icon: Icon }) => (
                        <button
                            key={value}
                            onClick={() => setFilterType(value)}
                            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                                filterType === value
                                    ? 'bg-white text-blue-700 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {label}
                            <span className="ml-1 text-gray-400">
                                ({value === 'ALL' ? supplies.length : supplies.filter(s => s.type === value).length})
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="shrink-0 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2 text-xs">
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            {/* Table */}
            <div className="flex-1 min-h-0 bg-white border border-gray-200 rounded-lg flex flex-col overflow-hidden">
                <div className="flex-1 min-h-0 overflow-auto">
                    <table className="w-full text-xs">
                        <thead className="sticky top-0 z-10">
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="text-left px-3 py-2 font-semibold text-gray-600 w-10">#</th>
                                <th className="text-left px-3 py-2 font-semibold text-gray-600">Tên vật tư</th>
                                <th className="text-left px-3 py-2 font-semibold text-gray-600 w-32">Loại</th>
                                <th className="text-center px-3 py-2 font-semibold text-gray-600 w-24">Số lượng</th>
                                <th className="text-left px-3 py-2 font-semibold text-gray-600 w-32">Ngày nhập</th>
                                <th className="text-left px-3 py-2 font-semibold text-gray-600 w-32">Hạn sử dụng</th>
                                <th className="text-center px-3 py-2 font-semibold text-gray-600 w-28">Trạng thái</th>
                                <th className="text-center px-3 py-2 font-semibold text-gray-600 w-28">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                                            <span>Đang tải vật tư...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedSupplies.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-gray-400">
                                        <Package className="h-8 w-8 mx-auto mb-2 opacity-40" />
                                        <p>{supplies.length === 0 ? 'Chưa có lô hàng nào.' : 'Không tìm thấy lô hàng nào.'}</p>
                                        {(filterType !== 'ALL' || searchTerm) && (
                                            <button onClick={() => { setFilterType('ALL'); setSearchTerm(''); }} className="mt-1 text-blue-600 hover:underline text-xs">
                                                Xóa bộ lọc
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                paginatedSupplies.map((supply, index) => {
                                    const expired = isExpired(supply.expiryDate);
                                    const expiringSoon = !expired && isExpiringSoon(supply.expiryDate);
                                    const typeMap = {
                                        FOOD_WATER: { label: 'Đồ ăn & Nước', color: 'bg-green-100 text-green-700' },
                                        MEDICAL:    { label: 'Y tế',          color: 'bg-red-100 text-red-700' },
                                        EQUIPMENT:  { label: 'Thiết bị',      color: 'bg-blue-100 text-blue-700' },
                                        OTHER:      { label: 'Khác',          color: 'bg-gray-100 text-gray-600' },
                                    };
                                    const typeInfo = typeMap[supply.type] || typeMap.OTHER;
                                    return (
                                        <tr key={supply.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-3 py-2 text-gray-400 font-mono">
                                                {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                            </td>
                                            <td className="px-3 py-2">
                                                <p className="font-medium text-gray-900">{supply.name}</p>
                                                {supply.description && (
                                                    <p className="text-gray-400 mt-0.5 truncate max-w-xs">{supply.description}</p>
                                                )}
                                            </td>
                                            <td className="px-3 py-2">
                                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${typeInfo.color}`}>
                                                    {typeInfo.label}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <span className="font-semibold text-gray-800">{supply.quantity}</span>
                                                {supply.unit && <span className="text-gray-400 ml-1">{supply.unit}</span>}
                                            </td>
                                            <td className="px-3 py-2 text-gray-600">{formatDate(supply.importedDate)}</td>
                                            <td className="px-3 py-2 text-gray-600">
                                                {supply.expiryDate ? formatDate(supply.expiryDate) : <span className="text-gray-300">—</span>}
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                {expired ? (
                                                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Hết hạn</span>
                                                ) : expiringSoon ? (
                                                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Sắp hết hạn</span>
                                                ) : (
                                                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Còn hạn</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="flex items-center justify-center gap-0.5">
                                                    <button
                                                        onClick={() => { setSelectedSupply(supply); setShowDetailModal(true); }}
                                                        title="Xem chi tiết"
                                                        className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    >
                                                        <EyeIcon className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(supply)}
                                                        title="Chỉnh sửa"
                                                        className="p-1 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                                                    >
                                                        <PencilSquareIcon className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(supply.id)}
                                                        title="Xóa"
                                                        className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination footer */}
                {filteredSupplies.length > 0 && (
                    <div className="shrink-0 px-3 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-between">
                        <span>
                            Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredSupplies.length)} / {filteredSupplies.length} lô hàng
                        </span>
                        {totalPages > 1 && (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-2 py-1 rounded border border-gray-300 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                                >‹</button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-2 py-1 rounded border ${
                                            currentPage === page
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'border-gray-300 hover:bg-white'
                                        }`}
                                    >{page}</button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-2 py-1 rounded border border-gray-300 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                                >›</button>
                            </div>
                        )}
                        <span>{filteredSupplies.length} kết quả</span>
                    </div>
                )}
            </div>

            {/* Modals */}
            <SupplyFormModal
                showModal={showModal}
                editingSupply={editingSupply}
                formData={formData}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
                onClose={() => { setShowModal(false); resetForm(); }}
            />
            <SupplyDetailModal
                supply={selectedSupply}
                onClose={() => { setShowDetailModal(false); setSelectedSupply(null); }}
                onEdit={(supply) => { setShowDetailModal(false); setSelectedSupply(null); handleEdit(supply); }}
            />
        </div>
    );
}
