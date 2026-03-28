import React from 'react';
import SearchAndFilterBar from '../filters/SearchAndFilterBar';

const FILTER_OPTIONS = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'FOOD_WATER', label: 'Đồ ăn & Nước' },
  { value: 'MEDICAL', label: 'Y tế' },
  { value: 'EQUIPMENT', label: 'Thiết bị' },
  { value: 'OTHER', label: 'Khác' },
];

export default function SupplyFilterBar({
  variant,
  supplies,
  filterType,
  setFilterType,
  searchTerm,
  setSearchTerm,
  theme,
}) {
  const tabs = FILTER_OPTIONS.map(({ value, label }) => ({
    key: value,
    label,
    count: value === 'ALL' ? supplies.length : supplies.filter((s) => s.type === value).length,
  }));

  return (
    <SearchAndFilterBar
      variant={variant}
      theme={theme}
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Tìm tên vật tư, ghi chú..."
      onClearSearch={() => setSearchTerm('')}
      tabs={tabs}
      activeTab={filterType}
      onTabChange={setFilterType}
    />
  );
}
