'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { RichTreeViewPro } from '@mui/x-tree-view-pro/RichTreeViewPro';
import { TreeViewBaseItem } from '@mui/x-tree-view/models';
import { useTopics } from '@/lib/hooks/useTopics';
import { useNodes } from '@/lib/hooks/useNodes';
import { useActivities } from '@/lib/hooks/useActivities';
import type { Topic, Node as CurriculumNodeType, Article } from '@/lib/schemas/curriculum';

interface CurriculumTreeViewProps {
  curriculumId: string;
  curriculumTitle: string;
  onItemSelect?: (item: TreeViewBaseItem | null, type: string) => void;
}

type ItemType = 'curriculum' | 'topic' | 'node' | 'activity';

interface TreeItemData {
  type: ItemType;
  data?: Topic | CurriculumNodeType | Article;
}

export function CurriculumTreeView({ curriculumId, curriculumTitle, onItemSelect }: CurriculumTreeViewProps) {
  const { data: topics } = useTopics(curriculumId);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [topicNodesMap, setTopicNodesMap] = useState<Map<string, CurriculumNodeType[]>>(new Map());
  const [nodeActivitiesMap, setNodeActivitiesMap] = useState<Map<string, Article[]>>(new Map());

  // Build tree items with lazy-loaded data
  const items: TreeViewBaseItem<TreeItemData>[] = useMemo(() => {
    const rootItem: TreeViewBaseItem<TreeItemData> = {
      id: curriculumId,
      label: curriculumTitle,
      children: topics?.map(topic => {
        const topicNodes = topicNodesMap.get(topic.id);
        return {
          id: topic.id,
          label: topic.title.en,
          children: topicNodes?.map(node => {
            const nodeActivities = nodeActivitiesMap.get(node.id);
            return {
              id: node.id,
              label: node.title.en,
              children: nodeActivities?.map(activity => ({
                id: activity.id,
                label: activity.instruction.en,
              })) || [],
            };
          }) || [],
        };
      }) || [],
    };

    return [rootItem];
  }, [curriculumId, curriculumTitle, topics, topicNodesMap, nodeActivitiesMap]);

  const handleItemExpansionToggle = (_event: React.SyntheticEvent, itemId: string, isExpanded: boolean) => {
    // Check if it's a topic
    if (topics?.some(t => t.id === itemId)) {
      setExpandedTopics(prev => {
        const next = new Set(prev);
        if (isExpanded) {
          next.add(itemId);
        } else {
          next.delete(itemId);
        }
        return next;
      });
    } else {
      // Check if it's a node
      for (const nodes of topicNodesMap.values()) {
        if (nodes.some(n => n.id === itemId)) {
          setExpandedNodes(prev => {
            const next = new Set(prev);
            if (isExpanded) {
              next.add(itemId);
            } else {
              next.delete(itemId);
            }
            return next;
          });
          break;
        }
      }
    }
  };

  const handleSelectedItemsChange = (_event: React.SyntheticEvent, itemId: string | null) => {
    setSelectedItem(itemId);
    if (onItemSelect && itemId) {
      // Determine item type
      let itemType = 'curriculum';
      if (topics?.some(t => t.id === itemId)) {
        itemType = 'topic';
      } else {
        for (const nodes of topicNodesMap.values()) {
          if (nodes.some(n => n.id === itemId)) {
            itemType = 'node';
            break;
          }
        }
        if (itemType === 'curriculum') {
          for (const activities of nodeActivitiesMap.values()) {
            if (activities.some(a => a.id === itemId)) {
              itemType = 'activity';
              break;
            }
          }
        }
      }

      const item = items.find(i => i.id === itemId);
      if (item) {
        onItemSelect(item, itemType);
      }
    }
  };

  return (
    <div className="h-full bg-white p-6 overflow-auto">
      {/* Lazy load nodes for expanded topics */}
      {Array.from(expandedTopics).map(topicId => (
        <TopicNodesLoader
          key={topicId}
          curriculumId={curriculumId}
          topicId={topicId}
          onDataLoaded={(nodes) => {
            setTopicNodesMap(prev => new Map(prev).set(topicId, nodes));
          }}
        />
      ))}

      {/* Lazy load activities for expanded nodes */}
      {Array.from(expandedNodes).map(nodeId => (
        <NodeActivitiesLoader
          key={nodeId}
          curriculumId={curriculumId}
          nodeId={nodeId}
          onDataLoaded={(activities) => {
            setNodeActivitiesMap(prev => new Map(prev).set(nodeId, activities));
          }}
        />
      ))}

      <RichTreeViewPro
        items={items}
        selectedItems={selectedItem}
        onSelectedItemsChange={handleSelectedItemsChange}
        onItemExpansionToggle={handleItemExpansionToggle}
        experimentalFeatures={{ indentationAtItemLevel: true }}
        itemsReordering
        onItemPositionChange={(params) => {
          console.log('Item position changed:', params);
          // TODO: Implement reordering logic
        }}
      />
    </div>
  );
}

// Helper component to load nodes for a topic
function TopicNodesLoader({
  curriculumId,
  topicId,
  onDataLoaded
}: {
  curriculumId: string;
  topicId: string;
  onDataLoaded: (nodes: CurriculumNodeType[]) => void;
}) {
  const { data: nodes } = useNodes(curriculumId, topicId);

  useEffect(() => {
    if (nodes) {
      onDataLoaded(nodes);
    }
  }, [nodes, onDataLoaded]);

  return null;
}

// Helper component to load activities for a node
function NodeActivitiesLoader({
  curriculumId,
  nodeId,
  onDataLoaded
}: {
  curriculumId: string;
  nodeId: string;
  onDataLoaded: (activities: Article[]) => void;
}) {
  const { data: activities } = useActivities(curriculumId, nodeId);

  useEffect(() => {
    if (activities) {
      onDataLoaded(activities);
    }
  }, [activities, onDataLoaded]);

  return null;
}
