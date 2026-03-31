import React from 'react';
import { AlertCircle, Apple, Pill, FileDown } from 'lucide-react';
import StatCard from '../../coordinator/StatCard';
import SupplyFormModal from '../../manager/SupplyFormModal';
import SupplyDetailModal from '../../manager/SupplyDetailModal';
import { useSupplyManagement } from '../../../hooks/useSupplyManagement';
import SupplyFilterBar from './SupplyFilterBar';
import SupplyTableSection from './SupplyTableSection';
import SectionHeader from '../layout/SectionHeader';
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
    itemsPerPage,
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
  } = useSupplyManagement();

  const isAdmin = variant === 'admin';

  const headerActions = (
    <>
      {isAdmin ? (
        <button
          onClick={exportToExcel}
          disabled={supplies.length === 0}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-semibold rounded-lg disabled:opacity-50 transition-colors"
          style={{ background: adminTheme.success }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = adminTheme.successHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = adminTheme.success;
          }}
        >
          <FileDown size={13} /> Xuất Excel
        </button>
      ) : (
        <button
          onClick={exportToExcel}
          disabled={supplies.length === 0}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-md text-xs font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          <FileDown size={13} /> Xuất Excel
        </button>
      )}

      {!readOnly && (
        isAdmin ? (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-semibold rounded-lg transition-colors"
            style={{ background: adminTheme.primary }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = adminTheme.primaryHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = adminTheme.primary;
            }}
          >
            <PlusIcon className="h-3.5 w-3.5" /> Nhập lô hàng mới
          </button>
        ) : (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-3.5 w-3.5" /> Nhập lô hàng mới
          </button>
        )
      )}
    </>
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
