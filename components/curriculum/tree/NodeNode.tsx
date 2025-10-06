'use client';

import { memo, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { FileText, CheckCircle, Info, Plus, Edit2, Trash2, ChevronDown } from 'lucide-react';
import type { Node as CurriculumNode, Article } from '@/lib/schemas/curriculum';
import { ActivityNode } from './ActivityNode';
import { useActivities } from '@/lib/hooks/useActivities';

interface NodeNodeProps {
  node: CurriculumNode;
  curriculumId: string;
  onEdit: () => void;
  onDelete: () => void;
  onAddActivity: () => void;
  onEditActivity: (activity: Article) => void;
}

const typeConfig = {
  lesson: {
    icon: FileText,
    iconBg: 'bg-emerald-500',
    buttonBg: 'bg-emerald-500 hover:bg-emerald-600',
    textColor: 'text-emerald-700',
    bgColor: 'bg-emerald-50 hover:bg-emerald-100',
    bg: 'from-emerald-50 to-emerald-100',
    border: 'border-emerald-300',
    borderActive: 'border-emerald-400'
  },
  assessment: {
    icon: CheckCircle,
    iconBg: 'bg-blue-500',
    buttonBg: 'bg-blue-500 hover:bg-blue-600',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50 hover:bg-blue-100',
    bg: 'from-blue-50 to-blue-100',
    border: 'border-blue-300',
    borderActive: 'border-blue-400'
  },
  intro: {
    icon: Info,
    iconBg: 'bg-purple-500',
    buttonBg: 'bg-purple-500 hover:bg-purple-600',
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-50 hover:bg-purple-100',
    bg: 'from-purple-50 to-purple-100',
    border: 'border-purple-300',
    borderActive: 'border-purple-400'
  },
};

export const NodeNode = memo(({
  node,
  curriculumId,
  onEdit,
  onDelete,
  onAddActivity,
  onEditActivity,
}: NodeNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  // Only fetch activities when expanded (lazy loading)
  const { data: activities } = useActivities(curriculumId, isExpanded ? node.id : null);
  const config = typeConfig[node.type] || typeConfig.lesson;
  const Icon = config.icon;

  // Make this node a drop target for activities
  const { setNodeRef, isOver } = useDroppable({
    id: node.id,
    data: {
      type: 'node',
      node,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        mb-3 rounded-xl border-2 transition-all duration-300 relative
        ${isOver ? 'ring-4 ring-blue-300 ring-opacity-50 scale-[1.02]' : ''}
        ${isExpanded
          ? `bg-white shadow-lg ${config.borderActive} hover:shadow-xl`
          : `bg-gradient-to-br ${config.bg} ${config.border} shadow-md hover:shadow-lg`
        }
      `}
    >
      {/* Expand/Collapse Button - positioned outside */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`absolute -left-3 top-3 w-6 h-6 rounded-full z-10
                   ${config.buttonBg} text-white flex items-center justify-center
                   transition-all shadow-md hover:scale-110`}
      >
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            isExpanded ? '' : '-rotate-90'
          }`}
        />
      </button>

      {/* Node Header */}
      <div className="group rounded-t-xl">
        <div className="p-3">

        <div className="flex items-start gap-2.5 ml-4">
          <div className={`w-9 h-9 rounded-lg ${config.iconBg} flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-5 h-5 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 truncate text-sm">
              {node.title.en}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-gray-400 capitalize">{node.type}</span>
              {activities && activities.length > 0 && (
                <span className="text-xs text-gray-500">
                  • {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1 mt-2.5 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={onAddActivity}
            className={`flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5
                       text-xs font-medium ${config.textColor} ${config.bgColor} rounded-lg
                       transition-colors`}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Activity
          </button>
          <button onClick={onEdit} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={onDelete} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
        </div>
      </div>

      {/* Activities List (sortable) */}
      <div
        className={`
          transition-all duration-300 ease-in-out rounded-b-xl
          ${isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        {activities && activities.length > 0 && (
          <div className="border-t bg-gray-50 p-3 rounded-b-xl overflow-hidden">
            <SortableContext items={activities.map(a => a.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {activities.map((activity) => (
                  <ActivityNode
                    key={activity.id}
                    activity={activity}
                    nodeId={node.id}
                    onClick={() => onEditActivity(activity)}
                  />
                ))}
              </div>
            </SortableContext>
          </div>
        )}
      </div>
    </div>
  );
});

NodeNode.displayName = 'NodeNode';
