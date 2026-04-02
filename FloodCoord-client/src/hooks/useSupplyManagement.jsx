import { useCallback, useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { supplyApi } from '../services/supplyApi';

const ITEMS_PER_PAGE = 10;

const EMPTY_FORM = {
  name: '',
  type: 'FOOD_WATER',
  quantity: '',
  unit: '',
  description: '',
  importedDate: '',
  expiryDate: '',
  exportedDate: '',
};

function toDateTimeLocal(dateTime) {
  return dateTime ? dateTime.substring(0, 16) : '';
}

export function useSupplyManagement() {
  const [supplies, setSupplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSupply, setEditingSupply] = useState(null);
  const [selectedSupply, setSelectedSupply] = useState(null);
  const [filterType, setFilterType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPagesMeta, setTotalPagesMeta] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const fetchSupplies = useCallback(async (page = currentPage) => {
    try {
      setLoading(true);
      const data = await supplyApi.getAllSupplies(page - 1, ITEMS_PER_PAGE);
      const supplyList = Array.isArray(data) ? data : (data?.content || []);
      setSupplies(supplyList);
      setTotalPagesMeta(Number.isInteger(data?.totalPages) ? data.totalPages : (supplyList.length > 0 ? 1 : 0));
      setTotalElements(Number.isInteger(data?.totalElements) ? data.totalElements : supplyList.length);
      if (Number.isInteger(data?.number)) {
        setCurrentPage(data.number + 1);
      }
      setError('');
    } catch {
      setError('Không thể tải danh sách vật tư');
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchSupplies(currentPage);
  }, [currentPage, fetchSupplies]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, searchTerm]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(EMPTY_FORM);
    setEditingSupply(null);
  }, []);

  const openCreateModal = useCallback(() => {
    resetForm();
    setShowModal(true);
  }, [resetForm]);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    resetForm();
  }, [resetForm]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        type: formData.type,
        quantity: Number.parseInt(formData.quantity, 10),
        unit: formData.unit,
        description: formData.description,
        importedDate: formData.importedDate ? new Date(formData.importedDate).toISOString() : null,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : null,
        exportedDate: formData.exportedDate ? new Date(formData.exportedDate).toISOString() : null,
      };

      if (editingSupply) {
        await supplyApi.updateSupply(editingSupply.id, payload);
      } else {
        await supplyApi.createSupply(payload);
      }

      setShowModal(false);
      resetForm();
      await fetchSupplies(currentPage);
    } catch {
      setError(editingSupply ? 'Không thể cập nhật vật tư' : 'Không thể tạo vật tư');
    }
  }, [currentPage, editingSupply, fetchSupplies, formData, resetForm]);

  const handleEdit = useCallback((supply) => {
    setEditingSupply(supply);
    setFormData({
      name: supply.name,
      type: supply.type,
      quantity: supply.quantity.toString(),
      unit: supply.unit,
      description: supply.description || '',
      importedDate: toDateTimeLocal(supply.importedDate),
      expiryDate: toDateTimeLocal(supply.expiryDate),
      exportedDate: toDateTimeLocal(supply.exportedDate),
    });
    setShowModal(true);
  }, []);

  const handleDelete = useCallback(async (supplyId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa vật tư này?')) {
      return;
    }

    try {
      await supplyApi.deleteSupply(supplyId);
      await fetchSupplies(currentPage);
    } catch {
      setError('Không thể xóa vật tư');
    }
  }, [currentPage, fetchSupplies]);

  const handleViewDetail = useCallback((supply) => {
    setSelectedSupply(supply);
  }, []);

  const handleCloseDetailModal = useCallback(() => {
    setSelectedSupply(null);
  }, []);

  const isExpiringSoon = useCallback((expiryDate) => {
    if (!expiryDate) {
      return false;
    }
    const daysUntilExpiry = Math.ceil((new Date(expiryDate) - new Date()) / 86400000);
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  }, []);

  const isExpired = useCallback((expiryDate) => {
    if (!expiryDate) {
      return false;
    }
    return new Date(expiryDate) < new Date();
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) {
      return 'Không có';
    }

    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const stats = useMemo(() => ({
    total: supplies.length,
    foodWater: supplies.filter((s) => s.type === 'FOOD_WATER').length,
    medical: supplies.filter((s) => s.type === 'MEDICAL').length,
    expiringSoon: supplies.filter((s) => isExpiringSoon(s.expiryDate)).length,
  }), [isExpiringSoon, supplies]);

  const filteredSupplies = useMemo(() => supplies.filter((s) => {
    const matchType = filterType === 'ALL' || s.type === filterType;
    const normalizedSearch = searchTerm.toLowerCase();
    const matchSearch = !searchTerm
      || s.name.toLowerCase().includes(normalizedSearch)
      || (s.description || '').toLowerCase().includes(normalizedSearch);
    return matchType && matchSearch;
  }), [filterType, searchTerm, supplies]);

  const totalPages = useMemo(() => Math.max(totalPagesMeta, 1), [totalPagesMeta]);

  const paginatedSupplies = useMemo(() => filteredSupplies, [filteredSupplies]);

  const exportToExcel = useCallback(() => {
    const typeMap = {
      FOOD_WATER: 'Đồ ăn & Nước',
      MEDICAL: 'Y tế',
      EQUIPMENT: 'Thiết bị',
      OTHER: 'Khác',
    };

    const getStatus = (s) => {
      if (isExpired(s.expiryDate)) return 'Hết hạn';
      if (isExpiringSoon(s.expiryDate)) return 'Sắp hết hạn';
      return 'Còn hạn';
    };

    const exportData = supplies.map((s, idx) => ({
      STT: idx + 1,
      'Tên vật tư': s.name || '',
      'Loại': typeMap[s.type] || s.type || '',
      'Số lượng': s.quantity ?? '',
      'Đơn vị': s.unit || '',
      'Ngày nhập': s.importedDate ? new Date(s.importedDate).toLocaleDateString('vi-VN') : '',
      'Hạn sử dụng': s.expiryDate ? new Date(s.expiryDate).toLocaleDateString('vi-VN') : '',
      'Trạng thái': getStatus(s),
      'Mô tả': s.description || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    worksheet['!cols'] = [
      { wch: 5 },
      { wch: 30 },
      { wch: 16 },
      { wch: 10 },
      { wch: 10 },
      { wch: 14 },
      { wch: 14 },
      { wch: 16 },
      { wch: 40 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vật tư');
    const today = new Date().toLocaleDateString('vi-VN').replace(/\//g, '-');
    XLSX.writeFile(workbook, `Danh_sach_vat_tu_${today}.xlsx`);
  }, [isExpired, isExpiringSoon, supplies]);

  return {
    itemsPerPage: ITEMS_PER_PAGE,
    supplies,
    loading,
    error,
    showModal,
    editingSupply,
    selectedSupply,
    filterType,
    searchTerm,
    currentPage,
    formData,
    stats,
    filteredSupplies,
    paginatedSupplies,
    totalPages,
    totalElements,
    setFilterType,
    setSearchTerm,
    setCurrentPage,
    handleInputChange,
    handleSubmit,
    handleEdit,
    handleDelete,
    openCreateModal,
    handleCloseModal,
    handleViewDetail,
    handleCloseDetailModal,
    formatDate,
    isExpired,
    isExpiringSoon,
    exportToExcel,
    refreshData: () => fetchSupplies(currentPage),
  };
}
