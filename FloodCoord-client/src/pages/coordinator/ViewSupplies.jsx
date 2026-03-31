import React from 'react';
import SupplyManagementPage from '../../components/shared/supply/SupplyManagementPage';

export default function ViewSupplies() {
    return (
        <SupplyManagementPage
            variant="coordinator"
            title="Xem Vật Tư"
            subtitle="Xem thông tin về vật tư và tồn kho."
            readOnly
        />
    );
}
