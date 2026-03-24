/**
 * ActivitiesByTypeView Component
 *
 * Alternative view for the curriculum builder that shows activities
 * grouped by their type (e.g., all "letter_rain" activities together).
 *
 * Each activity item displays its location context (topic + node).
 */

import { useState } from 'react';
import { ChevronRight, ChevronDown, Loader2 } from 'lucide-react';
import { useActivitiesByType } from '@/lib/hooks/useActivities';
import type { ActivityByType, ActivityTypeGroup } from '@/lib/api/curricula';
import { getActivityIcon, getActivityLabel } from '@/lib/constants/curriculum';
import { cn } from '@/lib/utils';

interface ActivitiesByTypeViewProps {
  curriculumId: string;
  selectedActivityId: string | null;
  onActivitySelect: (activity: ActivityByType, nodeId: string, topicId: string) => void;
}

function ActivityTypeSection({
  group,
  isExpanded,
  onToggle,
  selectedActivityId,
  onActivitySelect,
}: {
  group: ActivityTypeGroup;
  isExpanded: boolean;
  onToggle: () => void;
  selectedActivityId: string | null;
  onActivitySelect: (activity: ActivityByType, nodeId: string, topicId: string) => void;
}) {
  return (
    <div className="mb-2">
      {/* Type Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-2 py-2 hover:bg-gray-100 rounded text-sm font-medium transition-colors"
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 flex-shrink-0" />
        )}
        <span className="text-base">{getActivityIcon(group.type)}</span>
        <span className="truncate flex-1 text-left">{getActivityLabel(group.type)}</span>
        <span className="text-xs text-gray-500 font-normal px-2 py-0.5 bg-gray-100 rounded-full">
          {group.count}
        </span>
      </button>

      {/* Activities List */}
      {isExpanded && (
        <div className="ml-4 mt-1 space-y-1">
          {group.activities.map((activity) => (
            <button
              key={activity.id}
              onClick={() => onActivitySelect(activity, activity.node_id, activity.topic.id)}
              className={cn(
                "w-full text-left px-3 py-2 rounded text-sm transition-colors",
                selectedActivityId === activity.id
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-100"
              )}
            >
              {/* Instruction preview */}
              <div className="truncate text-xs mb-1">
                {activity.instruction.en || '(No instruction)'}
              </div>
              {/* Location context */}
              <div
                className={cn(
                  "text-[10px] truncate",
                  selectedActivityId === activity.id ? "text-blue-200" : "text-gray-400"
                )}
              >
                {activity.topic.title?.en} &rarr; {activity.node.title?.en}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ActivitiesByTypeView({
  curriculumId,
  selectedActivityId,
  onActivitySelect,
}: ActivitiesByTypeViewProps) {
  const { data: activityGroups, isLoading, error } = useActivitiesByType(curriculumId);
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());

  const toggleType = (type: string) => {
    setExpandedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <p className="text-xs text-red-500">Failed to load activities</p>
        </div>
      </div>
    );
  }

  const totalActivities = activityGroups?.reduce((sum, g) => sum + g.count, 0) || 0;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase">
          By Type
        </h2>
        <span className="text-xs text-gray-400">
          {totalActivities} activities
        </span>
      </div>

      {activityGroups && activityGroups.length > 0 ? (
        activityGroups.map((group) => (
          <ActivityTypeSection
            key={group.type}
            group={group}
            isExpanded={expandedTypes.has(group.type)}
            onToggle={() => toggleType(group.type)}
            selectedActivityId={selectedActivityId}
            onActivitySelect={onActivitySelect}
          />
        ))
      ) : (
        <div className="text-center py-8">
          <p className="text-xs text-gray-400">No activities yet</p>
        </div>
      )}
    </div>
  );
}
