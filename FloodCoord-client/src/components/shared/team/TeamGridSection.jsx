import React from 'react';
import TeamCard from '../TeamCard';

export default function TeamGridSection({
  variant = 'manager',
  teams,
  loading,
  onCreate,
  onEdit,
  onDelete,
  onViewDetails,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  adminTheme,
}) {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {teams.map((team) => (
        <TeamCard
          key={team.id}
          team={team}
          mode="admin"
          onEdit={onEdit}
          onDelete={onDelete}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}
