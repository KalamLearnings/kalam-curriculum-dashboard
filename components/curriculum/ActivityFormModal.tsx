'use client';

import { useState, useEffect, useRef } from 'react';
import { Modal } from '../ui/Modal';
import type { Article, CreateArticle, UpdateArticle, ArticleType, ActivityTemplate, Topic, Node } from '@/lib/schemas/curriculum';
import { ACTIVITY_TYPE_LABELS } from '@kalam/curriculum-schemas';
import { useCreateActivity, useUpdateActivity } from '@/lib/hooks/useActivities';
import { useActivityTemplates, useInstantiateTemplate } from '@/lib/hooks/useTemplates';
import { useTopic } from '@/lib/hooks/useTopics';
import { getActivityFormComponent } from './forms';

interface ActivityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  curriculumId: string;
  nodeId: string;
  node?: Node | null; // Add the full node object
  topic?: Topic | null;
  activity?: Article | null;
}

const activityTypes: { value: ArticleType; label: string }[] = [
  { value: 'show_letter_or_word', label: ACTIVITY_TYPE_LABELS.show_letter_or_word },
  { value: 'tap_letter_in_word', label: ACTIVITY_TYPE_LABELS.tap_letter_in_word },
  { value: 'trace_letter', label: ACTIVITY_TYPE_LABELS.trace_letter },
  { value: 'pop_balloons_with_letter', label: ACTIVITY_TYPE_LABELS.pop_balloons_with_letter },
  { value: 'break_time_minigame', label: ACTIVITY_TYPE_LABELS.break_time_minigame },
  { value: 'build_word_from_letters', label: ACTIVITY_TYPE_LABELS.build_word_from_letters },
  { value: 'multiple_choice_question', label: ACTIVITY_TYPE_LABELS.multiple_choice_question },
  { value: 'drag_items_to_target', label: ACTIVITY_TYPE_LABELS.drag_items_to_target },
  { value: 'catch_fish_with_letter', label: ACTIVITY_TYPE_LABELS.catch_fish_with_letter },
  { value: 'add_pizza_toppings_with_letter', label: ACTIVITY_TYPE_LABELS.add_pizza_toppings_with_letter },
];

export function ActivityFormModal({
  isOpen,
  onClose,
  curriculumId,
  nodeId,
  node: nodeProp,
  topic: topicProp,
  activity,
}: ActivityFormModalProps) {
  const isEdit = Boolean(activity);
  const { mutate: createActivity, isPending: isCreating } = useCreateActivity();
  const { mutate: updateActivity, isPending: isUpdating } = useUpdateActivity();
  const { mutate: instantiateTemplate, isPending: isInstantiating } = useInstantiateTemplate();
  const { data: templates, isLoading: isLoadingTemplates } = useActivityTemplates();

  // Get the topic_id from the node prop
  const topicId = nodeProp?.topic_id || null;

  // Fetch the full topic data using the node's topic_id
  const { data: fetchedTopic, isLoading: isLoadingTopic } = useTopic(curriculumId, topicId);

  // Use fetched topic if available, otherwise fall back to prop
  const topic = fetchedTopic || topicProp;

  // Debug logging
  console.log('ActivityFormModal topic:', topic);
  console.log('Has letter?', topic?.letter || (topic as any)?.letters);

  const [useTemplate, setUseTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ActivityTemplate | null>(null);
  const [templateVariables, setTemplateVariables] = useState<Record<string, any>>({});

  const [formData, setFormData] = useState({
    type: activity?.type || 'show_letter_or_word' as ArticleType,
    instructionEn: activity?.instruction.en || '',
    instructionAr: activity?.instruction.ar || '',
    audioUrl: activity?.instruction.audio_url || '',
    config: activity?.config || {} as any,
  });

  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [generatedAudioBlob, setGeneratedAudioBlob] = useState<{ blob: Blob; blobUrl: string; filePath: string } | null>(null);
  const [existingAudioUrl, setExistingAudioUrl] = useState<string | null>(
    activity?.instruction.audio_url || null
  );

  // Refs for instruction textareas (for placeholder insertion)
  const enTextareaRef = useRef<HTMLTextAreaElement>(null);
  const arTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Insert placeholder at cursor position
  const insertPlaceholder = (placeholder: string, lang: 'en' | 'ar') => {
    const textareaRef = lang === 'en' ? enTextareaRef : arTextareaRef;
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = lang === 'en' ? formData.instructionEn : formData.instructionAr;
    const newText = text.substring(0, start) + placeholder + text.substring(end);

    setFormData({
      ...formData,
      [lang === 'en' ? 'instructionEn' : 'instructionAr']: newText
    });

    // Set cursor position after the inserted placeholder
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + placeholder.length, start + placeholder.length);
    }, 0);
  };

  // Update form when activity prop changes
  useEffect(() => {
    if (activity) {
      setFormData({
        type: activity.type,
        instructionEn: activity.instruction.en,
        instructionAr: activity.instruction.ar || '',
        audioUrl: activity.instruction.audio_url || '',
        config: activity.config || {} as any,
      });
      setExistingAudioUrl(activity.instruction.audio_url || null);
      setGeneratedAudioBlob(null);
      setUseTemplate(false);
      setSelectedTemplate(null);
      setTemplateVariables({});
    } else {
      setFormData({
        type: 'show_letter_or_word',
        instructionEn: '',
        instructionAr: '',
        audioUrl: '',
        config: {},
      });
      setExistingAudioUrl(null);
      setGeneratedAudioBlob(null);
    }
  }, [activity]);

  // Clean up blob URLs when component unmounts or blob changes
  useEffect(() => {
    return () => {
      if (generatedAudioBlob?.blobUrl) {
        URL.revokeObjectURL(generatedAudioBlob.blobUrl);
      }
    };
  }, [generatedAudioBlob]);

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

  const handleGenerateAudio = async () => {
    if (!formData.instructionEn.trim()) {
      alert('Please enter an English instruction first');
      return;
    }

    setIsGeneratingAudio(true);
    try {
      const { getEnvironmentBaseUrl, getEdgeFunctionAuthHeaders, createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const response = await fetch(`${getEnvironmentBaseUrl()}/functions/v1/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getEdgeFunctionAuthHeaders(session.access_token),
        },
        body: JSON.stringify({
          text: formData.instructionEn,
          language: 'en',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate audio');
      }

      const data = await response.json();

      // Convert base64 to blob
      const binaryString = atob(data.audio_data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: data.content_type });
      const blobUrl = URL.createObjectURL(blob);

      // Clean up old blob URL if exists
      if (generatedAudioBlob?.blobUrl) {
        URL.revokeObjectURL(generatedAudioBlob.blobUrl);
      }

      setGeneratedAudioBlob({
        blob,
        blobUrl,
        filePath: data.suggested_file_path,
      });
      setExistingAudioUrl(null); // Clear existing URL when generating new audio

    } catch (error) {
      console.error('Error generating audio:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate audio');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const uploadAudioToStorage = async (blob: Blob, filePath: string): Promise<string> => {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();

    const { data, error } = await supabase.storage
      .from('curriculum-audio')
      .upload(filePath, blob, {
        contentType: 'audio/mpeg',
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Storage upload error:', error);
      throw new Error(`Failed to upload audio: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('curriculum-audio')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    try {
      // Upload audio blob to storage if a new one was generated
      let audioUrl = existingAudioUrl;
      if (generatedAudioBlob) {
        audioUrl = await uploadAudioToStorage(
          generatedAudioBlob.blob,
          generatedAudioBlob.filePath
        );
      }

      // Otherwise, create/update activity normally
      const data: CreateArticle | UpdateArticle = {
        type: formData.type,
        instruction: {
          en: formData.instructionEn,
          ar: formData.instructionAr,
          ...(audioUrl ? { audio_url: audioUrl } : {}),
        },
        config: formData.config,
        // Only include sequence_number for edits (backend auto-generates for creates)
        ...(isEdit && activity?.sequence_number ? { sequence_number: activity.sequence_number } : {}),
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
    } catch (error) {
      console.error('Error submitting activity:', error);
      alert(error instanceof Error ? error.message : 'Failed to save activity');
    }
  };

  const handleClose = () => {
    setFormData({
      type: 'show_letter_or_word',
      instructionEn: '',
      instructionAr: '',
      audioUrl: '',
      config: {},
    });
    setGeneratedAudioBlob(null);
    setExistingAudioUrl(null);
    setUseTemplate(false);
    setSelectedTemplate(null);
    setTemplateVariables({});
    onClose();
  };

  // Show loading state while fetching topic data
  const isLoadingData = topicId && isLoadingTopic;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEdit ? 'Edit Activity' : 'New Activity'}
    >
      {isLoadingData ? (
        <div className="p-6 flex items-center justify-center">
          <div className="text-gray-500">Loading topic data...</div>
        </div>
      ) : (
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
              <p className="text-xs text-gray-500 mb-2">
                This text will be converted to audio and played when the activity loads in the app
              </p>
              <textarea
                ref={enTextareaRef}
                required
                value={formData.instructionEn}
                onChange={(e) =>
                  setFormData({ ...formData, instructionEn: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter English instruction"
                rows={2}
              />
              {/* Template Placeholder Buttons */}
              {(topic?.letter || (topic as any)?.letters) && (() => {
                const letterData = topic?.letter || (topic as any)?.letters;
                return (
                  <div className="flex gap-2 flex-wrap mt-2">
                    <span className="text-xs text-gray-500">Insert:</span>
                    <button
                      type="button"
                      onClick={() => insertPlaceholder('{{letter}}', 'en')}
                      className="text-xs px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200"
                      title={`Letter character: ${letterData.letter}`}
                    >
                      {'{{letter}}'} ({letterData.letter})
                    </button>
                    <button
                      type="button"
                      onClick={() => insertPlaceholder('{{letter_name}}', 'en')}
                      className="text-xs px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200"
                      title={`Letter name: ${letterData.name_arabic || letterData.name_english}`}
                    >
                      {'{{letter_name}}'} ({letterData.name_arabic || letterData.name_english})
                    </button>
                    {letterData.letter_sound && (
                      <button
                        type="button"
                        onClick={() => insertPlaceholder('{{letter_sound}}', 'en')}
                        className="text-xs px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200"
                        title={`Letter sound: ${letterData.letter_sound}`}
                      >
                        {'{{letter_sound}}'} ({letterData.letter_sound})
                      </button>
                    )}
                  </div>
                );
              })()}
              {/* Generate/Regenerate Audio Button */}
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={handleGenerateAudio}
                  disabled={!formData.instructionEn.trim() || isGeneratingAudio}
                  className="px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-300 rounded hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isGeneratingAudio ? (
                    <>
                      <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                      {(generatedAudioBlob || existingAudioUrl) ? 'Regenerate' : 'Generate'} Audio
                    </>
                  )}
                </button>
                {(generatedAudioBlob || existingAudioUrl) && (
                  <button
                    type="button"
                    onClick={() => {
                      const audioUrl = generatedAudioBlob?.blobUrl || existingAudioUrl;
                      if (audioUrl) {
                        const audio = new Audio(audioUrl);
                        audio.play();
                      }
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-300 rounded hover:bg-green-100 flex items-center gap-1.5"
                  >
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                    Play
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instruction (Arabic)
              </label>
              <textarea
                ref={arTextareaRef}
                dir="rtl"
                value={formData.instructionAr}
                onChange={(e) =>
                  setFormData({ ...formData, instructionAr: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="أدخل التعليمات بالعربية (اختياري)"
                rows={2}
              />
              {/* Template Placeholder Buttons */}
              {(topic?.letter || (topic as any)?.letters) && (() => {
                const letterData = topic?.letter || (topic as any)?.letters;
                return (
                  <div className="flex gap-2 flex-wrap mt-2">
                    <span className="text-xs text-gray-500">Insert:</span>
                    <button
                      type="button"
                      onClick={() => insertPlaceholder('{{letter}}', 'ar')}
                      className="text-xs px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200"
                      title={`Letter character: ${letterData.letter}`}
                    >
                      {'{{letter}}'} ({letterData.letter})
                    </button>
                    <button
                      type="button"
                      onClick={() => insertPlaceholder('{{letter_name}}', 'ar')}
                      className="text-xs px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200"
                      title={`Letter name: ${letterData.name_arabic || letterData.name_english}`}
                    >
                      {'{{letter_name}}'} ({letterData.name_arabic || letterData.name_english})
                    </button>
                    {letterData.letter_sound && (
                      <button
                        type="button"
                        onClick={() => insertPlaceholder('{{letter_sound}}', 'ar')}
                        className="text-xs px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200"
                        title={`Letter sound: ${letterData.letter_sound}`}
                      >
                        {'{{letter_sound}}'} ({letterData.letter_sound})
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Dynamic Activity Form based on type */}
            {(() => {
              const ActivityForm = getActivityFormComponent(formData.type);
              return (
                <ActivityForm
                  config={formData.config}
                  onChange={(config) => setFormData({ ...formData, config })}
                  topic={topic}
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
      )}
    </Modal>
  );
}
