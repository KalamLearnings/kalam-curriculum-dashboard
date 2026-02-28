'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Sparkles } from 'lucide-react';
import { useCurriculum } from '@/lib/hooks/useCurriculum';
import { useTopics, useDeleteTopic } from '@/lib/hooks/useTopics';
import { useAllNodes, useDeleteNode } from '@/lib/hooks/useNodes';
import { useActivities, useAllActivities, useUpdateActivity, useCreateActivity, useDeleteActivity, useMoveActivity, useReorderActivities } from '@/lib/hooks/useActivities';
import { useAudioGeneration } from '@/lib/hooks/useAudioGeneration';
import { DEFAULT_VOICE } from '@/lib/constants/voices';
import { useBuilderStore } from '@/lib/stores/builderStore';
import { duplicateTopic as duplicateTopicApi } from '@/lib/api/curricula';
import { EmptyState } from '@/components/curriculum/shared/EmptyState';
import { InstructionFieldWithAudio } from '@/components/curriculum/shared/InstructionFieldWithAudio';
import { getActivityFormComponent } from '@/components/curriculum/forms';
import { FormField } from '@/components/curriculum/forms/FormField';
import { PhoneFrame, ActivityPreview } from '@/components/curriculum/preview';
import { ConditionalAudioSection } from '@/components/curriculum/shared/ConditionalAudioSection';
import { VoiceSelector } from '@/components/curriculum/shared/VoiceSelector';
import type { ConditionalAudioConfig } from '@kalam/curriculum-schemas';
import { TopicFormModal } from '@/components/curriculum/TopicFormModal';
import { NodeFormModal } from '@/components/curriculum/NodeFormModal';
import { ActivityTypeSelectorModal } from '@/components/curriculum/ActivityTypeSelectorModal';
import { LetterSelectorModal } from '@/components/curriculum/LetterSelectorModal';
import { GenerateTopicModal } from '@/components/curriculum/GenerateTopicModal';
import { useSaveGeneratedTopic } from '@/lib/hooks/useGenerateTopic';
import { AIButton } from '@/components/ui/AIEffects';
import type { Article, ArticleType } from '@/lib/schemas/curriculum';
import type { LetterReference } from '@/components/curriculum/forms/ArabicLetterGrid';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { getActivityLabel } from '@/lib/constants/curriculum';
import { CurriculumTree } from '@/components/curriculum/builder/CurriculumTree';
import { useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';

export default function CurriculumBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const curriculumId = params.id as string;

  // Zustand store - replaces all useState hooks
  const {
    selectedTopicId,
    selectedNodeId,
    selectedActivityId,
    isCreatingNew,
    expandedTopics,
    expandedNodes,
    topicModalOpen,
    nodeModalOpen,
    activityModalOpen,
    formData,
    setSelectedTopicId,
    setSelectedNodeId,
    setSelectedActivityId,
    setIsCreatingNew,
    toggleTopic,
    toggleNode,
    setTopicModalOpen,
    setNodeModalOpen,
    setActivityModalOpen,
    setFormData,
    updateConfig,
    updateInstructionEn,
    updateInstructionAr,
    selectActivity,
    startCreatingActivity,
    addActivityToNode,
  } = useBuilderStore();

  // Data fetching - REUSE existing hooks
  const { data: curriculum, isLoading: loadingCurriculum } = useCurriculum(curriculumId);
  const { data: topics } = useTopics(curriculumId);
  const { data: nodes } = useAllNodes(curriculumId); // Use useAllNodes to fetch all nodes for the tree

  // Fetch all activities for the tree (all nodes)
  const allNodeIds = nodes?.map(n => n.id) || [];
  const { data: allActivities } = useAllActivities(curriculumId, allNodeIds);

  // Fetch activities for selected node only (for the form)
  const { data: selectedNodeActivities } = useActivities(curriculumId, selectedNodeId);
  const { mutate: updateActivity, isPending: isUpdating } = useUpdateActivity();
  const { mutate: createActivity, isPending: isCreating } = useCreateActivity();
  const { mutate: deleteTopic } = useDeleteTopic();
  const { mutate: deleteNode } = useDeleteNode();
  const { mutate: deleteActivity } = useDeleteActivity();

  // Drag and drop hooks
  const { mutate: moveActivity } = useMoveActivity();
  const { mutate: reorderActivities } = useReorderActivities();

  // Topic duplication
  const queryClient = useQueryClient();
  const [topicToDuplicate, setTopicToDuplicate] = useState<string | null>(null);
  const [isDuplicating, setIsDuplicating] = useState(false);

  // Voice selection for TTS (shared across both English and Arabic)
  const [selectedVoiceId, setSelectedVoiceId] = useState(DEFAULT_VOICE.id);

  // AI topic generation
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const { mutate: saveGeneratedTopic, isPending: isSavingGenerated } = useSaveGeneratedTopic();

  const handleAcceptGenerated = (generated: import('@/lib/api/curricula').GeneratedTopic) => {
    saveGeneratedTopic({
      curriculumId,
      generated,
    });
  };

  const handleDuplicateTopic = (topicId: string) => {
    setTopicToDuplicate(topicId);
  };

  const handleConfirmDuplicate = async (selected: LetterReference | LetterReference[]) => {
    if (!topicToDuplicate) return;

    // Get the letterId from the selection (single or array)
    const letterRef = Array.isArray(selected) ? selected[0] : selected;
    if (!letterRef) return;

    setIsDuplicating(true);
    try {
      await duplicateTopicApi(curriculumId, topicToDuplicate, letterRef.letterId);

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['topics', curriculumId] });
      queryClient.invalidateQueries({ queryKey: ['nodes', curriculumId] });
      queryClient.invalidateQueries({ queryKey: ['activities', curriculumId] });
      queryClient.invalidateQueries({ queryKey: ['all-activities', curriculumId] });

      toast.success(
        `Topic duplicated with letter ${selectedLetter.letter}! Audio is being generated in the background. This may take a few minutes to complete.`,
        { duration: 6000 }
      );
      setTopicToDuplicate(null);
    } catch (error) {
      console.error('Failed to duplicate topic:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to duplicate topic');
    } finally {
      setIsDuplicating(false);
    }
  };

  // Drag and drop state and configuration
  const [draggingActivity, setDraggingActivity] = useState<Article | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px threshold before drag starts
      },
    })
  );

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;

    // Check if dragging an activity
    if (active.data.current?.type === 'activity' && active.data.current) {
      setDraggingActivity(active.data.current.activity);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    setDraggingActivity(null);

    if (!over || active.id === over.id) {
      return;
    }

    const activeData = active.data.current;
    const overData = over.data.current;

    const isActivityDrag = activeData?.type === 'activity';
    const isActivityDrop = overData?.type === 'activity';
    const isNodeDrop = overData?.type === 'node';

    // Scenario 1: Dropping activity onto a node (cross-node move)
    if (isActivityDrag && isNodeDrop && activeData) {
      const activity = activeData.activity as Article;
      const targetNodeId = over.id as string;
      const sourceNodeId = activity.node_id;

      // Don't update if dropping on the same node
      if (targetNodeId === sourceNodeId) return;

      // Move the activity to the target node
      moveActivity({
        curriculumId,
        activityId: activity.id,
        sourceNodeId,
        targetNodeId,
      });
    }

    // Scenario 2: Reordering activities within the same node
    if (isActivityDrag && isActivityDrop && active.id !== over.id && activeData && overData) {
      const activeActivity = activeData.activity as Article;
      const overActivity = overData.activity as Article;

      // Only handle if both activities are in the same node
      if (activeActivity.node_id === overActivity.node_id) {
        const nodeId = activeActivity.node_id;

        reorderActivities({
          curriculumId,
          nodeId,
          activeId: active.id as string,
          overId: over.id as string,
        });
      }
    }
  }

  // Get current activity
  const currentActivity = selectedNodeActivities?.find(a => a.id === selectedActivityId);

  // Get current topic and letter (needed for audio hooks)
  let currentTopic = topics?.find(t => t.id === selectedTopicId) || null;

  // If no topic selected but we have a selected node, find the topic that contains this node
  if (!currentTopic && selectedNodeId && topics) {
    currentTopic = topics.find(t => {
      return t.nodes?.some(n => n.id === selectedNodeId);
    }) || null;
  }

  // Extract letter data from topic.letter (attached by backend)
  const currentLetter = currentTopic?.letter || null;

  // Audio generation hooks for both English and Arabic
  const audioEn = useAudioGeneration({
    language: 'en',
    text: formData.instructionEn,
    existingAudioUrl: currentActivity?.instruction.audio_url,
    letter: currentLetter,
    voiceId: selectedVoiceId,
  });

  const audioAr = useAudioGeneration({
    language: 'ar',
    text: formData.instructionAr,
    existingAudioUrl: currentActivity?.instruction.audio_url, // Note: Schema currently doesn't have separate AR audio URL
    letter: currentLetter,
    voiceId: selectedVoiceId,
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
      activitiesCount: selectedNodeActivities?.length || 0
    });
  }, [selectedActivityId, isCreatingNew, currentActivity, selectedNodeActivities]);

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
        type: currentActivity.type,
        instruction: currentActivity.instruction,
        instructionEn: currentActivity.instruction.en,
        instructionAr: currentActivity.instruction.ar,
        config: currentActivity.config  // Added config to log
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

  // Handle activity selection - now uses store action
  const handleActivitySelect = (activity: Article, nodeId: string, topicId: string) => {
    selectActivity(activity.id, nodeId, topicId);
  };

  // Handle new activity type selection - now uses store action
  const handleNewActivityType = (type: ArticleType) => {
    startCreatingActivity(type);
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

      // DEBUG: Log what we're saving
      console.log('[Builder] Saving activity with data:', JSON.stringify(activityData, null, 2));
      console.log('[Builder] conditionalAudio in config:', JSON.stringify(formData.config?.conditionalAudio, null, 2));

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

  // Toggle functions now come from Zustand store

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

        <div className="flex items-center gap-2">
          <AIButton onClick={() => setGenerateModalOpen(true)} size="sm">
            <Sparkles className="w-3.5 h-3.5" />
            Generate with AI
          </AIButton>

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
        </div>
      </header>

      {/* Drag and Drop Context */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* 3-Panel Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* LEFT: Navigation Tree */}
          <CurriculumTree
          curriculumId={curriculumId}
          topics={topics}
          nodes={nodes}
          activities={allActivities}
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
            // Find the topic that contains this node
            const node = nodes?.find(n => n.id === nodeId);
            if (node) {
              addActivityToNode(nodeId, node.topic_id);
            }
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
            }
          }}
          onDuplicateTopic={handleDuplicateTopic}
        />

        {/* CENTER: Form */}
        <main className="flex-1 overflow-y-auto p-6">
          {!selectedActivityId && !isCreatingNew ? (
            <EmptyState
              message="Select a node and click + to add an activity, or select an existing activity to edit"
            />
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Activity Name Header + Global Voice Selector */}
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-semibold text-gray-900">
                  {getActivityLabel(formData.type)}
                </h2>
                <VoiceSelector
                  value={selectedVoiceId}
                  onChange={setSelectedVoiceId}
                  label="Voice"
                  className="min-w-[180px]"
                />
              </div>

              {/* English Instruction with Audio */}
              <FormField
                label="Instruction (English)"
                required
                hint="This text will be converted to audio and played when the activity loads in the app"
              >
                <InstructionFieldWithAudio
                  value={formData.instructionEn}
                  onChange={updateInstructionEn}
                  placeholder="Enter instruction in English"
                  language="en"
                  isGenerating={audioEn.isGenerating}
                  isPlaying={audioEn.isPlaying}
                  hasAudio={audioEn.hasAudio}
                  onGenerate={audioEn.generateAudio}
                  onPlay={audioEn.playAudio}
                  letter={currentLetter}
                />
              </FormField>

              {/* Arabic Instruction with Audio */}
              <FormField
                label="Instruction (Arabic)"
                hint="Optional: Arabic text that will be converted to audio for the app"
              >
                <InstructionFieldWithAudio
                  value={formData.instructionAr}
                  onChange={updateInstructionAr}
                  placeholder="أدخل التعليمات بالعربية (اختياري)"
                  language="ar"
                  dir="rtl"
                  isGenerating={audioAr.isGenerating}
                  isPlaying={audioAr.isPlaying}
                  hasAudio={audioAr.hasAudio}
                  onGenerate={audioAr.generateAudio}
                  onPlay={audioAr.playAudio}
                  letter={currentLetter}
                />
              </FormField>

              {/* Dynamic Activity Form - REUSE existing component */}
              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium text-gray-700 mb-4">
                  Activity Configuration
                </h3>
                <ActivityFormComponent
                  config={formData.config}
                  onChange={updateConfig}
                  topic={currentTopic}
                />
              </div>

              {/* Conditional Audio Section */}
              <div className="pt-4 border-t">
                <ConditionalAudioSection
                  value={(formData.config?.conditionalAudio as ConditionalAudioConfig) || {}}
                  onChange={(conditionalAudio) => {
                    updateConfig({
                      ...formData.config,
                      conditionalAudio,
                    });
                  }}
                  activityType={formData.type}
                  activityConfig={formData.config}
                  letter={currentLetter}
                  voiceId={selectedVoiceId}
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

        {/* Drag Overlay */}
        <DragOverlay>
          {draggingActivity ? <div /> : null}
        </DragOverlay>
      </DndContext>

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

      {/* Letter Selector for Topic Duplication */}
      <LetterSelectorModal
        isOpen={!!topicToDuplicate}
        onClose={() => setTopicToDuplicate(null)}
        onSelect={handleConfirmDuplicate}
      />

      {/* AI Topic Generation */}
      <GenerateTopicModal
        isOpen={generateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
        curriculumId={curriculumId}
        onAccept={handleAcceptGenerated}
      />
    </div>
  );
}
