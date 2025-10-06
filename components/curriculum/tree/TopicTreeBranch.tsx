'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { TreeNode, TreeNodeData } from './TreeNode';
import { NodeTreeBranch } from './NodeTreeBranch';
import { useNodes } from '@/lib/hooks/useNodes';
import { BookOpen, FileCheck, Info } from 'lucide-react';

interface TopicTreeBranchProps {
  curriculumId: string;
  topic: TreeNodeData;
  level: number;
  expandedNodes: Set<string>;
  selectedNodeId?: string;
  hoveredPath: string[];
  onToggle: (nodeId: string) => void;
  onClick: (node: TreeNodeData) => void;
  onAdd?: (parentNode: TreeNodeData) => void;
  onEdit?: (node: TreeNodeData) => void;
  onDelete?: (node: TreeNodeData) => void;
}

export function TopicTreeBranch({
  curriculumId,
  topic,
  level,
  expandedNodes,
  selectedNodeId,
  hoveredPath,
  onToggle,
  onClick,
  onAdd,
  onEdit,
  onDelete,
}: TopicTreeBranchProps) {
  const { data: nodes } = useNodes(curriculumId, topic.id);
  const isExpanded = expandedNodes.has(topic.id);

  console.log('[TopicTreeBranch] Debug:', {
    topicId: topic.id,
    topicTitle: topic.title,
    isExpanded,
    nodesData: nodes,
    nodesCount: nodes?.length || 0,
  });

  // Map nodes to TreeNodeData with appropriate icons
  const nodeTreeData: TreeNodeData[] =
    nodes?.map((node) => ({
      id: node.id,
      type: 'node' as const,
      title: node.title.en,
      icon: node.type === 'lesson' ? BookOpen : node.type === 'assessment' ? FileCheck : Info,
      data: node,
      children: [],
    })) || [];

  console.log('[TopicTreeBranch] nodeTreeData:', nodeTreeData);

  // Calculate positions for nodes
  const nodePositions = nodeTreeData.map((_, index) => {
    const spacing = 120; // Vertical spacing between nodes
    const x = 250; // Horizontal distance from topic
    const y = (index - (nodeTreeData.length - 1) / 2) * spacing; // Center vertically
    return { x, y };
  });

  return (
    <div className="relative">
      {/* Topic Node */}
      <TreeNode
        node={topic}
        level={level}
        isExpanded={isExpanded}
        isSelected={selectedNodeId === topic.id}
        isInHoverPath={hoveredPath.includes(topic.id)}
        isDragOver={false}
        onToggle={onToggle}
        onClick={onClick}
        onAdd={onAdd}
        onEdit={onEdit}
        onDelete={onDelete}
        enableDragDrop={false}
        canHaveChildren={true}
      />

      {/* Connection lines and child nodes */}
      <AnimatePresence>
        {isExpanded && (
          <>
            {/* SVG for connection lines */}
            <svg
              className="absolute pointer-events-none"
              style={{
                left: 0,
                top: 0,
                width: 400,
                height: nodeTreeData.length * 120,
                transform: 'translate(0, -50%)',
                overflow: 'visible',
              }}
            >
              {nodePositions.map((pos, index) => {
                const node = nodeTreeData[index];
                const isInPath = hoveredPath.includes(node.id);
                const path = `M 0 0 C ${pos.x / 2} 0, ${pos.x / 2} ${pos.y}, ${pos.x} ${pos.y}`;

                return (
                  <motion.path
                    key={`line-${node.id}`}
                    d={path}
                    fill="none"
                    stroke={isInPath ? '#60a5fa' : '#d1d5db'}
                    strokeWidth={isInPath ? 3 : 2}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    exit={{ pathLength: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: 'easeInOut', delay: index * 0.05 }}
                  />
                );
              })}
            </svg>

            {/* Child Nodes */}
            {nodeTreeData.map((node, index) => {
              const pos = nodePositions[index];
              return (
                <motion.div
                  key={node.id}
                  className="absolute"
                  style={{
                    left: pos.x,
                    top: pos.y,
                    transform: 'translate(-50%, -50%)',
                  }}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 20,
                    delay: index * 0.1,
                  }}
                >
                  <NodeTreeBranch
                    curriculumId={curriculumId}
                    node={node}
                    level={level + 1}
                    expandedNodes={expandedNodes}
                    selectedNodeId={selectedNodeId}
                    hoveredPath={hoveredPath}
                    onToggle={onToggle}
                    onClick={onClick}
                    onAdd={onAdd}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </motion.div>
              );
            })}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
