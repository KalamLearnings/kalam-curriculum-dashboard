/**
 * AssetSearchBar Component
 *
 * Search input for filtering assets by name or tags.
 * Includes debouncing for performance.
 */

'use client';

import React, { useState, useEffect } from 'react';

interface AssetSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export function AssetSearchBar({
  value,
  onChange,
  placeholder = 'Search assets by name or tag...',
  debounceMs = 300,
}: AssetSearchBarProps) {
  const [localValue, setLocalValue] = useState(value);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, onChange, debounceMs]);

  // Sync with external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        🔍
      </div>
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="
          w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        "
      />
      {localValue && (
        <button
          onClick={handleClear}
          className="
            absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600
            w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-100
          "
          title="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}
