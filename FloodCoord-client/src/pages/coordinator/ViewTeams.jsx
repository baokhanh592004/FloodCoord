import React from 'react';
import { Shield } from 'lucide-react';
import TeamManagementPage from '../../components/shared/team/TeamManagementPage';

export default function ViewTeams() {
    return (
        <TeamManagementPage
            variant="coordinator"
            title="Xem Đội Cứu Hộ"
            subtitle="Xem thông tin về các đội cứu hộ."
            showSearch
            emptyIcon={<Shield size={40} className="mx-auto text-gray-300 mb-3" />}
            emptyTitle="Chưa có đội cứu hộ nào"
            emptyDescription="Hãy thiết lập các đội phản ứng nhanh để bắt đầu công tác cứu trợ."
            readOnly
        />
    );
}
