'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TreeNode, TreeNodeData } from './TreeNode';
import { TreeLayout } from './TreeLayout';
import { useTopics } from '@/lib/hooks/useTopics';
import { useNodes } from '@/lib/hooks/useNodes';
import { useActivities, useUpdateActivity } from '@/lib/hooks/useActivities';
import { TopicFormModal } from '../TopicFormModal';
import { NodeFormModal } from '../NodeFormModal';
import { ActivityFormModal } from '../ActivityFormModal';
import { reorderArticles } from '@/lib/api/curricula';
import { reorderItems, getChangedItems } from '@/lib/utils/reorder';
import type { Topic, Node, Article } from '@/lib/schemas/curriculum';
import { BookOpen, FileCheck, Info, FileText, Play } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface CurriculumTreeViewProps {
  curriculumId: string;
  curriculumTitle: string;
}

export function CurriculumTreeView({ curriculumId, curriculumTitle }: CurriculumTreeViewProps) {
  const queryClient = useQueryClient();

  // Data fetching
  const { data: topics } = useTopics(curriculumId);

  // State
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set([curriculumId]));
  const [selectedNode, setSelectedNode] = useState<TreeNodeData | null>(null);
  const [hoveredPath, setHoveredPath] = useState<string[]>([]);
  const [draggingActivity, setDraggingActivity] = useState<Article | null>(null);

  // Modal states
  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [nodeModalOpen, setNodeModalOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<Node | null>(null);
  const [selectedTopicForNode, setSelectedTopicForNode] = useState<string | null>(null);
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Article | null>(null);
  const [selectedNodeForActivity, setSelectedNodeForActivity] = useState<string | null>(null);

  const { mutate: updateActivity } = useUpdateActivity();

  // Auto-expand topics when they load
  useEffect(() => {
    if (topics && topics.length > 0) {
      setExpandedNodes(prev => {
        const next = new Set(prev);
        topics.forEach(topic => next.add(topic.id));
        return next;
      });
    }
  }, [topics]);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Toggle expand/collapse
  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  // Build tree structure
  const treeData = useMemo((): TreeNodeData => {
    console.log('[CurriculumTreeView] Building tree data:', {
      curriculumId,
      curriculumTitle,
      topics,
      topicsCount: topics?.length || 0,
    });

    return {
      id: curriculumId,
      type: 'curriculum',
      title: curriculumTitle,
      icon: BookOpen,
      children: topics?.map((topic) => ({
        id: topic.id,
        type: 'topic' as const,
        title: topic.title.en,
        icon: BookOpen,
        data: topic,
        children: [], // Will be populated by TopicTreeBranch
      })),
    };
  }, [curriculumId, curriculumTitle, topics]);

  // Handle drag and drop
  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    if (active.data.current?.type === 'activity') {
      setDraggingActivity(active.data.current.activity);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setDraggingActivity(null);

    if (!over) return;

    const isActivityDrag = active.data.current?.type === 'activity';
    const isNodeDrop = over.data.current?.type === 'node';
    const isActivityDrop = over.data.current?.type === 'activity';

    // Scenario 1: Dropping activity onto a node (cross-node move)
    if (isActivityDrag && isNodeDrop) {
      const activity = active.data.current.activity as Article;
      const targetNodeId = over.id as string;
      const oldNodeId = activity.node_id;

      if (targetNodeId === oldNodeId) return;

      updateActivity(
        {
          curriculumId,
          nodeId: oldNodeId,
          activityId: activity.id,
          data: { node_id: targetNodeId },
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activities', curriculumId, oldNodeId] });
            queryClient.invalidateQueries({ queryKey: ['activities', curriculumId, targetNodeId] });
            toast.success('Activity moved successfully');
          },
          onError: () => {
            toast.error('Failed to move activity');
          },
        }
      );
    }

    // Scenario 2: Reordering activities within the same node
    if (isActivityDrag && isActivityDrop && active.id !== over.id) {
      const activeActivity = active.data.current.activity as Article;
      const overActivity = over.data.current.activity as Article;

      if (activeActivity.node_id === overActivity.node_id) {
        const nodeId = activeActivity.node_id;
        const activities = queryClient.getQueryData<Article[]>(['activities', curriculumId, nodeId]);

        if (!activities) return;

        const reordered = reorderItems(activities, active.id as string, over.id as string);
        const changes = getChangedItems(activities, reordered);

        if (changes.length > 0) {
          reorderArticles(curriculumId, nodeId, { items: changes })
            .then(() => {
              queryClient.invalidateQueries({ queryKey: ['activities', curriculumId, nodeId] });
              toast.success('Activities reordered successfully');
            })
            .catch(() => {
              toast.error('Failed to reorder activities');
            });
        }
      }
    }
  }

  // Handle node selection
  const handleNodeClick = (node: TreeNodeData) => {
    setSelectedNode(node);
  };

  // Handle adding new items
  const handleAdd = (parentNode: TreeNodeData) => {
    if (parentNode.type === 'curriculum') {
      setEditingTopic(null);
      setTopicModalOpen(true);
    } else if (parentNode.type === 'topic') {
      setEditingNode(null);
      setSelectedTopicForNode(parentNode.id);
      setNodeModalOpen(true);
    } else if (parentNode.type === 'node') {
      setEditingActivity(null);
      setSelectedNodeForActivity(parentNode.id);
      setActivityModalOpen(true);
    }
  };

  // Handle editing items
  const handleEdit = (node: TreeNodeData) => {
    if (node.type === 'topic') {
      setEditingTopic(node.data);
      setTopicModalOpen(true);
    } else if (node.type === 'node') {
      setEditingNode(node.data);
      setSelectedTopicForNode(node.data.topic_id);
      setNodeModalOpen(true);
    } else if (node.type === 'activity') {
      setEditingActivity(node.data);
      setSelectedNodeForActivity(node.data.node_id);
      setActivityModalOpen(true);
    }
  };

  // Handle deleting items (will be implemented with confirmation modals)
  const handleDelete = (node: TreeNodeData) => {
    // TODO: Implement delete with confirmation modal
    console.log('Delete:', node);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        <TreeLayout
          curriculumId={curriculumId}
          rootNode={treeData}
          expandedNodes={expandedNodes}
          selectedNodeId={selectedNode?.id}
          hoveredPath={hoveredPath}
          onToggle={toggleNode}
          onClick={handleNodeClick}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

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

        {/* Drag Overlay */}
        <DragOverlay>
          {draggingActivity ? (
            <div className="bg-white border-2 border-blue-500 rounded px-4 py-3 shadow-lg">
              <div className="font-medium text-sm">{draggingActivity.instruction.en}</div>
              <div className="text-xs text-gray-400 mt-0.5">{draggingActivity.type}</div>
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
