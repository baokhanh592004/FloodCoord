import React from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function TeamSearchBar({
  searchTerm,
  setSearchTerm,
  placeholder = 'Tìm tên đội, đội trưởng...',
}) {
  return (
    <div className="relative flex-1 max-w-sm">
      <MagnifyingGlassIcon className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-8 pr-8 py-1.5 border border-gray-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      {searchTerm && (
        <button
          onClick={() => setSearchTerm('')}
          className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
