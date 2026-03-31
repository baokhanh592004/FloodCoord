import React from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

const VARIANT_STYLE = {
  manager: {
    ring: 'focus:ring-blue-500 focus:border-blue-500',
    activeTab: 'bg-white text-blue-700 shadow-sm',
  },
  coordinator: {
    ring: 'focus:ring-teal-500 focus:border-teal-500',
    activeTab: 'bg-white text-teal-700 shadow-sm',
  },
};

export default function SearchAndFilterBar({
  variant = 'manager',
  theme,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  onClearSearch,
  tabs = [],
  activeTab,
  onTabChange,
  containerClass = 'shrink-0 flex flex-col sm:flex-row gap-2 items-start sm:items-center',
  searchWrapperClass = 'relative flex-1 max-w-sm',
  hideSearch = false,
}) {
  const isAdmin = variant === 'admin';
  const stylePreset = VARIANT_STYLE[variant] || VARIANT_STYLE.manager;

  return (
    <div className={containerClass}>
      {!hideSearch && (
        <div className={searchWrapperClass}>
          <MagnifyingGlassIcon
            className={isAdmin
              ? 'absolute left-2.5 top-2 h-3.5 w-3.5'
              : 'absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400'}
            style={isAdmin ? { color: theme?.textFaint } : undefined}
          />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className={isAdmin
              ? 'w-full px-3 py-1.5 border rounded-md text-xs outline-none transition-all focus:ring-2 pl-8 pr-8 focus:ring-admin/25 focus:border-admin'
              : `w-full pl-8 pr-8 py-1.5 border border-gray-200 rounded-md text-xs focus:ring-2 ${stylePreset.ring}`}
            style={isAdmin ? { borderColor: theme?.border } : undefined}
          />
          {searchValue && (
            <button
              onClick={onClearSearch}
              className={isAdmin ? 'absolute right-2.5 top-2' : 'absolute right-2.5 top-2 text-gray-400 hover:text-gray-600'}
              style={isAdmin ? { color: theme?.textFaint } : undefined}
            >
              <XMarkIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {tabs.length > 0 && (
        <div
          className={isAdmin ? 'flex gap-0.5 p-0.5 rounded-lg flex-wrap' : 'flex gap-0.5 bg-gray-100 p-0.5 rounded-lg flex-wrap'}
          style={isAdmin ? { background: '#f4f6fa' } : undefined}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={isAdmin
                ? 'px-2.5 py-1 text-xs font-medium rounded-md transition-colors'
                : `px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeTab === tab.key
                    ? stylePreset.activeTab
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              style={isAdmin ? {
                background: activeTab === tab.key ? '#fff' : 'transparent',
                color: activeTab === tab.key ? theme?.primary : theme?.textMuted,
                boxShadow: activeTab === tab.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              } : undefined}
            >
              {tab.label}
              <span className={isAdmin ? 'ml-1' : 'ml-1 text-gray-400'} style={isAdmin ? { color: theme?.textFaint } : undefined}>
                ({tab.count ?? 0})
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
