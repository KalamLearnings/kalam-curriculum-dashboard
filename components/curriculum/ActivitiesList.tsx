'use client';

import { useState } from 'react';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useActivities, useDeleteActivity } from '@/lib/hooks/useActivities';
import type { Article } from '@/lib/schemas/curriculum';
import { GripVertical, Play, FileText, Plus, Pencil, Trash2 } from 'lucide-react';

interface ActivitiesListProps {
  curriculumId: string;
  nodeId: string | null;
  onActivitySelect?: (activity: Article) => void;
  selectedActivityId?: string | null;
  onCreateClick?: () => void;
  onEditClick?: (activity: Article) => void;
}

export function ActivitiesList({
  curriculumId,
  nodeId,
  onActivitySelect,
  selectedActivityId,
  onCreateClick,
  onEditClick,
}: ActivitiesListProps) {
  const { data: activities, isLoading, error } = useActivities(curriculumId, nodeId);
  const { mutate: deleteActivity } = useDeleteActivity();


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-gray-500">Loading activities...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-red-500">Error: {error.message}</div>
      </div>
    );
  }

  if (!nodeId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-gray-500">Select a node to view activities</div>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-sm text-gray-500">No activities yet</div>
        </div>
        {onCreateClick && nodeId && (
          <div className="border-t bg-white p-4">
            <button
              onClick={onCreateClick}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              New Activity
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <SortableContext
        items={activities.map((a) => a.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex-1 overflow-y-auto">
          {activities.map((activity) => (
            <SortableActivity
              key={activity.id}
              activity={activity}
              isSelected={selectedActivityId === activity.id}
              onClick={() => onActivitySelect?.(activity)}
              onEdit={onEditClick ? () => onEditClick(activity) : undefined}
              onDelete={() => {
                if (confirm('Delete this activity?')) {
                  deleteActivity({ curriculumId, nodeId: nodeId!, activityId: activity.id });
                }
              }}
            />
          ))}
        </div>
      </SortableContext>

      {onCreateClick && nodeId && (
        <div className="border-t bg-white p-4">
          <button
            onClick={onCreateClick}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            New Activity
          </button>
        </div>
      )}
    </div>
  );
}

interface SortableActivityProps {
  activity: Article;
  isSelected: boolean;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function SortableActivity({ activity, isSelected, onClick, onEdit, onDelete }: SortableActivityProps) {
  const [showActions, setShowActions] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: activity.id,
    data: {
      type: 'activity',
      activity,
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
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className={`
        group flex items-center gap-3 px-4 py-3 border-b cursor-pointer
        hover:bg-gray-50 transition-colors min-h-[60px]
        ${isSelected ? 'bg-blue-50 border-blue-200' : 'bg-white'}
      `}
      onClick={onClick}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-5 h-5" />
      </button>

      <Icon className="w-5 h-5 text-gray-500 flex-shrink-0" />

      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-gray-900 truncate">
          {activity.instruction.en}
        </div>
        <div className="text-xs text-gray-400 mt-0.5">{activity.type}</div>
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
                title="Edit activity"
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
                title="Delete activity"
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
