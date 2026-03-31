import React from 'react';
import { AlertCircle } from 'lucide-react';
import StatCard from '../../coordinator/StatCard';
import TeamFormModal from '../../admin/TeamFormModal';
import TeamDetailModal from '../../admin/TeamDetailModal';
import TeamGridSection from './TeamGridSection';
import SectionHeader from '../layout/SectionHeader';
import { useRescueTeamManagement } from '../../../hooks/useRescueTeamManagement';
import {
  UserGroupIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

export default function TeamManagementPage({
  variant = 'manager',
  title,
  subtitle,
  showSearch = false,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  adminTheme,
}) {
  const {
    teams,
    availableUsers,
    loading,
    error,
    showModal,
    editingTeam,
    selectedTeam,
    searchTerm,
    formData,
    filteredTeams,
    stats,
    setSearchTerm,
    handleInputChange,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleViewDetails,
    handleRemoveMember,
    openCreateModal,
    closeModal,
    closeDetailModal,
  } = useRescueTeamManagement();

  const displayTeams = showSearch ? filteredTeams : teams;

  const headerActions = variant === 'admin' ? (
    <button
      onClick={openCreateModal}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors"
      style={{ background: adminTheme.primary }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = adminTheme.primaryHover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = adminTheme.primary;
      }}
    >
      <PlusIcon className="h-4 w-4" /> Tạo đội mới
    </button>
  ) : (
    <button
      onClick={openCreateModal}
      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
    >
      <PlusIcon className="h-4 w-4" /> Tạo đội mới
    </button>
  );

  return (
    <div className={variant === 'manager' ? 'h-full flex flex-col p-4 gap-3 overflow-hidden' : 'p-6 space-y-6 overflow-y-auto h-full'}>
      <SectionHeader
        variant={variant}
        title={title}
        subtitle={subtitle}
        actions={headerActions}
        adminTheme={adminTheme}
        containerClass="flex items-start justify-between"
        managerTitleClass="text-xl font-bold text-gray-900"
        adminTitleClass="text-2xl font-bold"
        managerSubtitleClass="text-xs text-gray-500"
        adminSubtitleClass="text-sm mt-0.5"
      />

      <div className={variant === 'manager' ? 'shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-3' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'}>
        <StatCard icon={<UserGroupIcon className="h-6 w-6" />} count={stats.total} label="Tổng số đội" color="blue" />
        <StatCard icon={<CheckCircleIcon className="h-6 w-6" />} count={stats.available} label="Đội sẵn sàng" color="green" />
        <StatCard icon={<ShieldCheckIcon className="h-6 w-6" />} count={stats.inMission} label="Đang nhiệm vụ" color="yellow" />
        <StatCard icon={<UserGroupIcon className="h-6 w-6" />} count={stats.totalMembers} label="Tổng thành viên" color="rose" />
      </div>

      {error && (
        <div
          className={variant === 'admin' ? 'p-4 rounded-lg flex items-center gap-3 text-sm' : 'p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-3 text-sm'}
          style={variant === 'admin' ? { background: '#fff0ed', border: '1px solid #ffd5c2', color: '#9a3a10' } : undefined}
        >
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <TeamGridSection
        variant={variant}
        teams={displayTeams}
        loading={loading}
        onCreate={openCreateModal}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewDetails={handleViewDetails}
        showSearch={showSearch}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        emptyIcon={emptyIcon}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        adminTheme={adminTheme}
      />

      <TeamFormModal
        showModal={showModal}
        editingTeam={editingTeam}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        onClose={closeModal}
        availableUsers={availableUsers}
      />
      <TeamDetailModal
        team={selectedTeam}
        onClose={closeDetailModal}
        onRemoveMember={handleRemoveMember}
      />
    </div>
  );
}
