import React, { useEffect, useMemo, useState } from 'react';
import TeamCard from '../TeamCard';
import TableActionCell from '../table/TableActionCell';
import { getTeamStatusMeta } from '../styleMaps';
import TeamSearchBar from './TeamSearchBar';
import {
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const ITEMS_PER_PAGE = 10;

const STATUS_FILTER_TABS = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'AVAILABLE', label: 'Sẵn sàng' },
  { key: 'IN_MISSION', label: 'Đang nhiệm vụ' },
  { key: 'RESTING', label: 'Nghỉ ngơi' },
  { key: 'INACTIVE', label: 'Không hoạt động' },
];

const normalizeTeamStatus = (status) => {
  if (status === 'BUSY') return 'IN_MISSION';
  if (status === 'OFF_DUTY') return 'RESTING';
  return status;
};

const getManagerStatusMeta = (team) => {
  const normalizedStatus = normalizeTeamStatus(team?.status);
  return getTeamStatusMeta({ ...team, status: normalizedStatus }, 'admin');
};

export default function TeamGridSection({
  variant = 'manager',
  teams,
  loading,
  onCreate,
  onEdit,
  onDelete,
  onViewDetails,
  showSearch = false,
  searchTerm = '',
  setSearchTerm,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  adminTheme,
  readOnly = false,
}) {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  const managerTeams = useMemo(() => teams.filter((team) => {
    if (statusFilter === 'ALL') return true;
    return normalizeTeamStatus(team?.status) === statusFilter;
  }), [teams, statusFilter]);

  const totalPages = Math.ceil(managerTeams.length / ITEMS_PER_PAGE);
  const paginatedTeams = managerTeams.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const statusCounts = useMemo(() => ({
    ALL: teams.length,
    AVAILABLE: teams.filter((t) => normalizeTeamStatus(t?.status) === 'AVAILABLE').length,
    IN_MISSION: teams.filter((t) => normalizeTeamStatus(t?.status) === 'IN_MISSION').length,
    RESTING: teams.filter((t) => normalizeTeamStatus(t?.status) === 'RESTING').length,
    INACTIVE: teams.filter((t) => normalizeTeamStatus(t?.status) === 'INACTIVE').length,
  }), [teams]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, teams.length]);

  if (loading) {
    if (variant === 'admin') {
      return (
        <div className="flex justify-center items-center h-64">
          <div
            className="animate-spin rounded-full h-10 w-10 border-b-2"
            style={{ borderColor: adminTheme.primary }}
          />
        </div>
      );
    }

    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (teams.length === 0) {
    if (variant === 'admin') {
      return (
        <div
          className="text-center py-16 bg-white rounded-lg border border-dashed"
          style={{ borderColor: adminTheme.border }}
        >
          <div className="mx-auto mb-3 h-10 w-10" style={{ color: '#c8d8ec' }}>
            {emptyIcon}
          </div>
          <h3 className="text-base font-semibold mb-1" style={{ color: adminTheme.textMain }}>
            {emptyTitle}
          </h3>
          <p className="text-sm mb-4" style={{ color: adminTheme.textMuted }}>
            {emptyDescription}
          </p>
          <button
            onClick={onCreate}
            className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors"
            style={{ background: adminTheme.primary }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = adminTheme.primaryHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = adminTheme.primary;
            }}
          >
            + Tạo đội đầu tiên
          </button>
        </div>
      );
    }

    return (
      <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-lg">
        {emptyIcon}
        <h3 className="text-base font-semibold text-gray-700 mb-1">{emptyTitle}</h3>
        <p className="text-sm text-gray-500 mb-4">{emptyDescription}</p>
        <button onClick={onCreate} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
          + Tạo đội đầu tiên
        </button>
      </div>
    );
  }

  // Both manager and admin use the same table layout
  return (
    <>
      <div className="shrink-0 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        {showSearch && setSearchTerm && (
          <TeamSearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        )}

        <div className="flex gap-0.5 bg-gray-100 p-0.5 rounded-lg flex-wrap">
          {STATUS_FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                statusFilter === tab.key
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              <span className="ml-1 text-gray-400">({statusCounts[tab.key]})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-white border border-gray-200 rounded-lg flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 overflow-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-3 py-2 font-semibold text-gray-600 w-10">#</th>
                <th className="text-left px-3 py-2 font-semibold text-gray-600 w-72">Tên đội</th>
                <th className="text-left px-3 py-2 font-semibold text-gray-600 w-56">Đội trưởng</th>
                <th className="text-center px-3 py-2 font-semibold text-gray-600 w-32">Thành viên</th>
                <th className="text-center px-3 py-2 font-semibold text-gray-600 w-40">Trạng thái</th>
                <th className="text-center px-3 py-2 font-semibold text-gray-600 w-28">Hành động</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {paginatedTeams.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <UserGroupIcon className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p>Không tìm thấy đội nào phù hợp.</p>
                    <button
                      onClick={() => setStatusFilter('ALL')}
                      className="mt-1 text-blue-600 hover:underline text-xs"
                    >
                      Xóa bộ lọc
                    </button>
                  </td>
                </tr>
              ) : (
                paginatedTeams.map((team, index) => {
                  const statusMeta = getManagerStatusMeta(team);
                  const memberCount = team?.memberCount || team?.members?.length || 0;

                  return (
                    <tr key={team.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2 text-gray-400 font-mono">
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </td>
                      <td className="px-3 py-2 min-w-60">
                        <div>
                          <p className="font-medium text-gray-900 truncate">{team.name}</p>
                          {team.description && (
                            <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">{team.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-gray-700">{team.leaderName || 'Chưa có đội trưởng'}</td>
                      <td className="px-3 py-2 text-center text-gray-700">
                        <span className="font-semibold">{memberCount}</span>
                        <span className="text-gray-400 ml-1">người</span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${statusMeta.tone}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                          {statusMeta.label}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        {readOnly ? (
                          <button
                            onClick={() => onViewDetails(team)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Xem chi tiết"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                        ) : (
                          <TableActionCell
                            actions={[
                              {
                                key: 'view',
                                title: 'Xem chi tiết',
                                icon: EyeIcon,
                                onClick: () => onViewDetails(team),
                                tone: 'view',
                              },
                              {
                                key: 'edit',
                                title: 'Chỉnh sửa',
                                icon: PencilSquareIcon,
                                onClick: () => onEdit(team),
                                tone: 'edit',
                              },
                              {
                                key: 'delete',
                                title: 'Xóa đội',
                                icon: TrashIcon,
                                onClick: () => onDelete(team.id),
                                tone: 'delete',
                              },
                            ]}
                          />
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {managerTeams.length > 0 && (
          <div className="shrink-0 px-3 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-between">
            <span>
              Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, managerTeams.length)} / {managerTeams.length} đội
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <PaginationBtn onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>‹</PaginationBtn>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationBtn key={page} onClick={() => setCurrentPage(page)} active={currentPage === page}>{page}</PaginationBtn>
                ))}
                <PaginationBtn onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>›</PaginationBtn>
              </div>
            )}
            <span>{managerTeams.length} kết quả</span>
          </div>
        )}
      </div>
    </>
  );
}

function PaginationBtn({ children, onClick, disabled, active }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-2 py-1 rounded border text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        background: active ? '#2563eb' : '#fff',
        color: active ? '#fff' : '#64748b',
        borderColor: active ? '#2563eb' : '#d1d5db',
      }}
    >
      {children}
    </button>
  );
}
