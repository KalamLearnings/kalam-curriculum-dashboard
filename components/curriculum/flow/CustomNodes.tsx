'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { LucideIcon, Plus, Pencil, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

// Node data types
export interface BaseNodeData {
  label: string;
  icon: LucideIcon;
  data?: any;
  onAdd?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

// Color schemes
const colorSchemes = {
  curriculum: {
    bg: 'bg-purple-500',
    bgHover: 'hover:bg-purple-600',
    text: 'text-white',
    size: 'w-20 h-20',
    iconSize: 'w-10 h-10',
  },
  topic: {
    bg: 'bg-blue-500',
    bgHover: 'hover:bg-blue-600',
    text: 'text-white',
    size: 'w-16 h-16',
    iconSize: 'w-8 h-8',
  },
  node: {
    bg: 'bg-green-500',
    bgHover: 'hover:bg-green-600',
    text: 'text-white',
    size: 'w-12 h-12',
    iconSize: 'w-6 h-6',
  },
  activity: {
    bg: 'bg-amber-400',
    bgHover: 'hover:bg-amber-500',
    text: 'text-gray-900',
    size: 'w-10 h-10',
    iconSize: 'w-5 h-5',
  },
};

interface CustomNodeProps {
  type: keyof typeof colorSchemes;
}

function createCustomNode(nodeType: keyof typeof colorSchemes) {
  return memo(({ data, selected }: NodeProps<BaseNodeData>) => {
    const colors = colorSchemes[nodeType];
    const Icon = data.icon;

    return (
      <div className="relative group">
        {/* Input handle (except for curriculum which is root) */}
        {nodeType !== 'curriculum' && (
          <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-gray-400" />
        )}

        {/* Node circle */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`
            relative rounded-full shadow-lg transition-all cursor-pointer
            ${colors.size} ${colors.bg} ${colors.bgHover}
            ${selected ? 'ring-4 ring-blue-300 shadow-xl' : ''}
            flex items-center justify-center
          `}
        >
          <Icon className={`${colors.iconSize} ${colors.text}`} />

          {/* Floating add button on hover */}
          {data.onAdd && (
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                data.onAdd?.();
              }}
              initial={{ opacity: 0, scale: 0 }}
              whileHover={{ scale: 1.15 }}
              className={`
                absolute -top-2 -right-2 w-6 h-6 rounded-full
                shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100
                ${colors.bg} ${colors.text} border-2 border-white
                transition-opacity
              `}
            >
              <Plus className="w-3 h-3" />
            </motion.button>
          )}
        </motion.div>

        {/* Label */}
        <div
          className={`
            absolute top-full left-1/2 -translate-x-1/2 mt-2
            text-center whitespace-nowrap max-w-[200px]
            ${nodeType === 'curriculum' ? 'text-base font-bold' : 'text-sm font-medium'}
            ${nodeType === 'activity' ? 'text-xs' : ''}
            text-gray-900
          `}
        >
          <div className="truncate">{data.label}</div>
        </div>

        {/* Quick actions (Edit/Delete) on hover */}
        {(data.onEdit || data.onDelete) && (
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {data.onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  data.onEdit?.();
                }}
                className="p-1.5 rounded-full bg-white shadow-md border border-gray-200 hover:bg-blue-50"
                title="Edit"
              >
                <Pencil className="w-3 h-3 text-blue-600" />
              </button>
            )}
            {data.onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  data.onDelete?.();
                }}
                className="p-1.5 rounded-full bg-white shadow-md border border-gray-200 hover:bg-red-50"
                title="Delete"
              >
                <Trash2 className="w-3 h-3 text-red-600" />
              </button>
            )}
          </div>
        )}

        {/* Output handle (except for activities which are leaves) */}
        {nodeType !== 'activity' && (
          <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-gray-400" />
        )}
      </div>
    );
  });
}

// Export custom node components
export const CurriculumNode = createCustomNode('curriculum');
CurriculumNode.displayName = 'CurriculumNode';

export const TopicNode = createCustomNode('topic');
TopicNode.displayName = 'TopicNode';

export const LessonNode = createCustomNode('node');
LessonNode.displayName = 'LessonNode';

export const ActivityNode = createCustomNode('activity');
ActivityNode.displayName = 'ActivityNode';
