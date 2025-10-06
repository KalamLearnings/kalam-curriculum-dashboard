'use client';

import { useState, ReactNode } from 'react';
import { Pencil, Trash2, LucideIcon } from 'lucide-react';

interface ListItemProps {
  id: string;
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  isSelected?: boolean;
  isDragOver?: boolean;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  leftAction?: ReactNode;
}

export function ListItem({
  icon: Icon,
  title,
  subtitle,
  isSelected = false,
  isDragOver = false,
  onClick,
  onEdit,
  onDelete,
  leftAction,
}: ListItemProps) {
  const [showActions, setShowActions] = useState(false);

  const bgColor = isDragOver
    ? 'bg-blue-100'
    : isSelected
    ? 'bg-blue-50'
    : 'bg-white';

  return (
    <div
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={onClick}
      className={`
        group flex items-center gap-3 px-4 py-3 border-b cursor-pointer
        hover:bg-gray-50 transition-colors relative min-h-[60px]
        ${bgColor} ${isSelected || isDragOver ? 'border-blue-200' : ''}
      `}
    >
      {leftAction}

      <Icon className="w-5 h-5 text-gray-500 flex-shrink-0" />

      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-gray-900 truncate">{title}</div>
        {subtitle && <div className="text-xs text-gray-500 truncate mt-1">{subtitle}</div>}
      </div>

      <div className="flex items-center gap-2">
        {showActions && (
          <>
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                title="Edit"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
