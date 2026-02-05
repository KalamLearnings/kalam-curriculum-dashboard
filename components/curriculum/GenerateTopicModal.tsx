'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FormField, TextInput, TextArea, NumberInput, Select } from './forms/FormField';
import { useLetters } from '@/lib/hooks/useLetters';
import { generateTopicPreview } from '@/lib/api/curricula';
import type { GenerateTopicRequest, GenerateTopicResponse, GeneratedTopic } from '@/lib/api/curricula';
import { toast } from 'sonner';
import { X, Sparkles, AlertTriangle, ChevronDown, ChevronUp, Check, RefreshCw } from 'lucide-react';
import {
  AIGradientBorder,
  AIGeneratingOverlay,
  AIButton,
  AISparkles,
  AnimatedReveal,
} from '@/components/ui/AIEffects';

// ============================================================================
// Types
// ============================================================================

interface GenerateTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  curriculumId: string;
  onAccept: (generated: GeneratedTopic) => void;
}

interface FormState {
  titleEn: string;
  titleAr: string;
  learningObjective: string;
  letterId: string;
  nodeCount: number;
  activitiesMin: number;
  activitiesMax: number;
}

type Phase = 'form' | 'generating' | 'preview';

const defaultForm: FormState = {
  titleEn: '',
  titleAr: '',
  learningObjective: '',
  letterId: '',
  nodeCount: 3,
  activitiesMin: 5,
  activitiesMax: 7,
};

// ============================================================================
// Main Modal
// ============================================================================

export function GenerateTopicModal({
  isOpen,
  onClose,
  curriculumId,
  onAccept,
}: GenerateTopicModalProps) {
  const { letters, loading: lettersLoading } = useLetters();

  const [form, setForm] = useState<FormState>(defaultForm);
  const [phase, setPhase] = useState<Phase>('form');
  const [preview, setPreview] = useState<GenerateTopicResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && phase !== 'generating') handleClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, phase]);

  const updateForm = useCallback((updates: Partial<FormState>) => {
    setForm(prev => ({ ...prev, ...updates }));
  }, []);

  const handleClose = () => {
    if (phase === 'generating') return; // Don't close while generating
    setForm(defaultForm);
    setPreview(null);
    setError(null);
    setPhase('form');
    onClose();
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.titleEn.trim()) {
      toast.error('Topic title (English) is required');
      return;
    }
    if (!form.learningObjective.trim()) {
      toast.error('Learning objective is required');
      return;
    }
    if (form.activitiesMin > form.activitiesMax) {
      toast.error('Min activities cannot be greater than max activities');
      return;
    }

    setPhase('generating');
    setError(null);
    setPreview(null);

    try {
      const request: GenerateTopicRequest = {
        curriculum_id: curriculumId,
        topic_title: {
          en: form.titleEn.trim(),
          ...(form.titleAr.trim() ? { ar: form.titleAr.trim() } : {}),
        },
        learning_objective: form.learningObjective.trim(),
        ...(form.letterId ? { letter_id: form.letterId } : {}),
        node_count: form.nodeCount,
        activities_per_node_min: form.activitiesMin,
        activities_per_node_max: form.activitiesMax,
      };

      const result = await generateTopicPreview(request);
      setPreview(result);
      setPhase('preview');

      const totalActivities = result.generated.nodes.reduce(
        (sum, n) => sum + n.activities.length, 0
      );
      toast.success(
        `Generated ${result.generated.nodes.length} nodes with ${totalActivities} activities`
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate topic';
      setError(message);
      setPhase('form');
      toast.error(message);
    }
  };

  const handleAccept = () => {
    if (preview) {
      onAccept(preview.generated);
      handleClose();
    }
  };

  const handleRegenerate = () => {
    setPreview(null);
    setPhase('form');
  };

  const letterOptions = [
    { value: '', label: 'None (auto-detect)' },
    ...letters.map(l => ({
      value: l.id,
      label: `${l.letter} - ${l.name_english}`,
    })),
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Animated backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal with gradient border */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', duration: 0.5, bounce: 0.15 }}
        className="relative max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col"
      >
        <AIGradientBorder active={phase === 'generating'} rounded="rounded-xl">
          {/* Header */}
          <div className="relative flex items-center justify-between px-6 py-4 border-b border-gray-200 rounded-t-xl overflow-hidden">
            {/* Subtle gradient behind header */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-50 via-white to-indigo-50" />

            <div className="relative flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Generate Topic with AI
              </h2>
            </div>

            <button
              onClick={handleClose}
              disabled={phase === 'generating'}
              className="relative text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content area with phase transitions */}
          <div className="overflow-y-auto flex-1 max-h-[calc(90vh-65px)]">
            <AnimatePresence mode="wait">
              {phase === 'form' && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <GenerateForm
                    form={form}
                    updateForm={updateForm}
                    letterOptions={letterOptions}
                    lettersLoading={lettersLoading}
                    error={error}
                    onSubmit={handleGenerate}
                    onCancel={handleClose}
                  />
                </motion.div>
              )}

              {phase === 'generating' && (
                <motion.div
                  key="generating"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <AIGeneratingOverlay
                    message="Generating your topic..."
                    subMessage="AI is creating nodes and activities. This may take 30-60 seconds."
                  />
                </motion.div>
              )}

              {phase === 'preview' && preview && (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                >
                  <GeneratedPreview
                    preview={preview}
                    onAccept={handleAccept}
                    onRegenerate={handleRegenerate}
                    onCancel={handleClose}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </AIGradientBorder>
      </motion.div>
    </div>
  );
}

// ============================================================================
// Form Section
// ============================================================================

function GenerateForm({
  form,
  updateForm,
  letterOptions,
  lettersLoading,
  error,
  onSubmit,
  onCancel,
}: {
  form: FormState;
  updateForm: (updates: Partial<FormState>) => void;
  letterOptions: { value: string; label: string }[];
  lettersLoading: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="p-6 space-y-4">
      <p className="text-sm text-gray-500">
        Describe what you want to generate and the AI will create a complete topic
        with nodes and activities for review.
      </p>

      {/* Title EN */}
      <FormField label="Topic Title (English)" required>
        <TextInput
          value={form.titleEn}
          onChange={(value) => updateForm({ titleEn: value })}
          placeholder="e.g., Letter Ba - Initial Form"
        />
      </FormField>

      {/* Title AR */}
      <FormField label="Topic Title (Arabic)" hint="Optional - AI can generate this">
        <TextInput
          value={form.titleAr}
          onChange={(value) => updateForm({ titleAr: value })}
          placeholder="e.g., حرف الباء - الشكل الأول"
          dir="rtl"
        />
      </FormField>

      {/* Learning Objective */}
      <FormField
        label="Learning Objective"
        required
        hint="Describe what the child should learn from this topic"
      >
        <TextArea
          value={form.learningObjective}
          onChange={(value) => updateForm({ learningObjective: value })}
          placeholder="e.g., Children will learn to recognize and write the letter Ba in its initial form, identify it in words, and practice its pronunciation."
          rows={3}
        />
      </FormField>

      {/* Letter Selection */}
      <FormField label="Letter" hint="Optional - associate with a specific Arabic letter">
        <Select
          value={form.letterId}
          onChange={(value) => updateForm({ letterId: value })}
          options={lettersLoading ? [{ value: '', label: 'Loading letters...' }] : letterOptions}
        />
      </FormField>

      {/* Node Count */}
      <FormField label="Number of Nodes" hint="How many nodes (lesson stages) to generate">
        <NumberInput
          value={form.nodeCount}
          onChange={(value) => updateForm({ nodeCount: Math.max(1, Math.min(6, value)) })}
          min={1}
          max={6}
        />
      </FormField>

      {/* Activities Range */}
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Min Activities per Node">
          <NumberInput
            value={form.activitiesMin}
            onChange={(value) => updateForm({ activitiesMin: Math.max(1, Math.min(10, value)) })}
            min={1}
            max={10}
          />
        </FormField>
        <FormField label="Max Activities per Node">
          <NumberInput
            value={form.activitiesMax}
            onChange={(value) => updateForm({ activitiesMax: Math.max(1, Math.min(15, value)) })}
            min={1}
            max={15}
          />
        </FormField>
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md"
        >
          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <AIButton
          disabled={!form.titleEn.trim() || !form.learningObjective.trim()}
        >
          <Sparkles className="w-4 h-4" />
          Generate Preview
        </AIButton>
      </div>
    </form>
  );
}

// ============================================================================
// Preview Section
// ============================================================================

const NODE_TYPE_COLORS: Record<string, string> = {
  intro: 'bg-blue-100 text-blue-700 border-blue-200',
  lesson: 'bg-green-100 text-green-700 border-green-200',
  practice: 'bg-amber-100 text-amber-700 border-amber-200',
  review: 'bg-purple-100 text-purple-700 border-purple-200',
  boss: 'bg-red-100 text-red-700 border-red-200',
};

function GeneratedPreview({
  preview,
  onAccept,
  onRegenerate,
  onCancel,
}: {
  preview: GenerateTopicResponse;
  onAccept: () => void;
  onRegenerate: () => void;
  onCancel: () => void;
}) {
  const { generated, validation } = preview;
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set([0]));

  const toggleNode = (index: number) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const totalActivities = generated.nodes.reduce(
    (sum, n) => sum + n.activities.length, 0
  );

  return (
    <div className="p-6 space-y-4">
      {/* Summary card with subtle gradient */}
      <AnimatedReveal>
        <div className="relative overflow-hidden rounded-lg border border-purple-100 bg-gradient-to-br from-purple-50/80 via-white to-indigo-50/80 p-4">
          <AISparkles count={4} className="opacity-30" />
          <div className="relative">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              {generated.title.en}
              {generated.title.ar && (
                <span className="text-gray-500 font-normal mr-2" dir="rtl">
                  {' '}({generated.title.ar})
                </span>
              )}
            </h3>
            {generated.description?.en && (
              <p className="text-xs text-gray-600 mb-2">{generated.description.en}</p>
            )}
            <div className="flex gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                {generated.nodes.length} nodes
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                {totalActivities} activities
              </span>
            </div>
          </div>
        </div>
      </AnimatedReveal>

      {/* Warnings */}
      {validation.warnings.length > 0 && (
        <AnimatedReveal delay={0.1}>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                {validation.warnings.length} validation warning{validation.warnings.length !== 1 ? 's' : ''}
              </span>
            </div>
            <ul className="text-xs text-yellow-700 space-y-1 ml-6 list-disc">
              {validation.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        </AnimatedReveal>
      )}

      {/* Nodes */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {generated.nodes.map((node, ni) => (
          <AnimatedReveal key={ni} delay={0.05 * (ni + 1)}>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Node Header */}
              <button
                type="button"
                onClick={() => toggleNode(ni)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium border ${NODE_TYPE_COLORS[node.type] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                    {node.type}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {node.title.en}
                  </span>
                  <span className="text-xs text-gray-400">
                    ({node.activities.length} activities)
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: expandedNodes.has(ni) ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </motion.div>
              </button>

              {/* Activities List - animated expand/collapse */}
              <AnimatePresence>
                {expandedNodes.has(ni) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-gray-200 bg-gray-50/50 px-4 py-2 space-y-1.5">
                      {node.activities.map((activity, ai) => (
                        <motion.div
                          key={ai}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: ai * 0.03 }}
                          className="flex items-start gap-2 text-xs bg-white rounded-md px-3 py-2 border border-gray-100 shadow-sm"
                        >
                          <span className="text-gray-400 font-mono shrink-0 mt-0.5">
                            {ai + 1}.
                          </span>
                          <div className="flex-1 min-w-0">
                            <span className="inline-block bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[10px] font-medium mb-1">
                              {activity.type}
                            </span>
                            <p className="text-gray-700 truncate">
                              {activity.instruction.en || 'No instruction'}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </AnimatedReveal>
        ))}
      </div>

      {/* Actions */}
      <AnimatedReveal delay={0.15}>
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>

          <div className="flex gap-3">
            <motion.button
              type="button"
              onClick={onRegenerate}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-700 bg-white border border-purple-200 rounded-md hover:bg-purple-50 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Regenerate
            </motion.button>
            <motion.button
              type="button"
              onClick={onAccept}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              Accept & Save
            </motion.button>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center pt-2">
          Accepting will create the topic, nodes, and activities.
          You can then edit individual items in the builder.
        </p>
      </AnimatedReveal>
    </div>
  );
}
