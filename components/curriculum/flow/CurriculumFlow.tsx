'use client';

import { useMemo, useState, useCallback } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  ConnectionMode,
  NodeMouseHandler,
  NodeDragHandler,
  OnNodesChange,
  applyNodeChanges,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CurriculumNode, TopicNode, LessonNode, ActivityNode } from './CustomNodes';
import { useTopics } from '@/lib/hooks/useTopics';
import { useUpdateActivity } from '@/lib/hooks/useActivities';
import { TopicFormModal } from '../TopicFormModal';
import { NodeFormModal } from '../NodeFormModal';
import { ActivityFormModal } from '../ActivityFormModal';
import { TopicNodesFetcher } from './TopicNodesFetcher';
import { NodeActivitiesFetcher } from './NodeActivitiesFetcher';
import { reorderArticles } from '@/lib/api/curricula';
import { reorderItems, getChangedItems } from '@/lib/utils/reorder';
import type { Topic, Node as CurriculumNodeType, Article } from '@/lib/schemas/curriculum';
import { BookOpen, FileCheck, Info, FileText, Play } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

// Node types for React Flow
const nodeTypes = {
  curriculum: CurriculumNode,
  topic: TopicNode,
  lesson: LessonNode,
  activity: ActivityNode,
};

interface CurriculumFlowProps {
  curriculumId: string;
  curriculumTitle: string;
}

// Helper to get activity icon
function getActivityIcon(type: string) {
  if (type.toLowerCase().includes('video') || type.toLowerCase().includes('animation')) {
    return Play;
  }
  return FileText;
}

export function CurriculumFlow({ curriculumId, curriculumTitle }: CurriculumFlowProps) {
  const queryClient = useQueryClient();
  const { data: topics } = useTopics(curriculumId);
  const { mutate: updateActivity } = useUpdateActivity();

  // Track which topics and nodes are expanded
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Store fetched data
  const [topicNodesMap, setTopicNodesMap] = useState<Map<string, CurriculumNodeType[]>>(new Map());
  const [nodeActivitiesMap, setNodeActivitiesMap] = useState<Map<string, Article[]>>(new Map());

  // Drag state
  const [draggedActivity, setDraggedActivity] = useState<Article | null>(null);
  const [dragOverNode, setDragOverNode] = useState<string | null>(null);

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

  // Handle node clicks to toggle expansion
  const handleNodeClick: NodeMouseHandler = useCallback((event, node) => {
    // Don't toggle if we're dragging
    if (draggedActivity) return;

    if (node.type === 'topic') {
      setExpandedTopics(prev => {
        const next = new Set(prev);
        if (next.has(node.id)) {
          next.delete(node.id);
        } else {
          next.add(node.id);
        }
        return next;
      });
    } else if (node.type === 'lesson') {
      setExpandedNodes(prev => {
        const next = new Set(prev);
        if (next.has(node.id)) {
          next.delete(node.id);
        } else {
          next.add(node.id);
        }
        return next;
      });
    }
  }, [draggedActivity]);

  // Handle drag start for activities
  const handleNodeDragStart: NodeDragHandler = useCallback((event, node) => {
    if (node.type === 'activity' && node.data.data) {
      setDraggedActivity(node.data.data as Article);
    }
  }, []);

  // Handle drag over a node (for visual feedback)
  const handleNodeDrag: NodeDragHandler = useCallback((event, node, nodes) => {
    if (!draggedActivity) return;

    // Find if we're over a lesson node
    const overNode = nodes.find(n => {
      if (n.type !== 'lesson') return false;
      const rect = document.querySelector(`[data-id="${n.id}"]`)?.getBoundingClientRect();
      if (!rect) return false;
      return (
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      );
    });

    setDragOverNode(overNode?.id || null);
  }, [draggedActivity]);

  // Handle drag end
  const handleNodeDragStop: NodeDragHandler = useCallback((event, node, nodes) => {
    if (!draggedActivity || node.type !== 'activity') {
      setDraggedActivity(null);
      setDragOverNode(null);
      return;
    }

    // Check if we dropped on a lesson node
    const targetNode = nodes.find(n => {
      if (n.type !== 'lesson') return false;
      const rect = document.querySelector(`[data-id="${n.id}"]`)?.getBoundingClientRect();
      if (!rect) return false;
      return (
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      );
    });

    if (targetNode && targetNode.id !== draggedActivity.node_id) {
      // Move activity to different node
      const oldNodeId = draggedActivity.node_id;
      const newNodeId = targetNode.id;

      updateActivity(
        {
          curriculumId,
          nodeId: oldNodeId,
          activityId: draggedActivity.id,
          data: { node_id: newNodeId },
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activities', curriculumId, oldNodeId] });
            queryClient.invalidateQueries({ queryKey: ['activities', curriculumId, newNodeId] });
            toast.success('Activity moved successfully');
          },
          onError: () => {
            toast.error('Failed to move activity');
          },
        }
      );
    }

    setDraggedActivity(null);
    setDragOverNode(null);
  }, [draggedActivity, updateActivity, curriculumId, queryClient]);

  // Build nodes and edges for React Flow
  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Curriculum node (root)
    nodes.push({
      id: curriculumId,
      type: 'curriculum',
      position: { x: 100, y: 300 },
      data: {
        label: curriculumTitle,
        icon: BookOpen,
        onAdd: () => {
          setEditingTopic(null);
          setTopicModalOpen(true);
        },
      },
    });

    // Add topics
    if (topics) {
      topics.forEach((topic, topicIndex) => {
        const topicId = topic.id;
        const topicY = 100 + topicIndex * 200;

        nodes.push({
          id: topicId,
          type: 'topic',
          position: { x: 400, y: topicY },
          data: {
            label: topic.title.en,
            icon: BookOpen,
            data: topic,
            onAdd: () => {
              setEditingNode(null);
              setSelectedTopicForNode(topicId);
              setNodeModalOpen(true);
            },
            onEdit: () => {
              setEditingTopic(topic);
              setTopicModalOpen(true);
            },
            onDelete: () => {
              console.log('Delete topic:', topic);
            },
          },
        });

        edges.push({
          id: `${curriculumId}-${topicId}`,
          source: curriculumId,
          target: topicId,
          animated: true,
          style: { stroke: '#9ca3af', strokeWidth: 2 },
        });

        // Add nodes for expanded topics
        const topicNodes = topicNodesMap.get(topicId);
        if (expandedTopics.has(topicId) && topicNodes) {
          topicNodes.forEach((node, nodeIndex) => {
            const nodeId = node.id;
            const nodeX = 700;
            const nodeY = topicY + (nodeIndex - (topicNodes.length - 1) / 2) * 120;

            nodes.push({
              id: nodeId,
              type: 'lesson',
              position: { x: nodeX, y: nodeY },
              className: dragOverNode === nodeId ? 'ring-4 ring-blue-400' : '',
              data: {
                label: node.title.en,
                icon: FileCheck,
                data: node,
                onAdd: () => {
                  setEditingActivity(null);
                  setSelectedNodeForActivity(nodeId);
                  setActivityModalOpen(true);
                },
                onEdit: () => {
                  setEditingNode(node);
                  setSelectedTopicForNode(topicId);
                  setNodeModalOpen(true);
                },
                onDelete: () => {
                  console.log('Delete node:', node);
                },
              },
            });

            edges.push({
              id: `${topicId}-${nodeId}`,
              source: topicId,
              target: nodeId,
              animated: true,
              style: { stroke: '#9ca3af', strokeWidth: 2 },
            });

            // Add activities for expanded nodes
            const nodeActivities = nodeActivitiesMap.get(nodeId);
            if (expandedNodes.has(nodeId) && nodeActivities) {
              nodeActivities.forEach((activity, activityIndex) => {
                const activityId = activity.id;
                const activityX = 1000;
                const activityY = nodeY + (activityIndex - (nodeActivities.length - 1) / 2) * 80;

                nodes.push({
                  id: activityId,
                  type: 'activity',
                  position: { x: activityX, y: activityY },
                  draggable: false,
                  data: {
                    label: activity.instruction.en,
                    icon: getActivityIcon(activity.type),
                    data: activity,
                    onEdit: () => {
                      setEditingActivity(activity);
                      setSelectedNodeForActivity(nodeId);
                      setActivityModalOpen(true);
                    },
                    onDelete: () => {
                      console.log('Delete activity:', activity);
                    },
                  },
                });

                edges.push({
                  id: `${nodeId}-${activityId}`,
                  source: nodeId,
                  target: activityId,
                  animated: true,
                  style: { stroke: '#9ca3af', strokeWidth: 2 },
                });
              });
            }
          });
        }
      });
    }

    return { nodes, edges };
  }, [curriculumId, curriculumTitle, topics, expandedTopics, expandedNodes, topicNodesMap, nodeActivitiesMap]);

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100">
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

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        onNodeClick={handleNodeClick}
        fitView
        minZoom={0.5}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#e5e7eb" />
        <Controls showInteractive={false} />
      </ReactFlow>

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
