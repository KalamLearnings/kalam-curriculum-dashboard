'use client';

import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import type { Article, CreateArticle, UpdateArticle, ArticleType, ActivityTemplate } from '@/lib/schemas/curriculum';
import { useCreateActivity, useUpdateActivity } from '@/lib/hooks/useActivities';
import { useActivityTemplates, useInstantiateTemplate } from '@/lib/hooks/useTemplates';
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
  { value: 'presentation', label: 'Presentation' },
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
  const { mutate: instantiateTemplate, isPending: isInstantiating } = useInstantiateTemplate();
  const { data: templates, isLoading: isLoadingTemplates } = useActivityTemplates();

  const [useTemplate, setUseTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ActivityTemplate | null>(null);
  const [templateVariables, setTemplateVariables] = useState<Record<string, any>>({});

  const [formData, setFormData] = useState({
    type: activity?.type || 'intro' as ArticleType,
    instructionEn: activity?.instruction.en || '',
    instructionAr: activity?.instruction.ar || '',
    config: activity?.config || {},
  });

  // Update form when activity prop changes
  useEffect(() => {
    if (activity) {
      setFormData({
        type: activity.type,
        instructionEn: activity.instruction.en,
        instructionAr: activity.instruction.ar,
        config: activity.config || {},
      });
      setUseTemplate(false);
      setSelectedTemplate(null);
      setTemplateVariables({});
    } else {
      setFormData({
        type: 'intro',
        instructionEn: '',
        instructionAr: '',
        config: {},
      });
    }
  }, [activity]);

  // Reset template variables when template changes
  useEffect(() => {
    if (selectedTemplate) {
      const initialVariables: Record<string, any> = {};
      selectedTemplate.required_fields.forEach(field => {
        initialVariables[field] = '';
      });
      setTemplateVariables(initialVariables);
    }
  }, [selectedTemplate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // If using template, instantiate it
    if (!isEdit && useTemplate && selectedTemplate) {
      instantiateTemplate(
        {
          template_id: selectedTemplate.id,
          variables: templateVariables,
          node_id: nodeId,
        },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
      return;
    }

    // Otherwise, create/update activity normally
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
    setUseTemplate(false);
    setSelectedTemplate(null);
    setTemplateVariables({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEdit ? 'Edit Activity' : 'New Activity'}
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Template Toggle (only for new activities) */}
        {!isEdit && (
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
            <input
              type="checkbox"
              id="use-template"
              checked={useTemplate}
              onChange={(e) => {
                setUseTemplate(e.target.checked);
                if (!e.target.checked) {
                  setSelectedTemplate(null);
                  setTemplateVariables({});
                }
              }}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="use-template" className="text-sm font-medium text-gray-700 cursor-pointer">
              Create from template
            </label>
          </div>
        )}

        {/* Template Selection */}
        {!isEdit && useTemplate && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Template *
            </label>
            {isLoadingTemplates ? (
              <div className="text-sm text-gray-500">Loading templates...</div>
            ) : (
              <select
                required
                value={selectedTemplate?.id || ''}
                onChange={(e) => {
                  const template = templates?.find(t => t.id === e.target.value);
                  setSelectedTemplate(template || null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Select a template --</option>
                {templates?.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name.en} ({template.type})
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Template Variables */}
        {!isEdit && useTemplate && selectedTemplate && (
          <div className="space-y-3 p-4 bg-blue-50 rounded-md border border-blue-200">
            <h4 className="text-sm font-medium text-blue-900">Template Variables</h4>
            {selectedTemplate.required_fields.map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field} *
                </label>
                <input
                  type="text"
                  required
                  value={templateVariables[field] || ''}
                  onChange={(e) =>
                    setTemplateVariables({
                      ...templateVariables,
                      [field]: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`Enter ${field}`}
                />
              </div>
            ))}
          </div>
        )}

        {/* Manual Activity Form (show only if not using template) */}
        {(!useTemplate || isEdit) && (
          <>
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
          </>
        )}

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
            disabled={isCreating || isUpdating || isInstantiating}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating || isUpdating || isInstantiating
              ? 'Saving...'
              : isEdit
              ? 'Update Activity'
              : useTemplate
              ? 'Create from Template'
              : 'Create Activity'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
