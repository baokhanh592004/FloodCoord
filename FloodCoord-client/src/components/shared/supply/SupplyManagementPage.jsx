import React, { useRef, useState } from 'react'; // Thêm useRef và useState
import { AlertCircle, Apple, Pill, FileDown, FileUp, Download } from 'lucide-react'; // Thêm icon FileUp, Download
import StatCard from '../../coordinator/StatCard';
import SupplyFormModal from '../../manager/SupplyFormModal';
import SupplyDetailModal from '../../manager/SupplyDetailModal';
import { useSupplyManagement } from '../../../hooks/useSupplyManagement';
import { importApi } from '../../../services/importApi'; // Import api bạn đã cung cấp
import SupplyFilterBar from './SupplyFilterBar';
import SupplyTableSection from './SupplyTableSection';
import SectionHeader from '../layout/SectionHeader';
import { toast } from 'react-hot-toast'; // Giả định bạn dùng toast để thông báo
import {
  ArchiveBoxIcon,
  ClockIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

export default function SupplyManagementPage({
  variant = 'manager',
  title,
  subtitle,
  adminTheme,
  readOnly = false,
}) {
  const {
    // ... các thuộc tính cũ ...
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
    itemsPerPage,
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
    refreshData // Đảm bảo hook của bạn có hàm load lại dữ liệu sau khi import
  } = useSupplyManagement();

  const isAdmin = variant === 'admin';
  const fileInputRef = useRef(null); // Ref để kích hoạt input file ẩn
  const [importing, setImporting] = useState(false);

  // ===== XỬ LÝ IMPORT FILE =====
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      await importApi.supply.importExcel(file);
      toast.success('Nhập dữ liệu vật tư thành công!');
      if (refreshData) refreshData(); // Load lại danh sách sau khi import
    } catch (err) {
      toast.error(err.response?.data || 'Lỗi khi nhập file Excel!');
    } finally {
      setImporting(false);
      e.target.value = ''; // Reset input
    }
  };

  // ===== XỬ LÝ TẢI TEMPLATE =====
  const handleDownloadTemplate = async () => {
    try {
      const response = await importApi.supply.getTemplate();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Mau_Nhap_Vat_Tu.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error(err.response?.data || 'Lỗi không thể tải file mẫu');
    }
  };

  const headerActions = (
    <div className="flex items-center gap-2">
      {/* Input file ẩn */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        accept=".xlsx, .xls"
        className="hidden"
      />

      {/* Nút Xuất Excel (Giữ nguyên của bạn) */}
      <button
        onClick={exportToExcel}
        disabled={supplies.length === 0}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-semibold rounded-lg disabled:opacity-50 transition-colors ${!isAdmin ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
        style={isAdmin ? { background: adminTheme.success } : undefined}
      >
        <FileDown size={13} /> Xuất Excel
      </button>

      {/* NÚT IMPORT EXCEL (THÊM MỚI) */}
      {!readOnly && (
        <>
          <button
            onClick={handleImportClick}
            disabled={importing}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 border text-xs font-semibold rounded-lg transition-colors ${
              isAdmin 
                ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50' 
                : 'bg-white text-emerald-700 border-emerald-600 hover:bg-emerald-50'
            }`}
          >
            <FileUp size={13} /> {importing ? 'Đang xử lý...' : 'Nhập Excel'}
          </button>

          {/* Nút Tải Template */}
          <button
            onClick={handleDownloadTemplate}
            title="Tải file mẫu"
            className="p-1.5 text-gray-500 hover:text-blue-600 border border-gray-200 rounded-lg bg-white transition-all"
          >
            <Download size={14} />
          </button>
        </>
      )}

      {/* Nút Nhập lô hàng mới (Giữ nguyên của bạn) */}
      {!readOnly && (
        <button
          onClick={openCreateModal}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-semibold rounded-lg transition-colors ${!isAdmin ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
          style={isAdmin ? { background: adminTheme.primary } : undefined}
        >
          <PlusIcon className="h-3.5 w-3.5" /> Nhập lô hàng mới
        </button>
      )}
    </div>
  );

  return (
    <div className="h-full flex flex-col p-4 gap-3 overflow-hidden">
      <SectionHeader
        variant={variant}
        title={title}
        subtitle={subtitle}
        actions={headerActions}
        adminTheme={adminTheme}
      />

      {/* Thông báo đang import */}
      {importing && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg text-xs animate-pulse">
          Hệ thống đang xử lý tệp tin, vui lòng không đóng trình duyệt...
        </div>
      )}

      <div className="shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<ArchiveBoxIcon className="h-6 w-6" />} count={stats.total} label="Tổng lô hàng" color="blue" />
        <StatCard icon={<Apple size={24} />} count={stats.foodWater} label="Đồ ăn & Nước" color="green" />
        <StatCard icon={<Pill size={24} />} count={stats.medical} label="Y tế" color="red" />
        <StatCard icon={<ClockIcon className="h-6 w-6" />} count={stats.expiringSoon} label="Sắp hết hạn" color="yellow" />
      </div>

      <SupplyFilterBar
        variant={variant}
        theme={adminTheme}
        supplies={supplies}
        filterType={filterType}
        setFilterType={setFilterType}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {error && (
        <div
          className={isAdmin ? 'shrink-0 p-3 rounded-lg flex items-center gap-2 text-xs' : 'shrink-0 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2 text-xs'}
          style={isAdmin ? { background: '#fff0ed', border: '1px solid #ffd5c2', color: '#9a3a10' } : undefined}
        >
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <SupplyTableSection
        variant={variant}
        theme={adminTheme}
        supplies={supplies}
        loading={loading}
        filterType={filterType}
        setFilterType={setFilterType}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filteredSupplies={filteredSupplies}
        paginatedSupplies={paginatedSupplies}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        isExpired={isExpired}
        isExpiringSoon={isExpiringSoon}
        formatDate={formatDate}
        handleViewDetail={handleViewDetail}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        readOnly={readOnly}
      />

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
        onEdit={(supply) => {
          handleCloseDetailModal();
          handleEdit(supply);
        }}
      />
    </div>
  );
}