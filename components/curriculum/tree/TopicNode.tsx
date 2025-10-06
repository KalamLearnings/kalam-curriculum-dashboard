'use client';

import { memo, useState } from 'react';
import { BookOpen, Plus, Edit2, Trash2, ChevronDown } from 'lucide-react';
import type { Topic, Node as CurriculumNode, Article } from '@/lib/schemas/curriculum';
import { NodeNode } from './NodeNode';
import { useNodes } from '@/lib/hooks/useNodes';

interface TopicNodeProps {
  topic: Topic;
  curriculumId: string;
  onEdit: () => void;
  onDelete: () => void;
  onAddNode: () => void;
  onEditNode: (node: CurriculumNode) => void;
  onDeleteNode: (nodeId: string) => void;
  onAddActivity: (nodeId: string) => void;
  onEditActivity: (activity: Article) => void;
}

export const TopicNode = memo(({
  topic,
  curriculumId,
  onEdit,
  onDelete,
  onAddNode,
  onEditNode,
  onDeleteNode,
  onAddActivity,
  onEditActivity,
}: TopicNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { data: nodes } = useNodes(curriculumId, topic.id);

  return (
    <div className="mb-6">
      {/* Topic Header */}
      <div
        className={`
          group relative rounded-xl border-2 transition-all duration-300
          ${isExpanded
            ? 'bg-white shadow-lg border-amber-400'
            : 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-300 shadow-md'
          }
          hover:shadow-xl
        `}
      >
        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full
                     bg-amber-500 text-white flex items-center justify-center
                     hover:bg-amber-600 transition-all shadow-md z-10 hover:scale-110"
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isExpanded ? '' : '-rotate-90'
            }`}
          />
        </button>

        {/* Main Content */}
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {topic.title.en}
              </h3>
              <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                {topic.description?.en || 'No description'}
              </p>
            </div>
          </div>

          {/* Action Buttons (show on hover) */}
          <div className="flex gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={onAddNode}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5
                         text-xs font-medium text-amber-700 bg-amber-50 rounded-lg
                         hover:bg-amber-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Lesson
            </button>
            <button
              onClick={onEdit}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50
                         rounded transition-colors"
              title="Edit topic"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50
                         rounded transition-colors"
              title="Delete topic"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Child Nodes (CSS-only animated collapse) */}
      <div
        className={`
          ml-10 mt-4 space-y-3 overflow-hidden transition-all duration-300 ease-in-out relative
          ${isExpanded ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        {/* Connecting Line */}
        {isExpanded && nodes && nodes.length > 0 && (
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-amber-200" />
        )}

        {nodes?.map((node) => (
          <div key={node.id} className="relative pl-6">
            {/* Horizontal connector */}
            <div className="absolute left-0 top-6 w-6 h-0.5 bg-amber-200" />

            <NodeNode
              node={node}
              curriculumId={curriculumId}
              onEdit={() => onEditNode(node)}
              onDelete={() => onDeleteNode(node.id)}
              onAddActivity={() => onAddActivity(node.id)}
              onEditActivity={onEditActivity}
            />
          </div>
        ))}
      </div>
    </div>
  );
});

TopicNode.displayName = 'TopicNode';
