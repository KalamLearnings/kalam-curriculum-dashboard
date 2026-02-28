'use client';

import { useState, useMemo, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import type { ArticleType } from '@/lib/schemas/curriculum';
import {
  ACTIVITY_TYPES,
  ACTIVITY_CATEGORIES,
  ACTIVITY_TYPE_CATEGORIES,
  getActivitiesByCategory,
  getActivityCountByCategory,
  getActivityIcon,
  type ActivityCategory,
} from '@/lib/constants/curriculum';
import { cn } from '@/lib/utils';

interface ActivityTypeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTypeSelected: (type: ArticleType) => void;
}

// Local storage key for recent activities
const RECENT_ACTIVITIES_KEY = 'kalam-recent-activities';
const MAX_RECENT_ACTIVITIES = 4;

// Get recent activities from localStorage
function getRecentActivities(): ArticleType[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(RECENT_ACTIVITIES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Save activity to recent list
function saveRecentActivity(type: ArticleType): void {
  if (typeof window === 'undefined') return;
  try {
    const recent = getRecentActivities();
    // Remove if already exists, then add to front
    const filtered = recent.filter(t => t !== type);
    const updated = [type, ...filtered].slice(0, MAX_RECENT_ACTIVITIES);
    localStorage.setItem(RECENT_ACTIVITIES_KEY, JSON.stringify(updated));
  } catch {
    // Ignore localStorage errors
  }
}

// List of implemented activities
const IMPLEMENTED_ACTIVITIES: ArticleType[] = [
  'show_letter_or_word',
  'tap_letter_in_word',
  'trace_letter',
  'pop_balloons_with_letter',
  'break_time_minigame',
  'build_word_from_letters',
  'multiple_choice_question',
  'drag_items_to_target',
  'catch_fish_with_letter',
  'add_pizza_toppings_with_letter',
  'drag_dots_to_letter',
  'tap_dot_position',
  'activity_request',
  'letter_rain',
  'audio_letter_match',
  'memory_card_match',
  'color_letter',
  'letter_discrimination',
  'speech_practice',
  // New themed activities
  'grid_tap',
  'pick_from_tree',
  'pick_flowers',
  'tap_crescent_moons',
  'drag_to_animal_mouth',
  'feed_rabbit',
  'feed_baby',
  'piggy_bank',
  'snowflakes',
  'bear_honey',
  'fly_on_flowers',
  'deliver_envelope',
  'plant_seeds',
  'balance_scale',
  'ice_cream_stacking',
  'content_with_cards',
  'drag_hamza_to_letter',
  'slingshot',
];

export function ActivityTypeSelectorModal({
  isOpen,
  onClose,
  onTypeSelected,
}: ActivityTypeSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory>('all');
  const [recentActivities, setRecentActivities] = useState<ArticleType[]>([]);

  // Load recent activities on mount
  useEffect(() => {
    if (isOpen) {
      setRecentActivities(getRecentActivities());
      setSearchQuery('');
      setSelectedCategory('all');
    }
  }, [isOpen]);

  // Build activity list with metadata
  const activityTypes = useMemo(() => {
    return ACTIVITY_TYPES.map(({ value, label }) => ({
      type: value,
      label,
      icon: getActivityIcon(value),
      implemented: IMPLEMENTED_ACTIVITIES.includes(value),
      category: ACTIVITY_TYPE_CATEGORIES[value] || 'misc',
    }));
  }, []);

  // Filter activities based on search and category
  const filteredActivities = useMemo(() => {
    let filtered = activityTypes;

    // Filter by category
    if (selectedCategory !== 'all') {
      const categoryTypes = getActivitiesByCategory(selectedCategory);
      filtered = filtered.filter(a => categoryTypes.includes(a.type));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.label.toLowerCase().includes(query) ||
        a.type.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [activityTypes, selectedCategory, searchQuery]);

  // Get recent activities with metadata
  const recentActivityItems = useMemo(() => {
    return recentActivities
      .map(type => activityTypes.find(a => a.type === type))
      .filter((a): a is NonNullable<typeof a> => a !== undefined && a.implemented);
  }, [recentActivities, activityTypes]);

  const handleSelectType = (type: ArticleType) => {
    saveRecentActivity(type);
    onTypeSelected(type);
    onClose();
  };

  // Get count for each category (only implemented activities)
  const getCategoryCount = (categoryId: ActivityCategory): number => {
    if (categoryId === 'all') {
      return activityTypes.filter(a => a.implemented).length;
    }
    return activityTypes.filter(
      a => a.implemented && a.category === categoryId
    ).length;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Activity Type" size="lg">
      <div className="p-6 flex flex-col" style={{ height: 'calc(85vh - 80px)' }}>
        {/* Search Bar */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Category Tabs - Wrap instead of scroll */}
        <div className="flex flex-wrap gap-2 mb-4">
          {ACTIVITY_CATEGORIES.map((category) => {
            const count = getCategoryCount(category.id);
            const isSelected = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border',
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                )}
              >
                <span>{category.icon}</span>
                <span>{category.label}</span>
                <span className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full font-semibold',
                  isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Recent Activities */}
        {recentActivityItems.length > 0 && !searchQuery && selectedCategory === 'all' && (
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Recently Used
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {recentActivityItems.map((activity) => (
                <button
                  key={activity.type}
                  onClick={() => handleSelectType(activity.type)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 transition-all whitespace-nowrap"
                >
                  <span className="text-xl">{activity.icon}</span>
                  <span className="text-sm font-medium text-blue-700">{activity.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Activity Grid - Scrollable area with fixed height */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {filteredActivities.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 pr-1">
              {filteredActivities.map((activity) => (
                <button
                  key={activity.type}
                  onClick={() => handleSelectType(activity.type)}
                  disabled={!activity.implemented}
                  className={cn(
                    'p-3 rounded-lg border-2 transition-all text-left',
                    activity.implemented
                      ? 'border-gray-200 hover:border-blue-500 hover:bg-blue-50 cursor-pointer'
                      : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
                  )}
                >
                  <div className="text-2xl mb-1">{activity.icon}</div>
                  <div className="text-xs font-medium text-gray-900 leading-tight">
                    {activity.label}
                  </div>
                  {!activity.implemented && (
                    <div className="text-xs text-gray-400 mt-0.5">Coming soon</div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <svg className="h-12 w-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">No activities found</p>
              <p className="text-xs text-gray-400 mt-1">Try a different search or category</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t flex justify-between items-center">
          <span className="text-xs text-gray-400">
            {filteredActivities.filter(a => a.implemented).length} of {activityTypes.filter(a => a.implemented).length} activities
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
