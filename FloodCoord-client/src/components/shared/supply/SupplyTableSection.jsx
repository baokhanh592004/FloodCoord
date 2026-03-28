import React from 'react';
import { Package } from 'lucide-react';
import { PencilSquareIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import TableActionCell from '../table/TableActionCell';

const TYPE_META = {
  FOOD_WATER: {
    label: 'Đồ ăn & Nước',
    admin: { bg: '#edfbf3', color: '#14532d' },
    managerClass: 'bg-green-100 text-green-700',
  },
  MEDICAL: {
    label: 'Y tế',
    admin: { bg: '#fff0ed', color: '#9a3a10' },
    managerClass: 'bg-red-100 text-red-700',
  },
  EQUIPMENT: {
    label: 'Thiết bị',
    admin: { bg: '#eff6ff', color: '#1e3a8a' },
    managerClass: 'bg-blue-100 text-blue-700',
  },
  OTHER: {
    label: 'Khác',
    admin: { bg: '#f4f6fa', color: '#64748b' },
    managerClass: 'bg-gray-100 text-gray-600',
  },
};

function PaginationBtn({ children, onClick, disabled, active, variant }) {
  if (variant === 'admin') {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className="px-2 py-1 rounded border text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: active ? '#1c1c18' : '#fff',
          color: active ? '#fff' : '#64748b',
          borderColor: active ? '#1c1c18' : '#e2e8f0',
        }}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-2 py-1 rounded border ${
        active
          ? 'bg-blue-600 text-white border-blue-600'
          : 'border-gray-300 hover:bg-white'
      } disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

export default function SupplyTableSection({
  variant,
  theme,
  supplies,
  loading,
  filterType,
  setFilterType,
  searchTerm,
  setSearchTerm,
  filteredSupplies,
  paginatedSupplies,
  currentPage,
  setCurrentPage,
  totalPages,
  itemsPerPage,
  isExpired,
  isExpiringSoon,
  formatDate,
  handleViewDetail,
  handleEdit,
  handleDelete,
}) {
  const isAdmin = variant === 'admin';

  return (
    <div
      className={isAdmin
        ? 'flex-1 min-h-0 bg-white rounded-lg flex flex-col overflow-hidden'
        : 'flex-1 min-h-0 bg-white border border-gray-200 rounded-lg flex flex-col overflow-hidden'}
      style={isAdmin ? { border: `1px solid ${theme.border}` } : undefined}
    >
      <div className="flex-1 min-h-0 overflow-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 z-10">
            <tr
              className={isAdmin ? undefined : 'bg-gray-50 border-b border-gray-200'}
              style={isAdmin ? { background: '#f4f6fa', borderBottom: `1px solid ${theme.border}` } : undefined}
            >
              {['#', 'Tên vật tư', 'Loại', 'Số lượng', 'Ngày nhập', 'Hạn sử dụng', 'Trạng thái', 'Hành động'].map((h, i) => (
                <th
                  key={i}
                  className={`px-3 py-2 font-semibold text-left ${[3, 6, 7].includes(i) ? 'text-center' : ''} ${isAdmin ? '' : 'text-gray-600'}`}
                  style={isAdmin ? {
                    color: theme.textMuted,
                    width: [10, 280, 128, 96, 128, 128, 112, 112][i],
                  } : undefined}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className={isAdmin ? 'divide-y' : 'divide-y divide-gray-100'} style={isAdmin ? { borderColor: '#f4f6fa' } : undefined}>
            {loading ? (
              <tr>
                <td colSpan={8} className={isAdmin ? 'py-12 text-center' : 'py-12 text-center text-gray-400'} style={isAdmin ? { color: theme.textFaint } : undefined}>
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={isAdmin
                        ? 'animate-spin rounded-full h-6 w-6 border-b-2'
                        : 'animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600'}
                      style={isAdmin ? { borderColor: theme.primary } : undefined}
                    />
                    <span>Đang tải vật tư...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedSupplies.length === 0 ? (
              <tr>
                <td colSpan={8} className={isAdmin ? 'py-12 text-center' : 'py-12 text-center text-gray-400'} style={isAdmin ? { color: theme.textFaint } : undefined}>
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p>{supplies.length === 0 ? 'Chưa có lô hàng nào.' : 'Không tìm thấy lô hàng nào.'}</p>
                  {(filterType !== 'ALL' || searchTerm) && (
                    <button
                      onClick={() => {
                        setFilterType('ALL');
                        setSearchTerm('');
                      }}
                      className={isAdmin ? 'mt-1 text-xs hover:underline' : 'mt-1 text-blue-600 hover:underline text-xs'}
                      style={isAdmin ? { color: theme.primary } : undefined}
                    >
                      Xóa bộ lọc
                    </button>
                  )}
                </td>
              </tr>
            ) : paginatedSupplies.map((supply, index) => {
              const expired = isExpired(supply.expiryDate);
              const expiringSoon = !expired && isExpiringSoon(supply.expiryDate);
              const typeInfo = TYPE_META[supply.type] || TYPE_META.OTHER;

              return (
                <tr key={supply.id} className={isAdmin ? 'hover:bg-admin-50 transition-colors' : 'hover:bg-gray-50 transition-colors'}>
                  <td className={isAdmin ? 'px-3 py-2 font-mono' : 'px-3 py-2 text-gray-400 font-mono'} style={isAdmin ? { color: theme.textFaint } : undefined}>
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="px-3 py-2 min-w-60">
                    <p className={isAdmin ? 'font-medium truncate' : 'font-medium text-gray-900 truncate'} style={isAdmin ? { color: theme.textMain } : undefined}>{supply.name}</p>
                    {supply.description && (
                      <p className={isAdmin ? 'mt-0.5 truncate max-w-xs' : 'text-gray-400 mt-0.5 truncate max-w-xs'} style={isAdmin ? { color: theme.textFaint } : undefined}>
                        {supply.description}
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {isAdmin ? (
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: typeInfo.admin.bg, color: typeInfo.admin.color }}>
                        {typeInfo.label}
                      </span>
                    ) : (
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${typeInfo.managerClass}`}>
                        {typeInfo.label}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className={isAdmin ? 'font-semibold' : 'font-semibold text-gray-800'} style={isAdmin ? { color: theme.textMain } : undefined}>{supply.quantity}</span>
                    {supply.unit && <span className={isAdmin ? 'ml-1' : 'text-gray-400 ml-1'} style={isAdmin ? { color: theme.textFaint } : undefined}>{supply.unit}</span>}
                  </td>
                  <td className={isAdmin ? 'px-3 py-2' : 'px-3 py-2 text-gray-600'} style={isAdmin ? { color: theme.textMuted } : undefined}>
                    {formatDate(supply.importedDate)}
                  </td>
                  <td className={isAdmin ? 'px-3 py-2' : 'px-3 py-2 text-gray-600'} style={isAdmin ? { color: theme.textMuted } : undefined}>
                    {supply.expiryDate ? formatDate(supply.expiryDate) : <span style={isAdmin ? { color: theme.textFaint } : undefined} className={isAdmin ? '' : 'text-gray-300'}>—</span>}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {expired ? (
                      <span
                        className={isAdmin ? 'inline-block px-2 py-0.5 rounded-full text-xs font-medium' : 'inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700'}
                        style={isAdmin ? { background: '#fff0ed', color: '#9a3a10' } : undefined}
                      >
                        Hết hạn
                      </span>
                    ) : expiringSoon ? (
                      <span className={isAdmin ? 'inline-block px-2 py-0.5 rounded-full text-xs font-medium' : 'inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700'} style={isAdmin ? { background: '#fefce8', color: '#78350f' } : undefined}>
                        Sắp hết hạn
                      </span>
                    ) : (
                      <span className={isAdmin ? 'inline-block px-2 py-0.5 rounded-full text-xs font-medium' : 'inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700'} style={isAdmin ? { background: '#edfbf3', color: '#14532d' } : undefined}>
                        Còn hạn
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <TableActionCell
                      variant={variant}
                      theme={theme}
                      actions={[
                        {
                          key: 'view',
                          title: 'Xem chi tiết',
                          icon: EyeIcon,
                          onClick: () => handleViewDetail(supply),
                          tone: 'view',
                        },
                        {
                          key: 'edit',
                          title: 'Chỉnh sửa',
                          icon: PencilSquareIcon,
                          onClick: () => handleEdit(supply),
                          tone: 'edit',
                        },
                        {
                          key: 'delete',
                          title: 'Xóa',
                          icon: TrashIcon,
                          onClick: () => handleDelete(supply.id),
                          tone: 'delete',
                        },
                      ]}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredSupplies.length > 0 && (
        <div
          className={isAdmin
            ? 'shrink-0 px-3 py-2 border-t text-xs flex items-center justify-between'
            : 'shrink-0 px-3 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-between'}
          style={isAdmin ? { background: '#f4f6fa', borderColor: theme.border, color: theme.textMuted } : undefined}
        >
          <span>
            Hiển thị {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredSupplies.length)} / {filteredSupplies.length} lô hàng
          </span>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <PaginationBtn
                variant={variant}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                ‹
              </PaginationBtn>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationBtn
                  key={page}
                  variant={variant}
                  onClick={() => setCurrentPage(page)}
                  active={currentPage === page}
                >
                  {page}
                </PaginationBtn>
              ))}

              <PaginationBtn
                variant={variant}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                ›
              </PaginationBtn>
            </div>
          )}

          <span>{filteredSupplies.length} kết quả</span>
        </div>
      )}
    </div>
  );
}
