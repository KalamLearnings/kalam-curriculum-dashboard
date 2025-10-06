'use client';

import { useEffect } from 'react';
import { useNodes } from '@/lib/hooks/useNodes';
import type { Node as CurriculumNodeType } from '@/lib/schemas/curriculum';

interface TopicNodesFetcherProps {
  curriculumId: string;
  topicId: string;
  onDataLoaded: (topicId: string, nodes: CurriculumNodeType[]) => void;
}

export function TopicNodesFetcher({ curriculumId, topicId, onDataLoaded }: TopicNodesFetcherProps) {
  const { data: nodes } = useNodes(curriculumId, topicId);

  useEffect(() => {
    if (nodes) {
      onDataLoaded(topicId, nodes);
    }
  }, [nodes, topicId, onDataLoaded]);

  return null;
}
