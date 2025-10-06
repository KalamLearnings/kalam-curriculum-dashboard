'use client';

import { useEffect } from 'react';
import { useActivities } from '@/lib/hooks/useActivities';
import type { Article } from '@/lib/schemas/curriculum';

interface NodeActivitiesFetcherProps {
  curriculumId: string;
  nodeId: string;
  onDataLoaded: (nodeId: string, activities: Article[]) => void;
}

export function NodeActivitiesFetcher({ curriculumId, nodeId, onDataLoaded }: NodeActivitiesFetcherProps) {
  const { data: activities } = useActivities(curriculumId, nodeId);

  useEffect(() => {
    if (activities) {
      onDataLoaded(nodeId, activities);
    }
  }, [activities, nodeId, onDataLoaded]);

  return null;
}
