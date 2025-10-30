'use client';

import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import type { ActivityTemplate, ArticleType } from '@/lib/schemas/curriculum';
import { useCreateActivityTemplate, useUpdateActivityTemplate } from '@/lib/hooks/useTemplates';
import { getActivityFormComponent } from './forms';

interface TemplateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  template?: ActivityTemplate | null;
}

const activityTypes: { value: ArticleType; label: string }[] = [
  { value: 'show_letter_or_word', label: 'Show Letter or Word' },
  { value: 'tap_letter_in_word', label: 'Tap Letter in Word' },
  { value: 'trace_letter', label: 'Trace Letter' },
  { value: 'pop_balloons_with_letter', label: 'Pop Balloons with Letter' },
  { value: 'break_time_minigame', label: 'Break Time Mini-Game' },
  { value: 'build_word_from_letters', label: 'Build Word from Letters' },
  { value: 'multiple_choice_question', label: 'Multiple Choice Question' },
  { value: 'drag_items_to_target', label: 'Drag Items to Target' },
  { value: 'catch_fish_with_letter', label: 'Catch Fish with Letter' },
  { value: 'add_pizza_toppings_with_letter', label: 'Add Pizza Toppings with Letter' },
];

// Helper to generate slug from name
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '_')
    .replace(/^-+|-+$/g, '');
}

export function TemplateFormModal({ isOpen, onClose, template }: TemplateFormModalProps) {
  const isEdit = Boolean(template);
  const { mutate: createTemplate, isPending: isCreating } = useCreateActivityTemplate();
  const { mutate: updateTemplate, isPending: isUpdating } = useUpdateActivityTemplate();

  const [formData, setFormData] = useState({
    nameEn: template?.name.en || '',
    type: template?.type || 'tap_letter_in_word' as ArticleType,
    instructionTemplateEn: template?.instruction_template.en || '',
    instructionTemplateAr: template?.instruction_template.ar || '',
    configTemplate: template?.config_template || {},
  });

  useEffect(() => {
    if (template) {
      setFormData({
        nameEn: template.name.en,
        type: template.type,
        instructionTemplateEn: template.instruction_template.en,
        instructionTemplateAr: template.instruction_template.ar,
        configTemplate: template.config_template,
      });
    } else {
      setFormData({
        nameEn: '',
        type: 'tap_letter_in_word',
        instructionTemplateEn: '',
        instructionTemplateAr: '',
        configTemplate: {},
      });
    }
  }, [template]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      id: template?.id || slugify(formData.nameEn),
      name: {
        en: formData.nameEn,
        ar: formData.nameEn, // Use English name for Arabic if not provided
      },
      type: formData.type,
      instruction_template: {
        en: formData.instructionTemplateEn,
        ar: formData.instructionTemplateAr,
      },
      config_template: formData.configTemplate,
    };

    if (isEdit && template) {
      updateTemplate(
        { id: template.id, data },
        { onSuccess: () => onClose() }
      );
    } else {
      createTemplate(data as any, { onSuccess: () => onClose() });
    }
  };

  const handleClose = () => {
    setFormData({
      nameEn: '',
      type: 'tap_letter_in_word',
      instructionTemplateEn: '',
      instructionTemplateAr: '',
      configTemplate: {},
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEdit ? 'Edit Template' : 'New Template'}
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Template Name *
          </label>
          <input
            type="text"
            required
            value={formData.nameEn}
            onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Tap the Letter"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Activity Type *
          </label>
          <select
            required
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as ArticleType })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {activityTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instruction (English) *
            </label>
            <textarea
              required
              value={formData.instructionTemplateEn}
              onChange={(e) => setFormData({ ...formData, instructionTemplateEn: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="Tap the letter"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instruction (Arabic)
            </label>
            <textarea
              dir="rtl"
              value={formData.instructionTemplateAr}
              onChange={(e) => setFormData({ ...formData, instructionTemplateAr: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="اضغط على الحرف (اختياري)"
              rows={2}
            />
          </div>
        </div>

        {/* Dynamic Activity Form based on type */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Activity Configuration</h4>
          <p className="text-xs text-gray-600 mb-3">
            Fill in the form below. The system will automatically extract any variables you need.
          </p>
          {(() => {
            const ActivityForm = getActivityFormComponent(formData.type);
            return (
              <ActivityForm
                config={formData.configTemplate}
                onChange={(config) => setFormData({ ...formData, configTemplate: config })}
              />
            );
          })()}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
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
              ? 'Update Template'
              : 'Create Template'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
