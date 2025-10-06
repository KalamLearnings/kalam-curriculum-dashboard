'use client';

import { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Play, FileText } from 'lucide-react';
import type { Article } from '@/lib/schemas/curriculum';

interface ActivityNodeProps {
  activity: Article;
  nodeId: string;
  onClick: () => void;
}

export const ActivityNode = memo(({ activity, nodeId, onClick }: ActivityNodeProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: activity.id,
    data: {
      type: 'activity',
      activity,
      nodeId,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Simple icon mapping based on activity type
  const getActivityIcon = (type: string) => {
    if (type.toLowerCase().includes('video') || type.toLowerCase().includes('animation')) {
      return Play;
    }
    return FileText;
  };

  const Icon = getActivityIcon(activity.type);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-pink-200
        bg-gradient-to-r from-pink-50 to-pink-100
        hover:border-pink-300 hover:shadow-md cursor-pointer
        transition-all duration-200
      `}
      onClick={onClick}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-pink-600"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-4 h-4" />
      </button>

      <div className="w-7 h-7 rounded-lg bg-pink-500 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-white" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-gray-900 truncate">
          {activity.instruction.en}
        </div>
        <div className="text-xs text-gray-400">{activity.type}</div>
      </div>
    </div>
  );
});

ActivityNode.displayName = 'ActivityNode';
