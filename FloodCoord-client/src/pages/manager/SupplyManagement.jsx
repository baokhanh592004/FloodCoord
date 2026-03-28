import React from 'react';
import SupplyManagementPage from '../../components/shared/supply/SupplyManagementPage';

export default function SupplyManagement() {
    return (
        <SupplyManagementPage
            variant="manager"
            title="Quản lý Vật tư"
            subtitle="Quản lý tồn kho theo từng lô hàng cứu trợ."
        />
    );
}
