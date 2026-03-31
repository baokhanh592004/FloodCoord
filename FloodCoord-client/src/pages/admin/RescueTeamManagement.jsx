import React from 'react';
import TeamManagementPage from '../../components/shared/team/TeamManagementPage';
import { UserGroupIcon } from '@heroicons/react/24/outline';

// ── Admin color palette ──────────────────────────────────────────────────────
const C = {
    primary: '#1c1c18',
    primaryHover: '#3a3a32',
    primarySoft: '#f5f4ef',
    accent: '#e85d26',
    border: '#e2e8f0',
    textMain: '#0d2240',
    textMuted: '#64748b',
}

export default function RescueTeamManagement() {
    return (
        <TeamManagementPage
            variant="admin"
            title="Quản lý Đội Cứu Hộ"
            subtitle="Quản lý đội ngũ và thành viên cứu hộ."
            emptyIcon={<UserGroupIcon className="h-10 w-10" />}
            emptyTitle="Chưa có đội cứu hộ nào"
            emptyDescription="Hãy tạo đội đầu tiên để bắt đầu quản lý."
            adminTheme={C}
        />
    );
}