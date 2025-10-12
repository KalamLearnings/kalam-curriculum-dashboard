'use client';

import { useState } from 'react';
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
import { List, Network } from 'lucide-react';
import { TopicsList } from './TopicsList';
import { NodesList } from './NodesList';
import { ActivitiesList } from './ActivitiesList';
import { CurriculumTreeView } from './tree/CurriculumTreeView';
import { TopicFormModal } from './TopicFormModal';
import { NodeFormModal } from './NodeFormModal';
import { ActivityFormModal } from './ActivityFormModal';
import { useUpdateActivity } from '@/lib/hooks/useActivities';
import { reorderItems, getChangedItems } from '@/lib/utils/reorder';
import { reorderArticles } from '@/lib/api/curricula';
import type { Topic, Node, Article } from '@/lib/schemas/curriculum';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface CurriculumEditorProps {
  curriculumId: string;
  viewMode?: 'list' | 'tree';
}

type ViewMode = 'list' | 'tree';

export function CurriculumEditor({ curriculumId, viewMode = 'tree' }: CurriculumEditorProps) {
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Article | null>(null);

  // Modal states
  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);

  const [nodeModalOpen, setNodeModalOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<Node | null>(null);

  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Article | null>(null);

  // Drag and drop state
  const [draggingActivity, setDraggingActivity] = useState<Article | null>(null);
  const queryClient = useQueryClient();
  const { mutate: updateActivity } = useUpdateActivity();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    console.log('Drag start:', active.id, active.data.current?.type);
    // Check if dragging an activity (activity IDs should start with "activity_")
    if (active.data.current?.type === 'activity' && active.data.current) {
      setDraggingActivity(active.data.current.activity);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    console.log('Drag end:', {
      activeId: active.id,
      activeType: active.data.current?.type,
      overId: over?.id,
      overType: over?.data.current?.type,
    });

    setDraggingActivity(null);

    if (!over) return;

    const isActivityDrag = active.data.current?.type === 'activity';
    const isNodeDrop = over.data.current?.type === 'node';
    const isActivityDrop = over.data.current?.type === 'activity';

    // Scenario 1: Dropping activity onto a node (cross-node move)
    if (isActivityDrag && isNodeDrop && active.data.current) {
      const activity = active.data.current.activity as Article;
      const targetNodeId = over.id as string;
      const oldNodeId = activity.node_id;

      // Don't update if dropping on the same node
      if (targetNodeId === oldNodeId) return;

      // Update the activity's node_id (backend will auto-assign sequence number)
      updateActivity(
        {
          curriculumId,
          nodeId: oldNodeId,
          activityId: activity.id,
          data: { node_id: targetNodeId } as any,
        },
        {
          onSuccess: () => {
            // Invalidate both the old and new node's activities
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
    if (isActivityDrag && isActivityDrop && active.id !== over.id && active.data.current && over.data.current) {
      const activeActivity = active.data.current.activity as Article;
      const overActivity = over.data.current.activity as Article;

      // Only handle if both activities are in the same node
      if (activeActivity.node_id === overActivity.node_id) {
        const nodeId = activeActivity.node_id;
        const activities = queryClient.getQueryData<Article[]>(['activities', curriculumId, nodeId]);

        if (!activities) return;

        const reordered = reorderItems(activities, active.id as string, over.id as string);
        const changes = getChangedItems(activities, reordered);

        if (changes.length > 0) {
          // Call the API directly
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

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-[calc(100vh-3rem)] bg-gray-50">
        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {viewMode === 'list' ? (
            <div className="flex h-full">
              {/* Left Panel: Topics */}
              <div className="w-80 border-r bg-white flex flex-col">
                <div className="px-4 py-3 border-b bg-gray-50">
                  <h2 className="font-semibold text-gray-900">Topics</h2>
                </div>
                <TopicsList
                  curriculumId={curriculumId}
                  selectedTopicId={selectedTopic?.id}
                  onTopicSelect={(topic) => {
                    setSelectedTopic(topic);
                    setSelectedNode(null); // Clear node selection when topic changes
                  }}
                  onCreateClick={() => {
                    setEditingTopic(null);
                    setTopicModalOpen(true);
                  }}
                  onEditClick={(topic) => {
                    setEditingTopic(topic);
                    setTopicModalOpen(true);
                  }}
                />
              </div>

              {/* Middle Panel: Nodes */}
              <div className="w-96 border-r bg-white flex flex-col">
                <div className="px-4 py-3 border-b bg-gray-50">
                  <h2 className="font-semibold text-gray-900">
                    {selectedTopic ? selectedTopic.title.en : 'Nodes'}
                  </h2>
                </div>
                <NodesList
                  curriculumId={curriculumId}
                  topicId={selectedTopic?.id || null}
                  selectedNodeId={selectedNode?.id}
                  onNodeSelect={setSelectedNode}
                  onCreateClick={() => {
                    setEditingNode(null);
                    setNodeModalOpen(true);
                  }}
                  onEditClick={(node) => {
                    setEditingNode(node);
                    setNodeModalOpen(true);
                  }}
                />
              </div>

              {/* Right Panel: Activities */}
              <div className="flex-1 bg-white flex flex-col">
                <div className="px-4 py-3 border-b bg-gray-50">
                  <h2 className="font-semibold text-gray-900">
                    {selectedNode ? `Activities - ${selectedNode.title.en}` : 'Activities'}
                  </h2>
                </div>
                <ActivitiesList
                  curriculumId={curriculumId}
                  nodeId={selectedNode?.id || null}
                  selectedActivityId={selectedActivity?.id}
                  onActivitySelect={setSelectedActivity}
                  onCreateClick={() => {
                    setEditingActivity(null);
                    setActivityModalOpen(true);
                  }}
                  onEditClick={(activity) => {
                    setEditingActivity(activity);
                    setActivityModalOpen(true);
                  }}
                />
              </div>

              <DragOverlay>
                {draggingActivity ? (
                  <div className="bg-white border-2 border-blue-500 rounded px-4 py-3 shadow-lg">
                    <div className="font-medium text-sm">{draggingActivity.instruction.en}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{draggingActivity.type}</div>
                  </div>
                ) : null}
              </DragOverlay>
            </div>
          ) : (
            <CurriculumTreeView
              curriculumId={curriculumId}
              onEditTopic={(topic) => {
                setEditingTopic(topic);
                setTopicModalOpen(true);
              }}
              onEditNode={(node) => {
                setEditingNode(node);
                setNodeModalOpen(true);
              }}
              onCreateTopic={() => {
                setEditingTopic(null);
                setTopicModalOpen(true);
              }}
              onCreateNode={(topicId) => {
                setEditingNode(null);
                setSelectedTopic({ id: topicId } as Topic);
                setNodeModalOpen(true);
              }}
              onCreateActivity={(nodeId) => {
                setEditingActivity(null);
                setSelectedNode({ id: nodeId } as Node);
                setActivityModalOpen(true);
              }}
              onEditActivity={(activity) => {
                setEditingActivity(activity);
                setSelectedNode({ id: activity.node_id } as Node);
                setActivityModalOpen(true);
              }}
            />
          )}
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

        {selectedTopic && (
          <NodeFormModal
            isOpen={nodeModalOpen}
            onClose={() => {
              setNodeModalOpen(false);
              setEditingNode(null);
            }}
            curriculumId={curriculumId}
            topicId={selectedTopic.id}
            node={editingNode}
          />
        )}

        {selectedNode && (
          <ActivityFormModal
            isOpen={activityModalOpen}
            onClose={() => {
              setActivityModalOpen(false);
              setEditingActivity(null);
            }}
            curriculumId={curriculumId}
            nodeId={selectedNode.id}
            activity={editingActivity}
          />
        )}
      </div>
    </DndContext>
  );
}
