/**
 * CurriculumTree Component
 *
 * Left navigation panel showing the hierarchical structure of:
 * Topics → Nodes → Activities
 *
 * Handles expansion/collapse and selection state
 */

import { useState } from 'react';
import { ChevronRight, ChevronDown, Plus, Trash2, Copy, GripVertical } from 'lucide-react';
import type { Article, Topic, Node } from '@/lib/schemas/curriculum';
import { cn } from '@/lib/utils';
import { getActivityIcon } from '@/lib/constants/curriculum';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CurriculumTreeProps {
  curriculumId: string;
  topics: Topic[] | undefined;
  nodes: Node[] | undefined;
  activities: Article[] | undefined;
  selectedTopicId: string | null;
  selectedNodeId: string | null;
  selectedActivityId: string | null;
  expandedTopics: Set<string>;
  expandedNodes: Set<string>;
  onTopicSelect: (topicId: string) => void;
  onNodeSelect: (nodeId: string) => void;
  onActivitySelect: (activity: Article, nodeId: string, topicId: string) => void;
  onToggleTopic: (topicId: string) => void;
  onToggleNode: (nodeId: string) => void;
  onAddTopic: () => void;
  onAddNode: (topicId: string) => void;
  onAddActivity: (nodeId: string) => void;
  onDeleteTopic: (topicId: string) => void;
  onDeleteNode: (topicId: string, nodeId: string) => void;
  onDeleteActivity: (nodeId: string, activityId: string) => void;
  onDuplicateTopic: (topicId: string) => void;
}

// Draggable Activity Component
function DraggableActivity({
  activity,
  nodeId,
  isSelected,
  onSelect,
  onDelete,
}: {
  activity: Article;
  nodeId: string;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "ml-8 px-2 py-1.5 rounded text-sm flex items-center gap-2 transition-colors group",
        isSelected ? "bg-blue-600 text-white" : "hover:bg-gray-100"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-3 h-3" />
      </button>
      <button onClick={onSelect} className="flex items-center gap-2 flex-1 text-left">
        <span className="text-xs opacity-70">{getActivityIcon(activity.type)}</span>
        <span className="truncate text-xs">
          {activity.type
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')}
        </span>
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className={cn(
          "opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all",
          isSelected && "hover:bg-red-600"
        )}
        title="Delete Activity"
      >
        <Trash2
          className={cn(
            "w-3 h-3",
            isSelected ? "text-white hover:text-white" : "text-red-600"
          )}
        />
      </button>
    </div>
  );
}

// Droppable Node Component
function DroppableNode({
  node,
  isExpanded,
  onToggle,
  onAddActivity,
  onDeleteNode,
  children,
}: {
  node: Node;
  isExpanded: boolean;
  onToggle: () => void;
  onAddActivity: () => void;
  onDeleteNode: () => void;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: node.id,
    data: {
      type: 'node',
      node,
    },
  });

  return (
    <div className="ml-4 mt-1">
      <div ref={setNodeRef} className={cn("flex items-center gap-1 group", isOver && "bg-blue-50 rounded")}>
        <button
          onClick={onToggle}
          className="flex items-center gap-2 flex-1 px-2 py-1.5 hover:bg-gray-100 rounded text-sm transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
          )}
          <span className="truncate">{node.title?.en || `Node ${node.sequence_number}`}</span>
        </button>
        <button
          onClick={onAddActivity}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-blue-100 rounded transition-all"
          title="Add Activity"
        >
          <Plus className="w-3 h-3 text-blue-600" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteNode();
          }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
          title="Delete Node"
        >
          <Trash2 className="w-3 h-3 text-red-600" />
        </button>
      </div>
      {children}
    </div>
  );
}

export function CurriculumTree({
  curriculumId,
  topics,
  nodes,
  activities,
  selectedTopicId,
  selectedNodeId,
  selectedActivityId,
  expandedTopics,
  expandedNodes,
  onTopicSelect,
  onNodeSelect,
  onActivitySelect,
  onToggleTopic,
  onToggleNode,
  onAddTopic,
  onAddNode,
  onAddActivity,
  onDeleteTopic,
  onDeleteNode,
  onDeleteActivity,
  onDuplicateTopic,
}: CurriculumTreeProps) {
  // Confirmation modal state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'topic' | 'node' | 'activity';
    id: string;
    topicId?: string;
    nodeId?: string;
    title: string;
  } | null>(null);

  const handleConfirmDelete = () => {
    if (!deleteConfirm) return;

    switch (deleteConfirm.type) {
      case 'topic':
        onDeleteTopic(deleteConfirm.id);
        break;
      case 'node':
        if (deleteConfirm.topicId) {
          onDeleteNode(deleteConfirm.topicId, deleteConfirm.id);
        }
        break;
      case 'activity':
        if (deleteConfirm.nodeId) {
          onDeleteActivity(deleteConfirm.nodeId, deleteConfirm.id);
        }
        break;
    }

    setDeleteConfirm(null);
  };

  return (
    <aside className="w-[360px] border-r bg-gray-50 overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase">
            Structure
          </h2>
          <button
            onClick={onAddTopic}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            title="Add Topic"
          >
            <Plus className="w-3 h-3" />
            Topic
          </button>
        </div>

        {topics?.map(topic => {
          const isTopicExpanded = expandedTopics.has(topic.id);
          const topicNodes = nodes?.filter(n => n.topic_id === topic.id) || [];

          return (
            <div key={topic.id} className="mb-2">
              {/* Topic Header */}
              <div className="flex items-center gap-1 group">
                <button
                  onClick={() => {
                    onToggleTopic(topic.id);
                    onTopicSelect(topic.id);
                  }}
                  className="flex items-center gap-2 flex-1 px-2 py-1.5 hover:bg-gray-100 rounded text-sm font-medium transition-colors"
                >
                  {isTopicExpanded ? (
                    <ChevronDown className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span className="truncate">{topic.title?.en || 'Topic'}</span>
                </button>
                <button
                  onClick={() => onAddNode(topic.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-blue-100 rounded transition-all"
                  title="Add Node"
                >
                  <Plus className="w-3 h-3 text-blue-600" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicateTopic(topic.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-green-100 rounded transition-all"
                  title="Duplicate Topic"
                >
                  <Copy className="w-3 h-3 text-green-600" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirm({
                      type: 'topic',
                      id: topic.id,
                      title: topic.title?.en || 'Topic',
                    });
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                  title="Delete Topic"
                >
                  <Trash2 className="w-3 h-3 text-red-600" />
                </button>
              </div>

              {/* Nodes */}
              {isTopicExpanded &&
                topicNodes.map((node) => {
                  const isNodeExpanded = expandedNodes.has(node.id);
                  const nodeActivities = activities?.filter((a) => a.node_id === node.id) || [];

                  return (
                    <DroppableNode
                      key={node.id}
                      node={node}
                      isExpanded={isNodeExpanded}
                      onToggle={() => {
                        onToggleNode(node.id);
                        onNodeSelect(node.id);
                      }}
                      onAddActivity={() => onAddActivity(node.id)}
                      onDeleteNode={() => {
                        setDeleteConfirm({
                          type: 'node',
                          id: node.id,
                          topicId: topic.id,
                          title: node.title?.en || `Node ${node.sequence_number}`,
                        });
                      }}
                    >
                      {/* Activities */}
                      {isNodeExpanded && nodeActivities.length > 0 && (
                        <SortableContext
                          items={nodeActivities.map((a) => a.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {nodeActivities.map((activity) => (
                            <DraggableActivity
                              key={activity.id}
                              activity={activity}
                              nodeId={node.id}
                              isSelected={selectedActivityId === activity.id}
                              onSelect={() => onActivitySelect(activity, node.id, topic.id)}
                              onDelete={() => {
                                setDeleteConfirm({
                                  type: 'activity',
                                  id: activity.id,
                                  nodeId: node.id,
                                  title: activity.instruction.en || activity.type,
                                });
                              }}
                            />
                          ))}
                        </SortableContext>
                      )}

                      {/* Empty state for node with no activities */}
                      {isNodeExpanded && nodeActivities.length === 0 && (
                        <div className="ml-8 px-2 py-2 text-xs text-gray-400">
                          No activities yet
                        </div>
                      )}
                    </DroppableNode>
                  );
                })}
            </div>
          );
        })}

        {/* Empty state for curriculum */}
        {(!topics || topics.length === 0) && (
          <div className="text-center py-8">
            <p className="text-xs text-gray-400">No topics yet</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleConfirmDelete}
        title={`Delete ${deleteConfirm?.type || 'Item'}`}
        message={`Are you sure you want to delete "${deleteConfirm?.title}"? This action cannot be undone.`}
        confirmText="Delete"
      />
    </aside>
  );
}
