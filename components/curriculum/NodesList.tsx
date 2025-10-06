'use client';

import { useState, useEffect } from 'react';
import {
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useNodes, useReorderNodes, useDeleteNode } from '@/lib/hooks/useNodes';
import { reorderItems, getChangedItems } from '@/lib/utils/reorder';
import type { Node } from '@/lib/schemas/curriculum';
import { GripVertical, BookOpen, FileCheck, Info } from 'lucide-react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { EmptyState } from './shared/EmptyState';
import { ListFooter } from './shared/ListFooter';
import { ListItem } from './shared/ListItem';

interface NodesListProps {
  curriculumId: string;
  topicId: string | null;
  onNodeSelect?: (node: Node) => void;
  onReorderChange?: (hasChanges: boolean) => void;
  selectedNodeId?: string | null;
  onCreateClick?: () => void;
  onEditClick?: (node: Node) => void;
}

export function NodesList({
  curriculumId,
  topicId,
  onNodeSelect,
  onReorderChange,
  selectedNodeId,
  onCreateClick,
  onEditClick,
}: NodesListProps) {
  const { data: nodes, isLoading, error } = useNodes(curriculumId, topicId);
  const { mutate: reorder } = useReorderNodes(curriculumId, topicId!);
  const { mutate: deleteNode } = useDeleteNode();

  const [nodeToDelete, setNodeToDelete] = useState<Node | null>(null);

  if (isLoading) {
    return <EmptyState message="Loading nodes..." />;
  }

  if (error) {
    return <EmptyState message={`Error: ${error.message}`} />;
  }

  if (!topicId) {
    return <EmptyState message="Select a topic to view lessons" />;
  }

  const hasNodes = nodes && nodes.length > 0;

  if (!hasNodes) {
    return (
      <EmptyState
        message="No lessons yet"
        actionLabel={onCreateClick ? 'New Node' : undefined}
        onAction={onCreateClick}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      <SortableContext items={nodes.map((n) => n.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 overflow-y-auto">
          {nodes.map((node) => (
            <SortableNode
              key={node.id}
              node={node}
              isSelected={selectedNodeId === node.id}
              onClick={() => onNodeSelect?.(node)}
              onEdit={onEditClick ? () => onEditClick(node) : undefined}
              onDelete={() => setNodeToDelete(node)}
            />
          ))}
        </div>
      </SortableContext>

      <ListFooter show={hasNodes && !!onCreateClick} label="New Node" onClick={onCreateClick!} />

      <ConfirmModal
        isOpen={!!nodeToDelete}
        onClose={() => setNodeToDelete(null)}
        onConfirm={() => {
          if (nodeToDelete && topicId) {
            deleteNode({ curriculumId, topicId, nodeId: nodeToDelete.id });
          }
        }}
        title="Delete Lesson?"
        message={`Are you sure you want to delete "${nodeToDelete?.title.en}"?`}
        warningDetails={['All activities inside this lesson', 'Student progress for this lesson']}
      />
    </div>
  );
}

interface SortableNodeProps {
  node: Node;
  isSelected: boolean;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function SortableNode({ node, isSelected, onClick, onEdit, onDelete }: SortableNodeProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: node.id,
    data: {
      type: 'node',
      node,
    },
  });

  const { isOver, setNodeRef: setDroppableRef } = useDroppable({
    id: node.id,
    data: {
      type: 'node',
      node,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const typeIcons = {
    lesson: BookOpen,
    assessment: FileCheck,
    intro: Info,
  };

  const Icon = typeIcons[node.type] || BookOpen;

  const dragHandle = (
    <button
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
      onClick={(e) => e.stopPropagation()}
    >
      <GripVertical className="w-5 h-5" />
    </button>
  );

  // Combine refs for both sortable and droppable
  const setRefs = (element: HTMLDivElement | null) => {
    setNodeRef(element);
    setDroppableRef(element);
  };

  return (
    <div
      ref={setRefs}
      style={style}
      className={`${isOver ? 'ring-2 ring-blue-500 ring-inset' : ''}`}
    >
      <ListItem
        id={node.id}
        icon={Icon}
        title={node.title.en}
        isSelected={isSelected}
        isDragOver={isOver}
        onClick={onClick}
        onEdit={onEdit}
        onDelete={onDelete}
        leftAction={dragHandle}
      />
    </div>
  );
}
