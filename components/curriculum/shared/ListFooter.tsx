'use client';

import { Plus } from 'lucide-react';

interface ListFooterProps {
  show: boolean;
  label: string;
  onClick: () => void;
}

export function ListFooter({ show, label, onClick }: ListFooterProps) {
  if (!show) return null;

  return (
    <div className="border-t bg-white p-4">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        <Plus className="w-4 h-4" />
        {label}
      </button>
    </div>
  );
}
