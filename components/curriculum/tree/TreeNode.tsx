'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, ChevronRight, LucideIcon } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export type NodeType = 'curriculum' | 'topic' | 'node' | 'activity';

export interface TreeNodeData {
  id: string;
  type: NodeType;
  title: string;
  icon: LucideIcon;
  children?: TreeNodeData[];
  data?: any; // Original data object
}

interface TreeNodeProps {
  node: TreeNodeData;
  level: number;
  isExpanded: boolean;
  isSelected: boolean;
  isInHoverPath: boolean;
  isDragOver: boolean;
  onToggle: (nodeId: string) => void;
  onClick: (node: TreeNodeData) => void;
  onAdd?: (parentNode: TreeNodeData) => void;
  onEdit?: (node: TreeNodeData) => void;
  onDelete?: (node: TreeNodeData) => void;
  enableDragDrop?: boolean;
  canHaveChildren?: boolean;
}

// Color schemes based on node type
const colorSchemes = {
  curriculum: {
    bg: 'bg-purple-500',
    bgHover: 'hover:bg-purple-600',
    ring: 'ring-purple-300',
    ringHover: 'ring-purple-400',
    text: 'text-white',
    size: 'w-20 h-20',
    iconSize: 'w-10 h-10',
  },
  topic: {
    bg: 'bg-blue-500',
    bgHover: 'hover:bg-blue-600',
    ring: 'ring-blue-300',
    ringHover: 'ring-blue-400',
    text: 'text-white',
    size: 'w-16 h-16',
    iconSize: 'w-8 h-8',
  },
  node: {
    bg: 'bg-green-500',
    bgHover: 'hover:bg-green-600',
    ring: 'ring-green-300',
    ringHover: 'ring-green-400',
    text: 'text-white',
    size: 'w-12 h-12',
    iconSize: 'w-6 h-6',
  },
  activity: {
    bg: 'bg-amber-400',
    bgHover: 'hover:bg-amber-500',
    ring: 'ring-amber-300',
    ringHover: 'ring-amber-400',
    text: 'text-gray-900',
    size: 'w-9 h-9',
    iconSize: 'w-5 h-5',
  },
};

export function TreeNode({
  node,
  level,
  isExpanded,
  isSelected,
  isInHoverPath,
  isDragOver,
  onToggle,
  onClick,
  onAdd,
  onEdit,
  onDelete,
  enableDragDrop = false,
  canHaveChildren = true,
}: TreeNodeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const colors = colorSchemes[node.type];
  const hasChildren = node.children && node.children.length > 0;

  // Drag and drop setup (only for activities and nodes)
  const shouldEnableSortable = enableDragDrop && (node.type === 'activity' || node.type === 'node');
  const shouldEnableDroppable = enableDragDrop && node.type === 'node';

  const sortableProps = useSortable({
    id: node.id,
    disabled: !shouldEnableSortable,
    data: {
      type: node.type,
      [node.type]: node.data,
    },
  });

  const droppableProps = useDroppable({
    id: node.id,
    disabled: !shouldEnableDroppable,
    data: {
      type: node.type,
      [node.type]: node.data,
    },
  });

  const style = shouldEnableSortable
    ? {
        transform: CSS.Transform.toString(sortableProps.transform),
        transition: sortableProps.transition,
      }
    : undefined;

  // Determine ref to use
  const ref = shouldEnableSortable
    ? (element: HTMLDivElement | null) => {
        sortableProps.setNodeRef(element);
        if (shouldEnableDroppable) {
          droppableProps.setNodeRef(element);
        }
      }
    : shouldEnableDroppable
    ? droppableProps.setNodeRef
    : undefined;

  const isDragging = sortableProps?.isDragging || false;
  const isOver = droppableProps?.isOver || isDragOver;

  return (
    <motion.div
      ref={ref}
      style={style}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 20,
        delay: level * 0.05,
      }}
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Node Circle */}
      <motion.div
        onClick={() => onClick(node)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          relative cursor-pointer rounded-full shadow-lg transition-all
          ${colors.size} ${colors.bg} ${colors.bgHover}
          ${isSelected ? `ring-4 ${colors.ring} shadow-xl` : ''}
          ${isInHoverPath && !isSelected ? `ring-2 ring-gray-300` : ''}
          ${isOver ? `ring-4 ${colors.ringHover} bg-blue-100` : ''}
          ${isDragging ? 'opacity-50 rotate-2 scale-95' : ''}
          flex items-center justify-center
        `}
      >
        <node.icon className={`${colors.iconSize} ${colors.text}`} />

        {/* Expand/Collapse Button */}
        {canHaveChildren && hasChildren && (
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(node.id);
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`
              absolute -right-1 -bottom-1 w-6 h-6 rounded-full
              bg-white shadow-md border-2 border-gray-200
              flex items-center justify-center hover:bg-gray-50
              transition-transform
            `}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="w-3 h-3 text-gray-600" />
            </motion.div>
          </motion.button>
        )}

        {/* Floating Add Button */}
        {onAdd && (
          <AnimatePresence>
            {isHovered && (
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd(node);
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                whileHover={{ scale: 1.15 }}
                className={`
                  absolute -top-2 -right-2 w-7 h-7 rounded-full
                  shadow-lg flex items-center justify-center
                  ${colors.bg} ${colors.text}
                  border-2 border-white
                `}
              >
                <Plus className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
        )}
      </motion.div>

      {/* Label */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className={`
          absolute top-full left-1/2 -translate-x-1/2 mt-2
          text-center whitespace-nowrap max-w-[200px]
          ${node.type === 'curriculum' ? 'text-base font-bold' : 'text-sm font-medium'}
          ${node.type === 'activity' ? 'text-xs' : ''}
          text-gray-900
        `}
      >
        <div className="truncate">{node.title}</div>
      </motion.div>

      {/* Quick Actions (Edit/Delete) */}
      <AnimatePresence>
        {isHovered && (onEdit || onDelete) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-2"
          >
            {onEdit && (
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(node);
                }}
                whileHover={{ scale: 1.1 }}
                className="p-1.5 rounded-full bg-white shadow-md border border-gray-200 hover:bg-blue-50"
                title="Edit"
              >
                <Pencil className="w-3 h-3 text-blue-600" />
              </motion.button>
            )}
            {onDelete && (
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(node);
                }}
                whileHover={{ scale: 1.1 }}
                className="p-1.5 rounded-full bg-white shadow-md border border-gray-200 hover:bg-red-50"
                title="Delete"
              >
                <Trash2 className="w-3 h-3 text-red-600" />
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pulsing effect on drag over */}
      {isOver && (
        <motion.div
          className={`absolute inset-0 rounded-full ${colors.ringHover}`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.div>
  );
}
