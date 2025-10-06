'use client';

import { useMemo, useState, useCallback } from 'react';
import { Tree, NodeRendererProps } from 'react-arborist';
import { useTopics } from '@/lib/hooks/useTopics';
import { useNodes } from '@/lib/hooks/useNodes';
import { useActivities, useUpdateActivity } from '@/lib/hooks/useActivities';
import { TopicFormModal } from '../TopicFormModal';
import { NodeFormModal } from '../NodeFormModal';
import { ActivityFormModal } from '../ActivityFormModal';
import { TopicNodesFetcher } from '../flow/TopicNodesFetcher';
import { NodeActivitiesFetcher } from '../flow/NodeActivitiesFetcher';
import type { Topic, Node as CurriculumNodeType, Article } from '@/lib/schemas/curriculum';
import { BookOpen, FileCheck, FileText, Play, Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface CurriculumArboristProps {
  curriculumId: string;
  curriculumTitle: string;
}

type TreeNodeType = 'curriculum' | 'topic' | 'node' | 'activity';

interface TreeNode {
  id: string;
  name: string;
  type: TreeNodeType;
  children?: TreeNode[];
  data?: any;
}

function getActivityIcon(type: string) {
  if (type.toLowerCase().includes('video') || type.toLowerCase().includes('animation')) {
    return Play;
  }
  return FileText;
}

function NodeRenderer({ node, style, dragHandle }: NodeRendererProps<TreeNode>) {
  const [isHovered, setIsHovered] = useState(false);

  const getNodeColor = () => {
    switch (node.data.type) {
      case 'curriculum': return 'bg-purple-500 text-white';
      case 'topic': return 'bg-blue-500 text-white';
      case 'node': return 'bg-green-500 text-white';
      case 'activity': return 'bg-amber-400 text-gray-900';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getIcon = () => {
    switch (node.data.type) {
      case 'curriculum': return BookOpen;
      case 'topic': return BookOpen;
      case 'node': return FileCheck;
      case 'activity': return node.data.data ? getActivityIcon(node.data.data.type) : FileText;
      default: return FileText;
    }
  };

  const Icon = getIcon();
  const colorClass = getNodeColor();

  return (
    <div
      style={style}
      className={`flex items-center gap-2 px-3 py-2 mx-1 my-0.5 rounded-lg transition-all ${
        node.isSelected ? 'ring-2 ring-blue-400' : ''
      } ${isHovered ? 'shadow-sm' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Drag handle */}
      <div ref={dragHandle} className="cursor-grab active:cursor-grabbing flex-shrink-0">
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>

      {/* Expand/collapse arrow */}
      {node.data.type !== 'activity' && (
        <button
          onClick={() => node.toggle()}
          className="p-1 hover:bg-gray-100 rounded flex-shrink-0"
        >
          <svg
            className={`w-4 h-4 transition-transform ${node.isOpen ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Node icon and label */}
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${colorClass} flex-1`}>
        <Icon className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm font-medium whitespace-nowrap">{node.data.name}</span>
      </div>

      {/* Action buttons on hover */}
      {isHovered && (
        <div className="flex gap-1 flex-shrink-0 ml-2">
          {node.data.type !== 'activity' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Handle add child
              }}
              className="p-1.5 rounded-full bg-white shadow-md border border-gray-200 hover:bg-blue-50"
              title="Add"
            >
              <Plus className="w-3 h-3 text-blue-600" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Handle edit
            }}
            className="p-1.5 rounded-full bg-white shadow-md border border-gray-200 hover:bg-blue-50"
            title="Edit"
          >
            <Pencil className="w-3 h-3 text-blue-600" />
          </button>
          {node.data.type !== 'curriculum' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Handle delete
              }}
              className="p-1.5 rounded-full bg-white shadow-md border border-gray-200 hover:bg-red-50"
              title="Delete"
            >
              <Trash2 className="w-3 h-3 text-red-600" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function CurriculumArborist({ curriculumId, curriculumTitle }: CurriculumArboristProps) {
  const queryClient = useQueryClient();
  const { data: topics } = useTopics(curriculumId);
  const { mutate: updateActivity } = useUpdateActivity();

  // Track which topics and nodes are expanded
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Store fetched data
  const [topicNodesMap, setTopicNodesMap] = useState<Map<string, CurriculumNodeType[]>>(new Map());
  const [nodeActivitiesMap, setNodeActivitiesMap] = useState<Map<string, Article[]>>(new Map());

  // Modal states
  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [nodeModalOpen, setNodeModalOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<CurriculumNodeType | null>(null);
  const [selectedTopicForNode, setSelectedTopicForNode] = useState<string | null>(null);
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Article | null>(null);
  const [selectedNodeForActivity, setSelectedNodeForActivity] = useState<string | null>(null);

  // Callbacks for data fetchers
  const handleTopicNodesLoaded = useCallback((topicId: string, nodes: CurriculumNodeType[]) => {
    setTopicNodesMap(prev => new Map(prev).set(topicId, nodes));
  }, []);

  const handleNodeActivitiesLoaded = useCallback((nodeId: string, activities: Article[]) => {
    setNodeActivitiesMap(prev => new Map(prev).set(nodeId, activities));
  }, []);

  // Build tree data structure
  const treeData: TreeNode[] = useMemo(() => {
    const buildTree = (): TreeNode[] => {
      return [
        {
          id: curriculumId,
          name: curriculumTitle,
          type: 'curriculum',
          data: { type: 'curriculum' },
          children: topics?.map((topic) => {
            const topicNodes = topicNodesMap.get(topic.id);
            return {
              id: topic.id,
              name: topic.title.en,
              type: 'topic' as TreeNodeType,
              data: { type: 'topic', data: topic },
              children: topicNodes?.map((node) => {
                const nodeActivities = nodeActivitiesMap.get(node.id);
                return {
                  id: node.id,
                  name: node.title.en,
                  type: 'node' as TreeNodeType,
                  data: { type: 'node', data: node },
                  children: nodeActivities?.map((activity) => ({
                    id: activity.id,
                    name: activity.instruction.en,
                    type: 'activity' as TreeNodeType,
                    data: { type: 'activity', data: activity },
                  })) || [],
                };
              }) || [],
            };
          }) || [],
        },
      ];
    };

    return buildTree();
  }, [curriculumId, curriculumTitle, topics, topicNodesMap, nodeActivitiesMap]);

  const handleMove = useCallback((args: { dragIds: string[]; parentId: string | null; index: number }) => {
    console.log('Move:', args);
    // TODO: Implement actual move logic
    toast.info('Drag and drop coming soon!');
  }, []);

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Data fetchers for expanded topics */}
      {Array.from(expandedTopics).map(topicId => (
        <TopicNodesFetcher
          key={`topic-${topicId}`}
          curriculumId={curriculumId}
          topicId={topicId}
          onDataLoaded={handleTopicNodesLoaded}
        />
      ))}

      {/* Data fetchers for expanded nodes */}
      {Array.from(expandedNodes).map(nodeId => (
        <NodeActivitiesFetcher
          key={`node-${nodeId}`}
          curriculumId={curriculumId}
          nodeId={nodeId}
          onDataLoaded={handleNodeActivitiesLoaded}
        />
      ))}

      <div className="h-full bg-white pl-16 pr-6 py-6">
        <Tree
          data={treeData}
          onMove={handleMove}
          height="100%"
          onToggle={(id) => {
            // Check if it's a topic
            const isTopic = topics?.some(t => t.id === id);
            if (isTopic) {
              setExpandedTopics(prev => {
                const next = new Set(prev);
                if (next.has(id)) {
                  next.delete(id);
                } else {
                  next.add(id);
                }
                return next;
              });
              return;
            }

            // Check if it's a node by looking through all topic nodes
            for (const [topicId, nodes] of topicNodesMap) {
              if (nodes.some(n => n.id === id)) {
                setExpandedNodes(prev => {
                  const next = new Set(prev);
                  if (next.has(id)) {
                    next.delete(id);
                  } else {
                    next.add(id);
                  }
                  return next;
                });
                return;
              }
            }
          }}
          openByDefault={false}
          indent={24}
          rowHeight={56}
          overscanCount={1}
          paddingTop={20}
          paddingBottom={20}
          paddingLeft={0}
          paddingRight={0}
        >
          {NodeRenderer}
        </Tree>
      </div>

      {/* Modals */}
      <TopicFormModal
        isOpen={topicModalOpen}
        onClose={() => {
          setTopicModalOpen(false);
          setEditingTopic(null);
        }}
        curriculumId={curriculumId}
        topic={editingTopic}
      />

      {selectedTopicForNode && (
        <NodeFormModal
          isOpen={nodeModalOpen}
          onClose={() => {
            setNodeModalOpen(false);
            setEditingNode(null);
            setSelectedTopicForNode(null);
          }}
          curriculumId={curriculumId}
          topicId={selectedTopicForNode}
          node={editingNode}
        />
      )}

      {selectedNodeForActivity && (
        <ActivityFormModal
          isOpen={activityModalOpen}
          onClose={() => {
            setActivityModalOpen(false);
            setEditingActivity(null);
            setSelectedNodeForActivity(null);
          }}
          curriculumId={curriculumId}
          nodeId={selectedNodeForActivity}
          activity={editingActivity}
        />
      )}
    </div>
  );
}
