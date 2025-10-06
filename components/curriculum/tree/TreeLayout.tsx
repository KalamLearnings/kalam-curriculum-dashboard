'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TreeNode, TreeNodeData } from './TreeNode';
import { TopicTreeBranch } from './TopicTreeBranch';

interface TreeLayoutProps {
  curriculumId: string;
  rootNode: TreeNodeData;
  expandedNodes: Set<string>;
  selectedNodeId?: string;
  hoveredPath: string[];
  onToggle: (nodeId: string) => void;
  onClick: (node: TreeNodeData) => void;
  onAdd?: (parentNode: TreeNodeData) => void;
  onEdit?: (node: TreeNodeData) => void;
  onDelete?: (node: TreeNodeData) => void;
}

export function TreeLayout({
  curriculumId,
  rootNode,
  expandedNodes,
  selectedNodeId,
  hoveredPath,
  onToggle,
  onClick,
  onAdd,
  onEdit,
  onDelete,
}: TreeLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  // Auto-center on mount
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPan({ x: rect.width / 2, y: rect.height / 2 });
    }
  }, []);

  const isExpanded = expandedNodes.has(rootNode.id);
  const topics = rootNode.children || [];

  console.log('[TreeLayout] Debug:', {
    isExpanded,
    topicsCount: topics.length,
    expandedNodes: Array.from(expandedNodes),
    rootNodeId: rootNode.id,
  });

  // Calculate positions for topics in a radial layout around curriculum
  const calculateTopicPositions = () => {
    const positions: { id: string; x: number; y: number }[] = [];
    const radius = 300; // Distance from curriculum center
    const count = topics.length;

    topics.forEach((topic, index) => {
      // Spread topics vertically down the right side
      const angle = (Math.PI / (count + 1)) * (index + 1) - Math.PI / 2; // -90 to +90 degrees
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      positions.push({ id: topic.id, x, y });
    });

    console.log('[TreeLayout] Topic positions:', positions);
    return positions;
  };

  const topicPositions = calculateTopicPositions();

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{ cursor: 'grab' }}
    >
      {/* Pan/Zoom Container */}
      <motion.div
        className="absolute inset-0"
        style={{
          transformOrigin: '0 0',
        }}
        animate={{
          x: pan.x,
          y: pan.y,
          scale: scale,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Curriculum Node (Center) */}
        <div className="absolute" style={{ left: 0, top: 0, transform: 'translate(-50%, -50%)' }}>
          <TreeNode
            node={rootNode}
            level={0}
            isExpanded={isExpanded}
            isSelected={selectedNodeId === rootNode.id}
            isInHoverPath={hoveredPath.includes(rootNode.id)}
            isDragOver={false}
            onToggle={onToggle}
            onClick={onClick}
            onAdd={onAdd}
            onEdit={onEdit}
            onDelete={onDelete}
            enableDragDrop={false}
            canHaveChildren={true}
          />

          {/* Connection lines from curriculum to topics */}
          {isExpanded && (
            <svg
              className="absolute pointer-events-none"
              style={{
                left: 0,
                top: 0,
                width: 2000,
                height: 2000,
                transform: 'translate(-1000px, -1000px)',
                overflow: 'visible',
              }}
            >
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#d1d5db" />
                  <stop offset="100%" stopColor="#9ca3af" />
                </linearGradient>
              </defs>

              {topicPositions.map((pos) => {
                const isInPath = hoveredPath.includes(pos.id);
                const path = `M 1000 1000 C ${1000 + pos.x / 2} 1000, ${1000 + pos.x / 2} ${1000 + pos.y}, ${1000 + pos.x} ${1000 + pos.y}`;

                return (
                  <motion.path
                    key={`line-${pos.id}`}
                    d={path}
                    fill="none"
                    stroke={isInPath ? '#60a5fa' : 'url(#lineGradient)'}
                    strokeWidth={isInPath ? 3 : 2}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    exit={{ pathLength: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                  />
                );
              })}
            </svg>
          )}
        </div>

        {/* Topic Branches */}
        {isExpanded &&
          topics.map((topic, index) => {
            const pos = topicPositions[index];
            return (
              <div
                key={topic.id}
                className="absolute"
                style={{
                  left: pos.x,
                  top: pos.y,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <TopicTreeBranch
                  curriculumId={curriculumId}
                  topic={topic}
                  level={1}
                  expandedNodes={expandedNodes}
                  selectedNodeId={selectedNodeId}
                  hoveredPath={hoveredPath}
                  onToggle={onToggle}
                  onClick={onClick}
                  onAdd={onAdd}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </div>
            );
          })}
      </motion.div>

      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 bg-white rounded-lg shadow-lg p-2">
        <button
          onClick={() => setScale((s) => Math.min(s + 0.1, 2))}
          className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
        >
          +
        </button>
        <button
          onClick={() => setScale(1)}
          className="px-3 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded"
        >
          Reset
        </button>
        <button
          onClick={() => setScale((s) => Math.max(s - 0.1, 0.5))}
          className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
        >
          −
        </button>
      </div>
    </div>
  );
}
