'use client';

import { useState } from 'react';
import { Modal } from '../ui/Modal';
import type { Article, CreateArticle, UpdateArticle, ArticleType } from '@/lib/schemas/curriculum';
import { useCreateActivity, useUpdateActivity } from '@/lib/hooks/useActivities';
import { getActivityFormComponent } from './forms';

interface ActivityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  curriculumId: string;
  nodeId: string;
  activity?: Article | null;
}

const activityTypes: { value: ArticleType; label: string }[] = [
  { value: 'intro', label: 'Intro' },
  { value: 'tap', label: 'Tap' },
  { value: 'write', label: 'Write' },
  { value: 'word_builder', label: 'Word Builder' },
  { value: 'name_builder', label: 'Name Builder' },
  { value: 'balloon', label: 'Balloon' },
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'drag_drop', label: 'Drag & Drop' },
  { value: 'fishing', label: 'Fishing' },
  { value: 'pizza', label: 'Pizza' },
  { value: 'break', label: 'Break' },
];

export function ActivityFormModal({
  isOpen,
  onClose,
  curriculumId,
  nodeId,
  activity,
}: ActivityFormModalProps) {
  const isEdit = Boolean(activity);
  const { mutate: createActivity, isPending: isCreating } = useCreateActivity();
  const { mutate: updateActivity, isPending: isUpdating } = useUpdateActivity();

  const [formData, setFormData] = useState({
    type: activity?.type || 'intro' as ArticleType,
    instructionEn: activity?.instruction.en || '',
    instructionAr: activity?.instruction.ar || '',
    config: activity?.config || {},
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: CreateArticle | UpdateArticle = {
      type: formData.type,
      instruction: {
        en: formData.instructionEn,
        ar: formData.instructionAr,
      },
      config: formData.config,
    };

    if (isEdit && activity) {
      updateActivity(
        {
          curriculumId,
          nodeId,
          activityId: activity.id,
          data: data as UpdateArticle,
        },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    } else {
      createActivity(
        {
          curriculumId,
          nodeId,
          data: data as CreateArticle,
        },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    }
  };

  const handleClose = () => {
    setFormData({
      type: 'intro',
      instructionEn: '',
      instructionAr: '',
      config: {},
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEdit ? 'Edit Activity' : 'New Activity'}
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type *
          </label>
          <select
            required
            value={formData.type}
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value as ArticleType })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {activityTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Instruction (English) *
          </label>
          <textarea
            required
            value={formData.instructionEn}
            onChange={(e) =>
              setFormData({ ...formData, instructionEn: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter English instruction"
            rows={2}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Instruction (Arabic) *
          </label>
          <textarea
            required
            dir="rtl"
            value={formData.instructionAr}
            onChange={(e) =>
              setFormData({ ...formData, instructionAr: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="أدخل التعليمات بالعربية"
            rows={2}
          />
        </div>

        {/* Dynamic Activity Form based on type */}
        {(() => {
          const ActivityForm = getActivityFormComponent(formData.type);
          return (
            <ActivityForm
              config={formData.config}
              onChange={(config) => setFormData({ ...formData, config })}
            />
          );
        })()}

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isCreating || isUpdating}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating || isUpdating
              ? 'Saving...'
              : isEdit
              ? 'Update Activity'
              : 'Create Activity'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
