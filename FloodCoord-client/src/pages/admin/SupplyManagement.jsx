import React from 'react';
import SupplyManagementPage from '../../components/shared/supply/SupplyManagementPage';

// ── Admin color palette ──────────────────────────────────────────────────────
const C = {
    primary: '#1c1c18',
    primaryHover: '#3a3a32',
    primarySoft: '#f5f4ef',
    accent: '#e85d26',
    success: '#16a34a',
    successHover: '#15803d',
    border: '#e2e8f0',
    textMain: '#0d2240',
    textMuted: '#64748b',
    textFaint: '#9ab8d4',
}

export default function SupplyManagement() {
    return (
        <SupplyManagementPage
            variant="admin"
            title="Quản lý Vật tư"
            subtitle="Quản lý tồn kho theo từng lô hàng cứu trợ."
            adminTheme={C}
        />
    );
}
