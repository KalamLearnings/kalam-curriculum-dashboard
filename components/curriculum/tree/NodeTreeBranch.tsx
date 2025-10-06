'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TreeNode, TreeNodeData } from './TreeNode';
import { useActivities } from '@/lib/hooks/useActivities';
import { FileText, Play } from 'lucide-react';

interface NodeTreeBranchProps {
  curriculumId: string;
  node: TreeNodeData;
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

// Helper function to get activity icon
function getActivityIcon(type: string) {
  if (type.toLowerCase().includes('video') || type.toLowerCase().includes('animation')) {
    return Play;
  }
  return FileText;
}

export function NodeTreeBranch({
  curriculumId,
  node,
  level,
  expandedNodes,
  selectedNodeId,
  hoveredPath,
  onToggle,
  onClick,
  onAdd,
  onEdit,
  onDelete,
}: NodeTreeBranchProps) {
  const { data: activities } = useActivities(curriculumId, node.id);
  const isExpanded = expandedNodes.has(node.id);

  console.log('[NodeTreeBranch] Debug:', {
    nodeId: node.id,
    nodeTitle: node.title,
    isExpanded,
    activitiesData: activities,
    activitiesCount: activities?.length || 0,
  });

  // Map activities to TreeNodeData
  const activityTreeData: TreeNodeData[] =
    activities?.map((activity) => ({
      id: activity.id,
      type: 'activity' as const,
      title: activity.instruction.en,
      icon: getActivityIcon(activity.type),
      data: activity,
    })) || [];

  console.log('[NodeTreeBranch] activityTreeData:', activityTreeData);

  // Calculate positions for activities
  const activityPositions = activityTreeData.map((_, index) => {
    const spacing = 60; // Smaller spacing for activities
    const x = 200; // Horizontal distance from node
    const y = (index - (activityTreeData.length - 1) / 2) * spacing; // Center vertically
    return { x, y };
  });

  return (
    <div className="relative">
      {/* Node */}
      <TreeNode
        node={node}
        level={level}
        isExpanded={isExpanded}
        isSelected={selectedNodeId === node.id}
        isInHoverPath={hoveredPath.includes(node.id)}
        isDragOver={false}
        onToggle={onToggle}
        onClick={onClick}
        onAdd={onAdd}
        onEdit={onEdit}
        onDelete={onDelete}
        enableDragDrop={true}
        canHaveChildren={true}
      />

      {/* Connection lines and activities */}
      <AnimatePresence>
        {isExpanded && activityTreeData.length > 0 && (
          <SortableContext items={activityTreeData.map((a) => a.id)} strategy={verticalListSortingStrategy}>
            {/* SVG for connection lines */}
            <svg
              className="absolute pointer-events-none"
              style={{
                left: 0,
                top: 0,
                width: 300,
                height: activityTreeData.length * 60,
                transform: 'translate(0, -50%)',
                overflow: 'visible',
              }}
            >
              {activityPositions.map((pos, index) => {
                const activity = activityTreeData[index];
                const isInPath = hoveredPath.includes(activity.id);
                const path = `M 0 0 C ${pos.x / 2} 0, ${pos.x / 2} ${pos.y}, ${pos.x} ${pos.y}`;

                return (
                  <motion.path
                    key={`line-${activity.id}`}
                    d={path}
                    fill="none"
                    stroke={isInPath ? '#60a5fa' : '#e5e7eb'}
                    strokeWidth={isInPath ? 2 : 1.5}
                    strokeDasharray="3,3"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    exit={{ pathLength: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut', delay: index * 0.03 }}
                  />
                );
              })}
            </svg>

            {/* Activity Nodes */}
            {activityTreeData.map((activity, index) => {
              const pos = activityPositions[index];
              return (
                <motion.div
                  key={activity.id}
                  className="absolute"
                  style={{
                    left: pos.x,
                    top: pos.y,
                    transform: 'translate(-50%, -50%)',
                  }}
                  initial={{ opacity: 0, x: -30, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -30, scale: 0.8 }}
                  transition={{
                    type: 'spring',
                    stiffness: 250,
                    damping: 25,
                    delay: index * 0.05,
                  }}
                >
                  <TreeNode
                    node={activity}
                    level={level + 1}
                    isExpanded={false}
                    isSelected={selectedNodeId === activity.id}
                    isInHoverPath={hoveredPath.includes(activity.id)}
                    isDragOver={false}
                    onToggle={onToggle}
                    onClick={onClick}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    enableDragDrop={true}
                    canHaveChildren={false}
                  />
                </motion.div>
              );
            })}
          </SortableContext>
        )}
      </AnimatePresence>
    </div>
  );
}
