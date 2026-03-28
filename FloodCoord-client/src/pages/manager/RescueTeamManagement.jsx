import React from 'react';
import { Shield } from 'lucide-react';
import TeamManagementPage from '../../components/shared/team/TeamManagementPage';

export default function RescueTeamManagement() {
    return (
        <TeamManagementPage
            variant="manager"
            title="Quản lý Đội cứu hộ"
            subtitle="Điều phối nhân lực và đội ngũ phản ứng nhanh."
            showSearch
            emptyIcon={<Shield size={40} className="mx-auto text-gray-300 mb-3" />}
            emptyTitle="Chưa có đội cứu hộ nào"
            emptyDescription="Hãy thiết lập các đội phản ứng nhanh để bắt đầu công tác cứu trợ."
        />
    );
}
