'use client';

import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, closestCorners, DragStartEvent } from '@dnd-kit/core';
import { TopicNode } from './TopicNode';
import { useTopics, useDeleteTopic } from '@/lib/hooks/useTopics';
import { useNodes, useDeleteNode } from '@/lib/hooks/useNodes';
import { useMoveActivity, useReorderActivities } from '@/lib/hooks/useActivities';
import type { Topic, Node as CurriculumNode, Article } from '@/lib/schemas/curriculum';

interface CurriculumTreeViewProps {
  curriculumId: string;
  onEditTopic: (topic: Topic) => void;
  onEditNode: (node: CurriculumNode) => void;
  onCreateTopic: () => void;
  onCreateNode: (topicId: string) => void;
  onCreateActivity: (nodeId: string, topic: Topic) => void;
  onEditActivity: (activity: Article, topic: Topic) => void;
}

export function CurriculumTreeView({
  curriculumId,
  onEditTopic,
  onEditNode,
  onCreateTopic,
  onCreateNode,
  onCreateActivity,
  onEditActivity,
}: CurriculumTreeViewProps) {
  const { data: topics } = useTopics(curriculumId);
  const { mutate: deleteTopic } = useDeleteTopic();
  const { mutate: deleteNode } = useDeleteNode();
  const { mutate: moveActivity } = useMoveActivity();
  const { mutate: reorderActivities } = useReorderActivities();
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    const activeData = active.data.current;
    const overData = over.data.current;

    // Case 1: Dragging activity to a different node
    if (activeData?.type === 'activity' && overData?.type === 'node') {
      const sourceNodeId = activeData.nodeId;
      const targetNodeId = overData.node.id;

      if (sourceNodeId !== targetNodeId) {
        moveActivity({
          curriculumId,
          activityId: active.id as string,
          sourceNodeId,
          targetNodeId,
        });
      }
    }

    // Case 2: Reordering activities within same node
    if (activeData?.type === 'activity' && overData?.type === 'activity') {
      const sourceNodeId = activeData.nodeId;
      const targetNodeId = overData.nodeId;

      if (sourceNodeId === targetNodeId) {
        reorderActivities({
          curriculumId,
          nodeId: sourceNodeId,
          activeId: active.id as string,
          overId: over.id as string,
        });
      }
    }

    setActiveId(null);
  };

  if (!topics || topics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-gray-500 mb-4">No topics yet</div>
        <button
          onClick={onCreateTopic}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create First Topic
        </button>
      </div>
    );
  }

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCorners}
    >
      <div className="p-8 overflow-auto h-full bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-6">
          {topics.map((topic) => (
            <TopicNode
              key={topic.id}
              topic={topic}
              curriculumId={curriculumId}
              onEdit={() => onEditTopic(topic)}
              onDelete={() => deleteTopic({ curriculumId, topicId: topic.id })}
              onAddNode={() => onCreateNode(topic.id)}
              onEditNode={onEditNode}
              onDeleteNode={(nodeId) => deleteNode({ curriculumId, topicId: topic.id, nodeId })}
              onAddActivity={(nodeId) => onCreateActivity(nodeId, topic)}
              onEditActivity={(activity) => onEditActivity(activity, topic)}
            />
          ))}

          {/* Add Topic Button */}
          <button
            onClick={onCreateTopic}
            className="w-full flex items-center justify-center gap-2 px-4 py-3
                       border-2 border-dashed border-gray-300 rounded-xl
                       text-gray-500 hover:border-amber-400 hover:text-amber-600
                       hover:bg-amber-50 transition-all"
          >
            <span className="text-2xl">+</span>
            <span className="font-medium">Add New Topic</span>
          </button>
        </div>
      </div>

      <DragOverlay>
        {activeId ? (
          <div className="bg-pink-100 border-2 border-pink-400 rounded-lg p-3 shadow-lg">
            Dragging activity...
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
