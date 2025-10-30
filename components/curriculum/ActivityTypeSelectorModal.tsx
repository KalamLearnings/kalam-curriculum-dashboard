'use client';

import { Modal } from '../ui/Modal';
import type { ArticleType } from '@/lib/schemas/curriculum';
import { ACTIVITY_TYPES, getActivityIcon } from '@/lib/constants/curriculum';

interface ActivityTypeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTypeSelected: (type: ArticleType) => void;
}

// Activity types with their metadata
const activityTypes: Array<{
  type: ArticleType;
  label: string;
  icon: string;
  implemented: boolean;
}> = ACTIVITY_TYPES.map(({ value, label }) => ({
  type: value,
  label,
  icon: getActivityIcon(value),
  implemented: [
    'show_letter_or_word',
    'tap_letter_in_word',
    'trace_letter',
    'pop_balloons_with_letter',
    'break_time_minigame',
    'build_word_from_letters',
    'multiple_choice_question',
    'catch_fish_with_letter',
  ].includes(value),
}));

export function ActivityTypeSelectorModal({
  isOpen,
  onClose,
  onTypeSelected,
}: ActivityTypeSelectorModalProps) {
  const handleSelectType = (type: ArticleType) => {
    onTypeSelected(type);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Activity Type">
      <div className="p-6">
        <p className="text-sm text-gray-600 mb-4">
          Choose the type of activity you want to create
        </p>

        <div className="grid grid-cols-2 gap-3">
          {activityTypes.map((activity) => (
            <button
              key={activity.type}
              onClick={() => handleSelectType(activity.type)}
              disabled={!activity.implemented}
              className={`
                p-4 rounded-lg border-2 transition-all
                ${
                  activity.implemented
                    ? 'border-gray-200 hover:border-blue-500 hover:bg-blue-50 cursor-pointer'
                    : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
                }
              `}
            >
              <div className="text-3xl mb-2">{activity.icon}</div>
              <div className="text-sm font-medium text-gray-900">
                {activity.label}
              </div>
              {!activity.implemented && (
                <div className="text-xs text-gray-400 mt-1">Coming soon</div>
              )}
            </button>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
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
