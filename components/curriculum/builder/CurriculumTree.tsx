/**
 * CurriculumTree Component
 *
 * Left navigation panel showing the hierarchical structure of:
 * Topics → Nodes → Activities
 *
 * Handles expansion/collapse and selection state
 */

import { ChevronRight, ChevronDown, Plus } from 'lucide-react';
import type { Article, Topic, Node } from '@/lib/schemas/curriculum';
import { cn } from '@/lib/utils';
import { getActivityIcon } from '@/lib/constants/curriculum';

interface CurriculumTreeProps {
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
}

export function CurriculumTree({
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
}: CurriculumTreeProps) {
  return (
    <aside className="w-[280px] border-r bg-gray-50 overflow-y-auto">
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
                    </div>

                    {/* Activities */}
                    {isNodeExpanded && nodeActivities.length > 0 && nodeActivities.map((activity) => (
                      <button
                        key={activity.id}
                        onClick={() => onActivitySelect(activity, node.id, topic.id)}
                        className={cn(
                          "ml-8 px-2 py-1.5 w-full text-left rounded text-sm flex items-center gap-2 transition-colors",
                          selectedActivityId === activity.id
                            ? "bg-blue-600 text-white"
                            : "hover:bg-gray-100"
                        )}
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
    </aside>
  );
}
