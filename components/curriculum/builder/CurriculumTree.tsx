/**
 * CurriculumTree Component
 *
 * Left navigation panel showing the hierarchical structure of:
 * Topics → Nodes → Activities
 *
 * Handles expansion/collapse and selection state
 */

import { useState } from 'react';
import { ChevronRight, ChevronDown, Plus, Trash2 } from 'lucide-react';
import type { Article, Topic, Node } from '@/lib/schemas/curriculum';
import { cn } from '@/lib/utils';
import { getActivityIcon } from '@/lib/constants/curriculum';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

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
              {isTopicExpanded && topicNodes.map(node => {
                const isNodeExpanded = expandedNodes.has(node.id);
                const nodeActivities = activities?.filter(a => a.node_id === node.id) || [];

                return (
                  <div key={node.id} className="ml-4 mt-1">
                    <div className="flex items-center gap-1 group">
                      <button
                        onClick={() => {
                          onToggleNode(node.id);
                          onNodeSelect(node.id);
                        }}
                        className="flex items-center gap-2 flex-1 px-2 py-1.5 hover:bg-gray-100 rounded text-sm transition-colors"
                      >
                        {isNodeExpanded ? (
                          <ChevronDown className="w-4 h-4 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 flex-shrink-0" />
                        )}
                        <span className="truncate">{node.title?.en || `Node ${node.sequence_number}`}</span>
                      </button>
                      <button
                        onClick={() => onAddActivity(node.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-blue-100 rounded transition-all"
                        title="Add Activity"
                      >
                        <Plus className="w-3 h-3 text-blue-600" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm({
                            type: 'node',
                            id: node.id,
                            topicId: topic.id,
                            title: node.title?.en || `Node ${node.sequence_number}`,
                          });
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                        title="Delete Node"
                      >
                        <Trash2 className="w-3 h-3 text-red-600" />
                      </button>
                    </div>

                    {/* Activities */}
                    {isNodeExpanded && nodeActivities.length > 0 && nodeActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className={cn(
                          "ml-8 px-2 py-1.5 rounded text-sm flex items-center gap-2 transition-colors group",
                          selectedActivityId === activity.id
                            ? "bg-blue-600 text-white"
                            : "hover:bg-gray-100"
                        )}
                      >
                        <button
                          onClick={() => onActivitySelect(activity, node.id, topic.id)}
                          className="flex items-center gap-2 flex-1 text-left"
                        >
                          <span className="text-xs opacity-70">
                            {getActivityIcon(activity.type)}
                          </span>
                          <span className="truncate text-xs">
                            {activity.type.split('_').map(word =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                          </span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirm({
                              type: 'activity',
                              id: activity.id,
                              nodeId: node.id,
                              title: activity.instruction.en || activity.type,
                            });
                          }}
                          className={cn(
                            "opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all",
                            selectedActivityId === activity.id && "hover:bg-red-600"
                          )}
                          title="Delete Activity"
                        >
                          <Trash2 className={cn(
                            "w-3 h-3",
                            selectedActivityId === activity.id ? "text-white hover:text-white" : "text-red-600"
                          )} />
                        </button>
                      </div>
                    ))}

                    {/* Empty state for node with no activities */}
                    {isNodeExpanded && nodeActivities.length === 0 && (
                      <div className="ml-8 px-2 py-2 text-xs text-gray-400">
                        No activities yet
                      </div>
                    )}
                  </div>
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
