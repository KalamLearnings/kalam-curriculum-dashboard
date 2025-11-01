'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, ChevronRight, ChevronDown, Plus } from 'lucide-react';
import { useCurriculum } from '@/lib/hooks/useCurriculum';
import { useTopics, useDeleteTopic } from '@/lib/hooks/useTopics';
import { useNodes, useDeleteNode } from '@/lib/hooks/useNodes';
import { useActivities, useUpdateActivity, useCreateActivity, useDeleteActivity } from '@/lib/hooks/useActivities';
import { useAudioGeneration } from '@/lib/hooks/useAudioGeneration';
import { EmptyState } from '@/components/curriculum/shared/EmptyState';
import { InstructionFieldWithAudio } from '@/components/curriculum/shared/InstructionFieldWithAudio';
import { getActivityFormComponent } from '@/components/curriculum/forms';
import { FormField, TextInput, Select } from '@/components/curriculum/forms/FormField';
import { PhoneFrame, ActivityPreview } from '@/components/curriculum/preview';
import { TopicFormModal } from '@/components/curriculum/TopicFormModal';
import { NodeFormModal } from '@/components/curriculum/NodeFormModal';
import { ActivityTypeSelectorModal } from '@/components/curriculum/ActivityTypeSelectorModal';
import type { Article, ArticleType, Topic, Node } from '@/lib/schemas/curriculum';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ACTIVITY_TYPES, getActivityLabel } from '@/lib/constants/curriculum';
import { CurriculumTree } from '@/components/curriculum/builder/CurriculumTree';

export default function CurriculumBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const curriculumId = params.id as string;

  // State
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Modal states
  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [nodeModalOpen, setNodeModalOpen] = useState(false);
  const [activityModalOpen, setActivityModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    type: 'show_letter_or_word' as ArticleType,
    instructionEn: '',
    instructionAr: '',
    config: {} as any
  });

  // Debug: Log formData changes
  useEffect(() => {
    console.log('formData changed:', {
      instructionEn: formData.instructionEn,
      instructionAr: formData.instructionAr
    });
  }, [formData]);

  // Data fetching - REUSE existing hooks
  const { data: curriculum, isLoading: loadingCurriculum } = useCurriculum(curriculumId);
  const { data: topics } = useTopics(curriculumId);
  const { data: nodes } = useNodes(curriculumId, selectedTopicId);
  const { data: activities } = useActivities(curriculumId, selectedNodeId);
  const { mutate: updateActivity, isPending: isUpdating } = useUpdateActivity();
  const { mutate: createActivity, isPending: isCreating } = useCreateActivity();
  const { mutate: deleteTopic } = useDeleteTopic();
  const { mutate: deleteNode } = useDeleteNode();
  const { mutate: deleteActivity } = useDeleteActivity();

  // Get current activity
  const currentActivity = activities?.find(a => a.id === selectedActivityId);

  // Audio generation hooks for both English and Arabic
  const audioEn = useAudioGeneration({
    language: 'en',
    text: formData.instructionEn,
    existingAudioUrl: currentActivity?.instruction.audio_url,
  });

  const audioAr = useAudioGeneration({
    language: 'ar',
    text: formData.instructionAr,
    existingAudioUrl: currentActivity?.instruction.audio_url, // Note: Schema currently doesn't have separate AR audio URL
  });

  // Debug current activity
  useEffect(() => {
    console.log('Activity selection changed:', {
      selectedActivityId,
      isCreatingNew,
      currentActivity: currentActivity ? {
        id: currentActivity.id,
        instruction: currentActivity.instruction
      } : null,
      activitiesCount: activities?.length || 0
    });
  }, [selectedActivityId, isCreatingNew, currentActivity, activities]);

  // Load activity data into form when selected
  useEffect(() => {
    console.log('Load activity useEffect triggered:', {
      hasCurrentActivity: !!currentActivity,
      isCreatingNew,
      willLoad: currentActivity && !isCreatingNew
    });

    if (currentActivity && !isCreatingNew) {
      console.log('Loading activity into form:', {
        id: currentActivity.id,
        instruction: currentActivity.instruction,
        instructionEn: currentActivity.instruction.en,
        instructionAr: currentActivity.instruction.ar
      });
      setFormData({
        type: currentActivity.type,
        instructionEn: currentActivity.instruction.en || '',
        instructionAr: currentActivity.instruction.ar || '',
        config: currentActivity.config || {}
      });
      // Clear generated audio when switching activities
      audioEn.clearAudio();
      audioAr.clearAudio();
    }
  }, [currentActivity, isCreatingNew]);

  // Handle activity selection
  const handleActivitySelect = (activity: Article, nodeId: string, topicId: string) => {
    setIsCreatingNew(false);
    setSelectedActivityId(activity.id);
    setSelectedNodeId(nodeId);
    setSelectedTopicId(topicId);

    // Auto-expand parents
    setExpandedTopics(prev => new Set(prev).add(topicId));
    setExpandedNodes(prev => new Set(prev).add(nodeId));
  };

  // Handle new activity type selection
  const handleNewActivityType = (type: ArticleType) => {
    setIsCreatingNew(true);
    setSelectedActivityId(null);
    setFormData({
      type,
      instructionEn: '',
      instructionAr: '',
      config: {}
    });
    // Clear both audio states
    audioEn.clearAudio();
    audioAr.clearAudio();
  };

  // Upload audio blob to Supabase Storage (shared utility)
  const uploadAudioToStorage = async (blob: Blob, filePath: string): Promise<string> => {
    const { supabase } = await import('@/lib/supabase');

    const { data, error } = await supabase.storage
      .from('curriculum-audio')
      .upload(filePath, blob, {
        contentType: 'audio/mpeg',
        cacheControl: '3600',
        upsert: true,
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

  // Save handler
  const handleSave = async () => {
    if (!selectedNodeId) {
      toast.error('No node selected');
      return;
    }

    try {
      // Upload English audio if generated
      let audioUrlEn = audioEn.existingAudioUrl;
      if (audioEn.generatedAudioBlob) {
        audioUrlEn = await uploadAudioToStorage(
          audioEn.generatedAudioBlob.blob,
          audioEn.generatedAudioBlob.filePath
        );
      }

      // Upload Arabic audio if generated
      // Note: Schema currently uses same audio_url field for both languages
      // In future, may want separate audio_url_ar field
      let audioUrlAr = audioAr.existingAudioUrl;
      if (audioAr.generatedAudioBlob) {
        audioUrlAr = await uploadAudioToStorage(
          audioAr.generatedAudioBlob.blob,
          audioAr.generatedAudioBlob.filePath
        );
      }

      // Use English audio URL by default (for backward compatibility)
      // In future, schema can support both audio_url (en) and audio_url_ar
      const audioUrl = audioUrlEn || audioUrlAr;

      const activityData = {
        type: formData.type,
        instruction: {
          en: formData.instructionEn,
          ar: formData.instructionAr,
          ...(audioUrl ? { audio_url: audioUrl } : {}),
        },
        config: formData.config
      };

      if (isCreatingNew) {
        // Create new activity
        createActivity({
          curriculumId,
          nodeId: selectedNodeId,
          data: activityData
        }, {
          onSuccess: (newActivity) => {
            toast.success('Activity created!');
            setIsCreatingNew(false);
            setSelectedActivityId(newActivity.id);
            // Clear generated blobs after successful upload
            audioEn.clearAudio();
            audioAr.clearAudio();
          }
        });
      } else {
        // Update existing activity
        if (!selectedActivityId) {
          toast.error('No activity selected');
          return;
        }

        updateActivity({
          curriculumId,
          nodeId: selectedNodeId,
          activityId: selectedActivityId,
          data: activityData
        }, {
          onSuccess: () => {
            toast.success('Activity updated!');
            // Clear generated blobs after successful upload
            audioEn.clearAudio();
            audioAr.clearAudio();
          }
        });
      }
    } catch (error) {
      console.error('Error saving activity:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save activity');
    }
  };

  // Toggle expand/collapse
  const toggleTopic = (topicId: string) => {
    setExpandedTopics(prev => {
      const next = new Set(prev);
      next.has(topicId) ? next.delete(topicId) : next.add(topicId);
      return next;
    });
  };

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      next.has(nodeId) ? next.delete(nodeId) : next.add(nodeId);
      return next;
    });
  };

  if (loadingCurriculum) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
          <p className="text-sm text-gray-600">Loading curriculum...</p>
        </div>
      </div>
    );
  }

  // Get dynamic form component - REUSE existing
  const ActivityFormComponent = getActivityFormComponent(formData.type);

  // Get current topic for auto-populating letter in forms
  const currentTopic = topics?.find(t => t.id === selectedTopicId) || null;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-white overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/curricula')}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-base font-semibold">
            {curriculum?.title?.en || 'Curriculum Builder'}
          </h1>
        </div>

        <button
          onClick={handleSave}
          disabled={(!selectedActivityId && !isCreatingNew) || isUpdating || isCreating}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-colors",
            (selectedActivityId || isCreatingNew) && !isUpdating && !isCreating
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          )}
        >
          <Save className="w-4 h-4" />
          {isCreating ? 'Creating...' : isUpdating ? 'Saving...' : isCreatingNew ? 'Add Activity' : 'Save Changes'}
        </button>
      </header>

      {/* 3-Panel Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: Navigation Tree */}
        <CurriculumTree
          curriculumId={curriculumId}
          topics={topics}
          nodes={nodes}
          activities={activities}
          selectedTopicId={selectedTopicId}
          selectedNodeId={selectedNodeId}
          selectedActivityId={selectedActivityId}
          expandedTopics={expandedTopics}
          expandedNodes={expandedNodes}
          onTopicSelect={setSelectedTopicId}
          onNodeSelect={setSelectedNodeId}
          onActivitySelect={handleActivitySelect}
          onToggleTopic={toggleTopic}
          onToggleNode={toggleNode}
          onAddTopic={() => setTopicModalOpen(true)}
          onAddNode={(topicId) => {
            setSelectedTopicId(topicId);
            setNodeModalOpen(true);
          }}
          onAddActivity={(nodeId) => {
            setSelectedNodeId(nodeId);
            setActivityModalOpen(true);
          }}
          onDeleteTopic={(topicId) => {
            deleteTopic({ curriculumId, topicId });
            if (selectedTopicId === topicId) {
              setSelectedTopicId(null);
              setSelectedNodeId(null);
              setSelectedActivityId(null);
            }
          }}
          onDeleteNode={(topicId, nodeId) => {
            deleteNode({ curriculumId, topicId, nodeId });
            if (selectedNodeId === nodeId) {
              setSelectedNodeId(null);
              setSelectedActivityId(null);
            }
          }}
          onDeleteActivity={(nodeId, activityId) => {
            deleteActivity({ curriculumId, nodeId, activityId });
            if (selectedActivityId === activityId) {
              setSelectedActivityId(null);
              setIsCreatingNew(false);
            }
          }}
        />

        {/* CENTER: Form */}
        <main className="flex-1 overflow-y-auto p-6">
          {!selectedActivityId && !isCreatingNew ? (
            <EmptyState
              message="Select a node and click + to add an activity, or select an existing activity to edit"
            />
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Activity Name Header */}
              <div className="mb-2">
                <h2 className="text-base font-semibold text-gray-900">
                  {getActivityLabel(formData.type)}
                </h2>
              </div>

              {/* English Instruction with Audio */}
              <FormField
                label="Instruction (English)"
                required
                hint="This text will be converted to audio and played when the activity loads in the app"
              >
                <InstructionFieldWithAudio
                  value={formData.instructionEn}
                  onChange={(value) => setFormData(prev => ({ ...prev, instructionEn: value }))}
                  placeholder="Enter instruction in English"
                  language="en"
                  isGenerating={audioEn.isGenerating}
                  isPlaying={audioEn.isPlaying}
                  hasAudio={audioEn.hasAudio}
                  onGenerate={audioEn.generateAudio}
                  onPlay={audioEn.playAudio}
                />
              </FormField>

              {/* Arabic Instruction with Audio */}
              <FormField
                label="Instruction (Arabic)"
                hint="Optional: Arabic text that will be converted to audio for the app"
              >
                <InstructionFieldWithAudio
                  value={formData.instructionAr}
                  onChange={(value) => setFormData(prev => ({ ...prev, instructionAr: value }))}
                  placeholder="أدخل التعليمات بالعربية (اختياري)"
                  language="ar"
                  dir="rtl"
                  isGenerating={audioAr.isGenerating}
                  isPlaying={audioAr.isPlaying}
                  hasAudio={audioAr.hasAudio}
                  onGenerate={audioAr.generateAudio}
                  onPlay={audioAr.playAudio}
                />
              </FormField>

              {/* Dynamic Activity Form - REUSE existing component */}
              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium text-gray-700 mb-4">
                  Activity Configuration
                </h3>
                <ActivityFormComponent
                  config={formData.config}
                  onChange={(config) => setFormData(prev => ({ ...prev, config }))}
                  topic={currentTopic}
                />
              </div>
            </div>
          )}
        </main>

        {/* RIGHT: Preview */}
        <aside className="w-[420px] border-l bg-gray-50 overflow-y-auto p-6">
          <h3 className="text-sm font-semibold mb-4">Preview</h3>

          {!selectedActivityId && !isCreatingNew ? (
            <div className="flex items-center justify-center h-64 text-sm text-gray-400">
              No activity selected
            </div>
          ) : (
            <PhoneFrame>
              <ActivityPreview
                type={formData.type}
                instruction={{
                  en: formData.instructionEn,
                  ar: formData.instructionAr
                }}
                config={formData.config}
              />
            </PhoneFrame>
          )}
        </aside>
      </div>

      {/* Modals */}
      <TopicFormModal
        isOpen={topicModalOpen}
        onClose={() => setTopicModalOpen(false)}
        curriculumId={curriculumId}
      />

      {selectedTopicId && (
        <NodeFormModal
          isOpen={nodeModalOpen}
          onClose={() => setNodeModalOpen(false)}
          curriculumId={curriculumId}
          topicId={selectedTopicId}
        />
      )}

      {selectedNodeId && (
        <ActivityTypeSelectorModal
          isOpen={activityModalOpen}
          onClose={() => setActivityModalOpen(false)}
          onTypeSelected={handleNewActivityType}
        />
      )}
    </div>
  );
}
