'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  useBook,
  useCreateBook,
  useUpdateBook,
  useBookPages,
  useCreatePage,
  useUpdatePage,
  useDeletePage,
  useBookAvailability,
  useCreateAvailability,
  useDeleteAvailability,
} from '@/lib/hooks/useBooks';
import { useCurricula } from '@/lib/hooks/useCurriculum';
import { useTopics } from '@/lib/hooks/useTopics';
import { Modal } from '@/components/ui/Modal';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { ImageLibraryModal } from '@/components/curriculum/forms/ImageLibraryModal';
import { LetterSelectorModal } from '@/components/curriculum/LetterSelectorModal';
import { useLetters } from '@/lib/hooks/useLetters';
import { VoiceTagsInput } from '@/components/ui/VoiceTagsInput';
import { VoiceSelector } from '@/components/curriculum/shared/VoiceSelector';
import { AudioPicker } from '@/components/audio/AudioPicker';
import { DEFAULT_VOICE } from '@/lib/constants/voices';
import type { AudioAsset } from '@/lib/types/audio';
import type { LetterReference } from '@/components/curriculum/forms/ArabicLetterGrid';
import type {
  Book,
  BookPage,
  BookAvailability,
  CreateBookRequest,
  CreatePageRequest,
  UpdatePageRequest,
} from '@/lib/api/books';
import { toast } from 'sonner';

type Tab = 'details' | 'pages' | 'availability';

const difficultyOptions = [
  { value: 1, label: 'Beginner' },
  { value: 2, label: 'Intermediate' },
  { value: 3, label: 'Advanced' },
];

export default function BookEditorPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.id as string;
  const isNew = bookId === 'new';

  const [activeTab, setActiveTab] = useState<Tab>('details');

  // Book data
  const { data: book, isLoading: bookLoading } = useBook(isNew ? null : bookId);
  const { data: pages, isLoading: pagesLoading } = useBookPages(isNew ? null : bookId);
  const { data: availability } = useBookAvailability(isNew ? null : bookId);

  // Availability modal state (declared before useTopics which depends on selectedCurriculumId)
  const [availabilityModalOpen, setAvailabilityModalOpen] = useState(false);
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<string>('');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');

  // Curricula and topics for availability
  const { data: curricula } = useCurricula();
  const { data: topics } = useTopics(selectedCurriculumId || null);

  // Mutations
  const { mutate: createBookMutation, isPending: isCreating } = useCreateBook();
  const { mutate: updateBook, isPending: isUpdating } = useUpdateBook();
  const { mutate: createPage } = useCreatePage();
  const { mutate: updatePage } = useUpdatePage();
  const { mutate: deletePage } = useDeletePage();
  const { mutate: createAvailability } = useCreateAvailability();
  const { mutate: deleteAvailability } = useDeleteAvailability();

  // Form state for details
  const [formData, setFormData] = useState({
    title: '',
    title_ar: '',
    synopsis: '',
    synopsis_ar: '',
    cover_image_url: '',
    difficulty_level: 1 as 1 | 2 | 3,
    target_letters: [] as string[],
    price: 0,
    is_premium: false,
    is_active: true,
  });

  // Page modal state
  const [pageModalOpen, setPageModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<BookPage | null>(null);
  const [pageFormData, setPageFormData] = useState<CreatePageRequest>({
    page_number: 1,
    layout: 'single',
    background_image_url: '',
    text_ar: '',
    audio_url: '',
  });

  // Delete page confirmation
  const [deletePageConfirmOpen, setDeletePageConfirmOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<BookPage | null>(null);

  // TTS generation state for page audio
  const [pageAudioText, setPageAudioText] = useState('');
  const [pageAudioVoice, setPageAudioVoice] = useState(DEFAULT_VOICE.id);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

  // Delete availability confirmation
  const [deleteAvailConfirmOpen, setDeleteAvailConfirmOpen] = useState(false);
  const [availToDelete, setAvailToDelete] = useState<BookAvailability | null>(null);

  // Create form state (for new books)
  const [createFormData, setCreateFormData] = useState<{
    title: string;
    title_ar: string;
    synopsis: string;
    synopsis_ar: string;
    cover_image_url: string;
    difficulty_level: 1 | 2 | 3;
    target_letters: string[];
    price: number;
    is_premium: boolean;
    curriculum_id: string;
    unlock_after_topic_id: string;
  }>({
    title: '',
    title_ar: '',
    synopsis: '',
    synopsis_ar: '',
    cover_image_url: '',
    difficulty_level: 1,
    target_letters: [],
    price: 0,
    is_premium: true,
    curriculum_id: '',
    unlock_after_topic_id: '',
  });
  // Topics for create form (based on selected curriculum)
  const { data: createTopics } = useTopics(createFormData.curriculum_id || null);

  // Cover image picker modal state
  const [coverPickerOpen, setCoverPickerOpen] = useState(false);
  const [coverPickerTarget, setCoverPickerTarget] = useState<'create' | 'edit'>('create');

  // Page image picker modal state
  const [pageImagePickerOpen, setPageImagePickerOpen] = useState(false);

  // Letter selector modal state
  const [letterSelectorOpen, setLetterSelectorOpen] = useState(false);
  const [letterSelectorTarget, setLetterSelectorTarget] = useState<'create' | 'edit'>('create');
  const { letters } = useLetters();

  // Load book data into form
  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title,
        title_ar: book.title_ar,
        synopsis: book.synopsis || '',
        synopsis_ar: book.synopsis_ar || '',
        cover_image_url: book.image_url || '',
        difficulty_level: book.difficulty_level,
        target_letters: book.target_letters || [],
        price: book.price || 0,
        is_premium: book.is_premium || false,
        is_active: book.is_active,
      });
    }
  }, [book]);

  const handleSaveDetails = () => {
    if (!bookId || isNew) return;

    updateBook({
      bookId,
      data: {
        title: formData.title,
        title_ar: formData.title_ar,
        synopsis: formData.synopsis || null,
        synopsis_ar: formData.synopsis_ar || null,
        cover_image_url: formData.cover_image_url,
        difficulty_level: formData.difficulty_level,
        target_letters: formData.target_letters,
        price: formData.price,
        is_premium: formData.is_premium,
        is_active: formData.is_active,
      },
    });
  };

  // Page handlers
  const handleOpenPageModal = (page?: BookPage) => {
    if (page) {
      setEditingPage(page);
      setPageFormData({
        page_number: page.page_number,
        layout: page.layout,
        background_image_url: page.background_image_url,
        text_ar: page.text_ar,
        audio_url: page.audio_url || '',
      });
      // Pre-fill TTS text with page text
      setPageAudioText(page.text_ar || '');
    } else {
      setEditingPage(null);
      setPageFormData({
        page_number: (pages?.length || 0) + 1,
        layout: 'single',
        background_image_url: '',
        text_ar: '',
        audio_url: '',
      });
      setPageAudioText('');
    }
    setPageAudioVoice(DEFAULT_VOICE.id);
    setPageModalOpen(true);
  };

  // Generate TTS audio for page
  const handleGeneratePageAudio = async () => {
    const textToGenerate = pageAudioText.trim() || pageFormData.text_ar.trim();
    if (!textToGenerate) {
      toast.error('Please enter text for audio generation');
      return;
    }

    setIsGeneratingAudio(true);

    try {
      const { createClient, getEnvironmentBaseUrl, getEdgeFunctionAuthHeaders } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('Not authenticated. Please log in.');
      }

      // Generate TTS
      const ttsResponse = await fetch(`${getEnvironmentBaseUrl()}/functions/v1/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getEdgeFunctionAuthHeaders(session.access_token),
        },
        body: JSON.stringify({
          text: textToGenerate,
          language: 'ar',
          voice_id: pageAudioVoice,
        }),
      });

      if (!ttsResponse.ok) {
        const errorData = await ttsResponse.json();
        throw new Error(errorData.error || 'Failed to generate audio');
      }

      const ttsData = await ttsResponse.json();
      const audioData = ttsData.data || ttsData;

      // Convert base64 to blob
      const binaryString = atob(audioData.audio_data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: audioData.content_type });

      // Upload to storage
      const fileName = `book-page-${Date.now()}.mp3`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('curriculum-audio')
        .upload(`books/${fileName}`, blob, {
          contentType: 'audio/mpeg',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('curriculum-audio')
        .getPublicUrl(uploadData.path);

      setPageFormData((p) => ({ ...p, audio_url: publicUrl }));
      toast.success('Audio generated and uploaded!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate audio';
      toast.error(errorMessage);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleSavePage = () => {
    if (editingPage) {
      updatePage(
        { bookId, pageId: editingPage.id, data: pageFormData as UpdatePageRequest },
        { onSuccess: () => setPageModalOpen(false) }
      );
    } else {
      createPage(
        { bookId, data: pageFormData },
        { onSuccess: () => setPageModalOpen(false) }
      );
    }
  };

  const handleDeletePageClick = (page: BookPage) => {
    setPageToDelete(page);
    setDeletePageConfirmOpen(true);
  };

  const handleDeletePageConfirm = () => {
    if (!pageToDelete) return;
    deletePage(
      { bookId, pageId: pageToDelete.id },
      {
        onSuccess: () => {
          setDeletePageConfirmOpen(false);
          setPageToDelete(null);
        },
      }
    );
  };

  // Availability handlers
  const handleSaveAvailability = () => {
    if (!selectedCurriculumId) {
      toast.error('Please select a curriculum');
      return;
    }

    // Derive availability_type from selections:
    // - Has topic prerequisite = store_unlockable (must complete topic to buy)
    // - No prerequisite = store_always (available immediately in that curriculum)
    const availabilityType = selectedTopicId ? 'store_unlockable' : 'store_always';

    createAvailability(
      {
        bookId,
        data: {
          availability_type: availabilityType,
          curriculum_id: selectedCurriculumId,
          prerequisite_type: selectedTopicId ? 'topic' : undefined,
          prerequisite_topic_id: selectedTopicId || undefined,
        },
      },
      {
        onSuccess: () => {
          setAvailabilityModalOpen(false);
          setSelectedCurriculumId('');
          setSelectedTopicId('');
        },
      }
    );
  };

  const handleDeleteAvailClick = (rule: BookAvailability) => {
    setAvailToDelete(rule);
    setDeleteAvailConfirmOpen(true);
  };

  const handleDeleteAvailConfirm = () => {
    if (!availToDelete) return;
    deleteAvailability(
      { bookId, ruleId: availToDelete.id },
      {
        onSuccess: () => {
          setDeleteAvailConfirmOpen(false);
          setAvailToDelete(null);
        },
      }
    );
  };

  const handleCreateBook = () => {
    // Validate required fields
    if (!createFormData.title.trim()) {
      toast.error('Title (English) is required');
      return;
    }
    if (!createFormData.cover_image_url.trim()) {
      toast.error('Cover image is required');
      return;
    }
    if (!createFormData.curriculum_id) {
      toast.error('Curriculum is required');
      return;
    }

    const requestData: CreateBookRequest = {
      title: createFormData.title.trim(),
      title_ar: createFormData.title_ar.trim() || createFormData.title.trim(),
      cover_image_url: createFormData.cover_image_url.trim(),
      difficulty_level: createFormData.difficulty_level,
    };

    // Add optional fields if provided
    if (createFormData.synopsis.trim()) {
      requestData.synopsis = createFormData.synopsis.trim();
    }
    if (createFormData.synopsis_ar.trim()) {
      requestData.synopsis_ar = createFormData.synopsis_ar.trim();
    }
    if (createFormData.target_letters.length > 0) {
      requestData.target_letters = createFormData.target_letters;
    }
    if (createFormData.price > 0) {
      requestData.price = createFormData.price;
    }
    if (createFormData.is_premium) {
      requestData.is_premium = createFormData.is_premium;
    }

    createBookMutation(requestData, {
      onSuccess: (newBook) => {
        // Create availability rule for the selected curriculum
        const availabilityType = createFormData.unlock_after_topic_id ? 'store_unlockable' : 'store_always';
        createAvailability(
          {
            bookId: newBook.id,
            data: {
              availability_type: availabilityType,
              curriculum_id: createFormData.curriculum_id,
              prerequisite_type: createFormData.unlock_after_topic_id ? 'topic' : undefined,
              prerequisite_topic_id: createFormData.unlock_after_topic_id || undefined,
            },
          },
          {
            onSuccess: () => {
              router.push(`/books/${newBook.id}`);
            },
            onError: () => {
              // Book created but availability failed - still redirect
              toast.error('Book created but failed to set availability. Please add it manually.');
              router.push(`/books/${newBook.id}`);
            },
          }
        );
      },
    });
  };

  if (isNew) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push('/books')}
            className="text-gray-500 hover:text-gray-700"
          >
            &larr; Back
          </button>
          <h1 className="text-2xl font-bold">Create New Book</h1>
        </div>

        {/* Create Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title (English) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={createFormData.title}
                onChange={(e) =>
                  setCreateFormData((p) => ({ ...p, title: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Enter book title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title (Arabic)
              </label>
              <input
                type="text"
                value={createFormData.title_ar}
                onChange={(e) =>
                  setCreateFormData((p) => ({ ...p, title_ar: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded-md"
                dir="rtl"
                placeholder="ادخل عنوان الكتاب"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Synopsis (English)
              </label>
              <textarea
                value={createFormData.synopsis}
                onChange={(e) =>
                  setCreateFormData((p) => ({ ...p, synopsis: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
                placeholder="Brief description of the book"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Synopsis (Arabic)
              </label>
              <textarea
                value={createFormData.synopsis_ar}
                onChange={(e) =>
                  setCreateFormData((p) => ({ ...p, synopsis_ar: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
                dir="rtl"
                placeholder="وصف مختصر للكتاب"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cover Image <span className="text-red-500">*</span>
              </label>
              {createFormData.cover_image_url ? (
                <div className="flex items-start gap-3">
                  <img
                    src={createFormData.cover_image_url}
                    alt="Cover preview"
                    className="w-24 h-32 object-cover rounded border"
                  />
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCoverPickerTarget('create');
                        setCoverPickerOpen(true);
                      }}
                      className="px-3 py-1.5 text-sm text-blue-600 border border-blue-300 rounded hover:bg-blue-50"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={() => setCreateFormData((p) => ({ ...p, cover_image_url: '' }))}
                      className="px-3 py-1.5 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setCoverPickerTarget('create');
                    setCoverPickerOpen(true);
                  }}
                  className="w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
                >
                  Click to select or upload cover image
                </button>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty Level <span className="text-red-500">*</span>
              </label>
              <select
                value={createFormData.difficulty_level}
                onChange={(e) =>
                  setCreateFormData((p) => ({
                    ...p,
                    difficulty_level: parseInt(e.target.value) as 1 | 2 | 3,
                  }))
                }
                className="w-full px-3 py-2 border rounded-md"
              >
                {difficultyOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (coins)
              </label>
              <input
                type="number"
                min="0"
                value={createFormData.price}
                onChange={(e) =>
                  setCreateFormData((p) => ({
                    ...p,
                    price: parseInt(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={createFormData.is_premium}
                  onChange={(e) =>
                    setCreateFormData((p) => ({ ...p, is_premium: e.target.checked }))
                  }
                />
                <span className="text-sm">Premium Content</span>
              </label>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Letters
              </label>
              <button
                type="button"
                onClick={() => {
                  setLetterSelectorTarget('create');
                  setLetterSelectorOpen(true);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                {createFormData.target_letters.length > 0
                  ? `${createFormData.target_letters.length} letter(s) selected`
                  : 'Select letters...'}
              </button>
              {createFormData.target_letters.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {createFormData.target_letters.map((letter) => (
                    <span
                      key={letter}
                      className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-lg"
                      dir="rtl"
                    >
                      {letter}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Curriculum Access Section */}
            <div className="col-span-2 border-t pt-4 mt-2">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Curriculum Access</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Curriculum <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={createFormData.curriculum_id}
                    onChange={(e) => {
                      setCreateFormData((p) => ({
                        ...p,
                        curriculum_id: e.target.value,
                        unlock_after_topic_id: '', // Reset topic when curriculum changes
                      }));
                    }}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Select curriculum...</option>
                    {curricula?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title?.en || c.id}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Only children in this curriculum will see the book
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unlock after topic
                  </label>
                  <select
                    value={createFormData.unlock_after_topic_id}
                    onChange={(e) =>
                      setCreateFormData((p) => ({ ...p, unlock_after_topic_id: e.target.value }))
                    }
                    className="w-full px-3 py-2 border rounded-md"
                    disabled={!createFormData.curriculum_id}
                  >
                    <option value="">Available immediately</option>
                    {createTopics
                      ?.sort((a, b) => a.sequence_number - b.sequence_number)
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.sequence_number}. {t.title?.en || t.letter?.letter || t.id}
                        </option>
                      ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    {createFormData.unlock_after_topic_id
                      ? 'Must complete all topics up to selected'
                      : 'Book available as soon as child enrolls'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => router.push('/books')}
              className="px-4 py-2 text-gray-700 bg-white border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateBook}
              disabled={isCreating}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : 'Create Book'}
            </button>
          </div>
        </div>

        {/* Cover Image Picker Modal for Create Form */}
        <ImageLibraryModal
          isOpen={coverPickerOpen}
          onClose={() => setCoverPickerOpen(false)}
          onSelectImage={(url) => {
            setCreateFormData((p) => ({ ...p, cover_image_url: url }));
            setCoverPickerOpen(false);
          }}
          currentImage={createFormData.cover_image_url}
        />

        {/* Letter Selector Modal for Create Form */}
        <LetterSelectorModal
          isOpen={letterSelectorOpen}
          onClose={() => setLetterSelectorOpen(false)}
          multiSelect={true}
          showFormSelector={false}
          selectedValue={(() => {
            const refs: LetterReference[] = [];
            for (const char of createFormData.target_letters) {
              const letter = letters?.find((l) => l.letter === char);
              if (letter) {
                refs.push({ letterId: letter.id, form: 'isolated' });
              }
            }
            return refs;
          })()}
          onSelect={(refs) => {
            const letterRefs = Array.isArray(refs) ? refs : [refs];
            const letterChars = letterRefs
              .map((ref) => letters?.find((l) => l.id === ref.letterId)?.letter)
              .filter((char): char is string => char !== undefined);
            setCreateFormData((p) => ({ ...p, target_letters: letterChars }));
          }}
        />
      </main>
    );
  }

  if (bookLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!book) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-600">Book not found</p>
        <button
          onClick={() => router.push('/books')}
          className="mt-4 text-blue-600 hover:text-blue-700"
        >
          Back to Books
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/books')}
            className="text-gray-500 hover:text-gray-700"
          >
            &larr; Back
          </button>
          <h1 className="text-2xl font-bold">{book.title}</h1>
          {!book.is_active && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded">
              Inactive
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b mb-6">
        <nav className="flex gap-4">
          {(['details', 'pages', 'availability'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-4 py-2 text-sm font-medium border-b-2 -mb-px
                ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }
              `}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'pages' && ` (${book.page_count})`}
              {tab === 'availability' && ` (${availability?.length || 0})`}
            </button>
          ))}
        </nav>
      </div>

      {/* Details Tab */}
      {activeTab === 'details' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title (English)
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title (Arabic)
              </label>
              <input
                type="text"
                value={formData.title_ar}
                onChange={(e) => setFormData((p) => ({ ...p, title_ar: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md"
                dir="rtl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Synopsis (English)
              </label>
              <textarea
                value={formData.synopsis}
                onChange={(e) => setFormData((p) => ({ ...p, synopsis: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Synopsis (Arabic)
              </label>
              <textarea
                value={formData.synopsis_ar}
                onChange={(e) => setFormData((p) => ({ ...p, synopsis_ar: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
                dir="rtl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cover Image
              </label>
              {formData.cover_image_url ? (
                <div className="flex items-start gap-3">
                  <img
                    src={formData.cover_image_url}
                    alt="Cover preview"
                    className="w-24 h-32 object-cover rounded border"
                  />
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCoverPickerTarget('edit');
                        setCoverPickerOpen(true);
                      }}
                      className="px-3 py-1.5 text-sm text-blue-600 border border-blue-300 rounded hover:bg-blue-50"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, cover_image_url: '' }))}
                      className="px-3 py-1.5 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setCoverPickerTarget('edit');
                    setCoverPickerOpen(true);
                  }}
                  className="w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
                >
                  Click to select or upload cover image
                </button>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty Level
              </label>
              <select
                value={formData.difficulty_level}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    difficulty_level: parseInt(e.target.value) as 1 | 2 | 3,
                  }))
                }
                className="w-full px-3 py-2 border rounded-md"
              >
                {difficultyOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (coins)
              </label>
              <input
                type="number"
                min="0"
                value={formData.price}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, price: parseInt(e.target.value) || 0 }))
                }
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_premium}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, is_premium: e.target.checked }))
                  }
                />
                <span className="text-sm">Premium Content</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, is_active: e.target.checked }))
                  }
                />
                <span className="text-sm">Active</span>
              </label>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Letters
              </label>
              <button
                type="button"
                onClick={() => {
                  setLetterSelectorTarget('edit');
                  setLetterSelectorOpen(true);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                {formData.target_letters.length > 0
                  ? `${formData.target_letters.length} letter(s) selected`
                  : 'Select letters...'}
              </button>
              {formData.target_letters.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.target_letters.map((letter) => (
                    <span
                      key={letter}
                      className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-lg"
                      dir="rtl"
                    >
                      {letter}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSaveDetails}
              disabled={isUpdating}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Pages Tab */}
      {activeTab === 'pages' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-medium">Pages ({pages?.length || 0})</h3>
            <button
              onClick={() => handleOpenPageModal()}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
            >
              + Add Page
            </button>
          </div>

          {pagesLoading ? (
            <div className="p-8 text-center text-gray-500">Loading pages...</div>
          ) : !pages || pages.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No pages yet. Add your first page!
            </div>
          ) : (
            <div className="divide-y">
              {pages
                .sort((a, b) => a.page_number - b.page_number)
                .map((page) => (
                  <div
                    key={page.id}
                    className="p-4 flex items-center gap-4 hover:bg-gray-50"
                  >
                    <div className="w-16 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      {page.background_image_url ? (
                        <img
                          src={page.background_image_url}
                          alt={`Page ${page.page_number}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">Page {page.page_number}</div>
                      <div className="text-sm text-gray-500 truncate" dir="rtl">
                        {page.text_ar || '(No text)'}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {page.layout} layout
                        {page.audio_url && ' • Has audio'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenPageModal(page)}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePageClick(page)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Availability Tab */}
      {activeTab === 'availability' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-medium">Curriculum Access ({availability?.length || 0})</h3>
            <button
              onClick={() => setAvailabilityModalOpen(true)}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
            >
              + Add Curriculum
            </button>
          </div>

          <div className="p-4 bg-gray-50 border-b text-sm text-gray-600">
            Books are only visible to children enrolled in the curricula listed below.
            Optionally require topic completion before the book can be purchased.
          </div>

          {!availability || availability.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No curricula assigned. Add one to make this book available to children.
            </div>
          ) : (
            <div className="divide-y">
              {availability.map((rule) => (
                <div key={rule.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {rule.curriculum_name || rule.curriculum_id || 'All Curricula'}
                    </div>
                    {rule.prerequisite_topic_id ? (
                      <div className="text-sm text-gray-500">
                        Unlocks after completing: {rule.prerequisite_topic_name || rule.prerequisite_topic_id}
                      </div>
                    ) : (
                      <div className="text-sm text-green-600">
                        Available immediately
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteAvailClick(rule)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Page Modal */}
      <Modal
        isOpen={pageModalOpen}
        onClose={() => setPageModalOpen(false)}
        title={editingPage ? `Edit Page ${editingPage.page_number}` : 'Add Page'}
        size="lg"
      >
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Page Number
              </label>
              <input
                type="number"
                min="1"
                value={pageFormData.page_number}
                onChange={(e) =>
                  setPageFormData((p) => ({
                    ...p,
                    page_number: parseInt(e.target.value) || 1,
                  }))
                }
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Layout
              </label>
              <select
                value={pageFormData.layout}
                onChange={(e) =>
                  setPageFormData((p) => ({
                    ...p,
                    layout: e.target.value as 'single' | 'split',
                  }))
                }
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="single">Single Panel</option>
                <option value="split">Split (Diagonal)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Background Image <span className="text-red-500">*</span>
            </label>
            {pageFormData.background_image_url ? (
              <div className="flex items-start gap-3">
                <img
                  src={pageFormData.background_image_url}
                  alt="Page preview"
                  className="w-32 h-24 object-cover rounded border"
                />
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setPageImagePickerOpen(true)}
                    className="px-3 py-1.5 text-sm text-blue-600 border border-blue-300 rounded hover:bg-blue-50"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={() => setPageFormData((p) => ({ ...p, background_image_url: '' }))}
                    className="px-3 py-1.5 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setPageImagePickerOpen(true)}
                className="w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
              >
                Click to select background image
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Text
            </label>
            <textarea
              value={pageFormData.text_ar}
              onChange={(e) => setPageFormData((p) => ({ ...p, text_ar: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md"
              rows={3}
              dir="rtl"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Page Audio (optional)
            </label>

            {/* Current audio URL display */}
            {pageFormData.audio_url && (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-md">
                <audio controls className="h-8 flex-1">
                  <source src={pageFormData.audio_url} type="audio/mpeg" />
                </audio>
                <button
                  type="button"
                  onClick={() => setPageFormData((p) => ({ ...p, audio_url: '' }))}
                  className="px-2 py-1 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            )}

            {/* TTS Generator */}
            <div className="border rounded-md p-3 space-y-3 bg-gray-50">
              <VoiceTagsInput
                value={pageAudioText}
                onChange={setPageAudioText}
                placeholder="Enter text to generate audio..."
                dir="ltr"
                rows={2}
              />

              <VoiceSelector
                value={pageAudioVoice}
                onChange={setPageAudioVoice}
                label="Voice"
              />

              <button
                type="button"
                onClick={handleGeneratePageAudio}
                disabled={isGeneratingAudio}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isGeneratingAudio ? (
                  <>
                    <span className="animate-spin">&#9696;</span>
                    Generating...
                  </>
                ) : (
                  <>
                    <span>&#128266;</span>
                    Generate Audio
                  </>
                )}
              </button>
            </div>

            {/* Select from audio library */}
            <div className="border-t pt-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or select from Audio Library
              </label>
              <AudioPicker
                onChange={(audioId, audio) => {
                  if (audio?.url) {
                    setPageFormData((p) => ({ ...p, audio_url: audio.url }));
                  }
                }}
                placeholder="Select narration audio..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={() => setPageModalOpen(false)}
              className="px-4 py-2 text-sm text-gray-700 bg-white border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSavePage}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {editingPage ? 'Save Changes' : 'Add Page'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Availability Modal */}
      <Modal
        isOpen={availabilityModalOpen}
        onClose={() => {
          setAvailabilityModalOpen(false);
          setSelectedCurriculumId('');
          setSelectedTopicId('');
        }}
        title="Add Curriculum Access"
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Curriculum <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedCurriculumId}
              onChange={(e) => {
                setSelectedCurriculumId(e.target.value);
                setSelectedTopicId(''); // Reset topic when curriculum changes
              }}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Select curriculum...</option>
              {curricula?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title?.en || c.id}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Only children enrolled in this curriculum will see this book
            </p>
          </div>

          {selectedCurriculumId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unlock after topic (optional)
              </label>
              <select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Available immediately</option>
                {topics
                  ?.sort((a, b) => a.sequence_number - b.sequence_number)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.sequence_number}. {t.title?.en || t.letter?.letter || t.id}
                    </option>
                  ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                {selectedTopicId
                  ? 'Child must complete all topics up to and including the selected topic'
                  : 'Book will be available as soon as child enrolls in this curriculum'}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={() => setAvailabilityModalOpen(false)}
              className="px-4 py-2 text-sm text-gray-700 bg-white border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAvailability}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Add Rule
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Page Confirmation */}
      <ConfirmationModal
        isOpen={deletePageConfirmOpen}
        onClose={() => {
          setDeletePageConfirmOpen(false);
          setPageToDelete(null);
        }}
        onConfirm={handleDeletePageConfirm}
        title="Delete Page"
        message={`Are you sure you want to delete page ${pageToDelete?.page_number}? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
      />

      {/* Delete Availability Confirmation */}
      <ConfirmationModal
        isOpen={deleteAvailConfirmOpen}
        onClose={() => {
          setDeleteAvailConfirmOpen(false);
          setAvailToDelete(null);
        }}
        onConfirm={handleDeleteAvailConfirm}
        title="Remove Availability Rule"
        message="Are you sure you want to remove this availability rule?"
        confirmText="Remove"
        confirmVariant="danger"
      />

      {/* Cover Image Picker Modal */}
      <ImageLibraryModal
        isOpen={coverPickerOpen}
        onClose={() => setCoverPickerOpen(false)}
        onSelectImage={(url) => {
          if (coverPickerTarget === 'create') {
            setCreateFormData((p) => ({ ...p, cover_image_url: url }));
          } else {
            setFormData((p) => ({ ...p, cover_image_url: url }));
          }
          setCoverPickerOpen(false);
        }}
        currentImage={coverPickerTarget === 'create' ? createFormData.cover_image_url : formData.cover_image_url}
      />

      {/* Page Background Image Picker Modal */}
      <ImageLibraryModal
        isOpen={pageImagePickerOpen}
        onClose={() => setPageImagePickerOpen(false)}
        onSelectImage={(url) => {
          setPageFormData((p) => ({ ...p, background_image_url: url }));
          setPageImagePickerOpen(false);
        }}
        currentImage={pageFormData.background_image_url}
      />

      {/* Letter Selector Modal */}
      <LetterSelectorModal
        isOpen={letterSelectorOpen}
        onClose={() => setLetterSelectorOpen(false)}
        multiSelect={true}
        showFormSelector={false}
        selectedValue={(() => {
          const targetLetters = letterSelectorTarget === 'create'
            ? createFormData.target_letters
            : formData.target_letters;
          const refs: LetterReference[] = [];
          for (const char of targetLetters) {
            const letter = letters?.find((l) => l.letter === char);
            if (letter) {
              refs.push({ letterId: letter.id, form: 'isolated' });
            }
          }
          return refs;
        })()}
        onSelect={(refs) => {
          const letterRefs = Array.isArray(refs) ? refs : [refs];
          const letterChars = letterRefs
            .map((ref) => letters?.find((l) => l.id === ref.letterId)?.letter)
            .filter((char): char is string => char !== undefined);

          if (letterSelectorTarget === 'create') {
            setCreateFormData((p) => ({ ...p, target_letters: letterChars }));
          } else {
            setFormData((p) => ({ ...p, target_letters: letterChars }));
          }
        }}
      />
    </main>
  );
}
