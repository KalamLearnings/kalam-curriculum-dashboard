'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  useGame,
  useCreateGame,
  useUpdateGame,
  useGameAvailability,
  useCreateGameAvailability,
  useDeleteGameAvailability,
} from '@/lib/hooks/useGames';
import { useCurricula } from '@/lib/hooks/useCurriculum';
import { useTopics } from '@/lib/hooks/useTopics';
import { Modal } from '@/components/ui/Modal';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { ImageLibraryModal } from '@/components/curriculum/forms/ImageLibraryModal';
import type {
  Game,
  GameAvailability,
  CreateGameRequest,
} from '@/lib/api/games';
import { toast } from 'sonner';

type Tab = 'details' | 'availability';

const difficultyOptions = [
  { value: 1, label: 'Easy' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'Hard' },
];

const skillOptions = [
  'letter-recognition',
  'word-building',
  'listening',
  'hand-eye-coordination',
  'memory',
  'pattern-matching',
  'speed',
  'focus',
];

export default function GameEditorPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;
  const isNew = gameId === 'new';

  const [activeTab, setActiveTab] = useState<Tab>('details');

  // Game data
  const { data: game, isLoading: gameLoading } = useGame(isNew ? null : gameId);
  const { data: availability } = useGameAvailability(isNew ? null : gameId);

  // Availability modal state
  const [availabilityModalOpen, setAvailabilityModalOpen] = useState(false);
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<string>('');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');

  // Curricula and topics for availability
  const { data: curricula } = useCurricula();
  const { data: topics } = useTopics(selectedCurriculumId || null);

  // Mutations
  const { mutate: createGameMutation, isPending: isCreating } = useCreateGame();
  const { mutate: updateGame, isPending: isUpdating } = useUpdateGame();
  const { mutate: createAvailability } = useCreateGameAvailability();
  const { mutate: deleteAvailability } = useDeleteGameAvailability();

  // Form state for details
  const [formData, setFormData] = useState({
    title: '',
    title_ar: '',
    description: '',
    cover_image_url: '',
    game_key: '',
    difficulty_level: 1 as 1 | 2 | 3,
    target_skills: [] as string[],
    min_age: null as number | null,
    max_age: null as number | null,
    price: 0,
    is_premium: false,
    is_active: true,
  });

  // Delete availability confirmation
  const [deleteAvailConfirmOpen, setDeleteAvailConfirmOpen] = useState(false);
  const [availToDelete, setAvailToDelete] = useState<GameAvailability | null>(null);

  // Create form state (for new games)
  const [createFormData, setCreateFormData] = useState<{
    title: string;
    title_ar: string;
    description: string;
    cover_image_url: string;
    game_key: string;
    difficulty_level: 1 | 2 | 3;
    target_skills: string[];
    min_age: number | null;
    max_age: number | null;
    price: number;
    is_premium: boolean;
    curriculum_id: string;
    unlock_after_topic_id: string;
  }>({
    title: '',
    title_ar: '',
    description: '',
    cover_image_url: '',
    game_key: '',
    difficulty_level: 1,
    target_skills: [],
    min_age: null,
    max_age: null,
    price: 0,
    is_premium: true,
    curriculum_id: '',
    unlock_after_topic_id: '',
  });

  // Topics for create form
  const { data: createTopics } = useTopics(createFormData.curriculum_id || null);

  // Cover image picker modal state
  const [coverPickerOpen, setCoverPickerOpen] = useState(false);
  const [coverPickerTarget, setCoverPickerTarget] = useState<'create' | 'edit'>('create');

  // Load game data into form
  useEffect(() => {
    if (game) {
      setFormData({
        title: game.title,
        title_ar: game.title_ar || '',
        description: game.description || '',
        cover_image_url: game.image_url || '',
        game_key: game.game_key,
        difficulty_level: game.difficulty_level,
        target_skills: game.target_skills || [],
        min_age: game.min_age,
        max_age: game.max_age,
        price: game.price || 0,
        is_premium: game.is_premium || false,
        is_active: game.is_active,
      });
    }
  }, [game]);

  const handleSaveDetails = () => {
    if (!gameId || isNew) return;

    updateGame({
      gameId,
      data: {
        title: formData.title,
        title_ar: formData.title_ar || null,
        description: formData.description || null,
        cover_image_url: formData.cover_image_url,
        game_key: formData.game_key,
        difficulty_level: formData.difficulty_level,
        target_skills: formData.target_skills,
        min_age: formData.min_age,
        max_age: formData.max_age,
        price: formData.price,
        is_premium: formData.is_premium,
        is_active: formData.is_active,
      },
    });
  };

  // Availability handlers
  const handleSaveAvailability = () => {
    if (!selectedCurriculumId) {
      toast.error('Please select a curriculum');
      return;
    }

    const availabilityType = selectedTopicId ? 'store_unlockable' : 'store_always';

    createAvailability(
      {
        gameId,
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

  const handleDeleteAvailClick = (rule: GameAvailability) => {
    setAvailToDelete(rule);
    setDeleteAvailConfirmOpen(true);
  };

  const handleDeleteAvailConfirm = () => {
    if (!availToDelete) return;
    deleteAvailability(
      { gameId, ruleId: availToDelete.id },
      {
        onSuccess: () => {
          setDeleteAvailConfirmOpen(false);
          setAvailToDelete(null);
        },
      }
    );
  };

  const handleSkillToggle = (skill: string, isCreate: boolean) => {
    if (isCreate) {
      setCreateFormData((p) => ({
        ...p,
        target_skills: p.target_skills.includes(skill)
          ? p.target_skills.filter((s) => s !== skill)
          : [...p.target_skills, skill],
      }));
    } else {
      setFormData((p) => ({
        ...p,
        target_skills: p.target_skills.includes(skill)
          ? p.target_skills.filter((s) => s !== skill)
          : [...p.target_skills, skill],
      }));
    }
  };

  const handleCreateGame = () => {
    if (!createFormData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!createFormData.cover_image_url.trim()) {
      toast.error('Cover image is required');
      return;
    }
    if (!createFormData.game_key.trim()) {
      toast.error('Game key is required');
      return;
    }
    if (!/^[a-z0-9-]+$/.test(createFormData.game_key)) {
      toast.error('Game key must be lowercase letters, numbers, and dashes only');
      return;
    }
    if (!createFormData.curriculum_id) {
      toast.error('Curriculum is required');
      return;
    }

    const requestData: CreateGameRequest = {
      title: createFormData.title.trim(),
      cover_image_url: createFormData.cover_image_url.trim(),
      game_key: createFormData.game_key.trim(),
      difficulty_level: createFormData.difficulty_level,
    };

    if (createFormData.title_ar.trim()) {
      requestData.title_ar = createFormData.title_ar.trim();
    }
    if (createFormData.description.trim()) {
      requestData.description = createFormData.description.trim();
    }
    if (createFormData.target_skills.length > 0) {
      requestData.target_skills = createFormData.target_skills;
    }
    if (createFormData.min_age !== null) {
      requestData.min_age = createFormData.min_age;
    }
    if (createFormData.max_age !== null) {
      requestData.max_age = createFormData.max_age;
    }
    if (createFormData.price > 0) {
      requestData.price = createFormData.price;
    }
    if (createFormData.is_premium) {
      requestData.is_premium = createFormData.is_premium;
    }

    createGameMutation(requestData, {
      onSuccess: (newGame) => {
        const availabilityType = createFormData.unlock_after_topic_id ? 'store_unlockable' : 'store_always';
        createAvailability(
          {
            gameId: newGame.id,
            data: {
              availability_type: availabilityType,
              curriculum_id: createFormData.curriculum_id,
              prerequisite_type: createFormData.unlock_after_topic_id ? 'topic' : undefined,
              prerequisite_topic_id: createFormData.unlock_after_topic_id || undefined,
            },
          },
          {
            onSuccess: () => {
              router.push(`/games/${newGame.id}`);
            },
            onError: () => {
              toast.error('Game created but failed to set availability. Please add it manually.');
              router.push(`/games/${newGame.id}`);
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
            onClick={() => router.push('/games')}
            className="text-gray-500 hover:text-gray-700"
          >
            &larr; Back
          </button>
          <h1 className="text-2xl font-bold">Create New Game</h1>
        </div>

        {/* Create Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={createFormData.title}
                onChange={(e) =>
                  setCreateFormData((p) => ({ ...p, title: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Cloud Bouncer"
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
                placeholder="القافز على الغيوم"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Game Key <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={createFormData.game_key}
                onChange={(e) =>
                  setCreateFormData((p) => ({
                    ...p,
                    game_key: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                  }))
                }
                className="w-full px-3 py-2 border rounded-md font-mono"
                placeholder="cloud-bouncer"
              />
              <p className="mt-1 text-xs text-gray-500">
                Unique identifier used in mobile app code
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty <span className="text-red-500">*</span>
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
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={createFormData.description}
                onChange={(e) =>
                  setCreateFormData((p) => ({ ...p, description: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded-md"
                rows={2}
                placeholder="A fun jumping game to practice letters!"
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
                    className="w-32 h-20 object-cover rounded border"
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
            <div className="flex items-center gap-6">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age Range
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="3"
                  max="12"
                  value={createFormData.min_age ?? ''}
                  onChange={(e) =>
                    setCreateFormData((p) => ({
                      ...p,
                      min_age: e.target.value ? parseInt(e.target.value) : null,
                    }))
                  }
                  className="w-20 px-3 py-2 border rounded-md"
                  placeholder="Min"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  min="3"
                  max="12"
                  value={createFormData.max_age ?? ''}
                  onChange={(e) =>
                    setCreateFormData((p) => ({
                      ...p,
                      max_age: e.target.value ? parseInt(e.target.value) : null,
                    }))
                  }
                  className="w-20 px-3 py-2 border rounded-md"
                  placeholder="Max"
                />
                <span className="text-gray-500 text-sm">years</span>
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Skills
              </label>
              <div className="flex flex-wrap gap-2">
                {skillOptions.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleSkillToggle(skill, true)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      createFormData.target_skills.includes(skill)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
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
                        unlock_after_topic_id: '',
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
                    Only children in this curriculum will see the game
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
                      : 'Game available as soon as child enrolls'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => router.push('/games')}
              className="px-4 py-2 text-gray-700 bg-white border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateGame}
              disabled={isCreating}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : 'Create Game'}
            </button>
          </div>
        </div>

        {/* Cover Image Picker Modal */}
        <ImageLibraryModal
          isOpen={coverPickerOpen}
          onClose={() => setCoverPickerOpen(false)}
          onSelectImage={(url) => {
            setCreateFormData((p) => ({ ...p, cover_image_url: url }));
            setCoverPickerOpen(false);
          }}
          currentImage={createFormData.cover_image_url}
        />
      </main>
    );
  }

  if (gameLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!game) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-600">Game not found</p>
        <button
          onClick={() => router.push('/games')}
          className="mt-4 text-blue-600 hover:text-blue-700"
        >
          Back to Games
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
            onClick={() => router.push('/games')}
            className="text-gray-500 hover:text-gray-700"
          >
            &larr; Back
          </button>
          <h1 className="text-2xl font-bold">{game.title}</h1>
          {!game.is_active && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded">
              Inactive
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b mb-6">
        <nav className="flex gap-4">
          {(['details', 'availability'] as Tab[]).map((tab) => (
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
                Title
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
                Game Key
              </label>
              <input
                type="text"
                value={formData.game_key}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    game_key: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                  }))
                }
                className="w-full px-3 py-2 border rounded-md font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
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
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md"
                rows={2}
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
                    className="w-32 h-20 object-cover rounded border"
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age Range
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="3"
                  max="12"
                  value={formData.min_age ?? ''}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      min_age: e.target.value ? parseInt(e.target.value) : null,
                    }))
                  }
                  className="w-20 px-3 py-2 border rounded-md"
                  placeholder="Min"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  min="3"
                  max="12"
                  value={formData.max_age ?? ''}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      max_age: e.target.value ? parseInt(e.target.value) : null,
                    }))
                  }
                  className="w-20 px-3 py-2 border rounded-md"
                  placeholder="Max"
                />
                <span className="text-gray-500 text-sm">years</span>
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Skills
              </label>
              <div className="flex flex-wrap gap-2">
                {skillOptions.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleSkillToggle(skill, false)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      formData.target_skills.includes(skill)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
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
            Games are only visible to children enrolled in the curricula listed below.
            Optionally require topic completion before the game can be purchased.
          </div>

          {!availability || availability.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No curricula assigned. Add one to make this game available to children.
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
                setSelectedTopicId('');
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
              Only children enrolled in this curriculum will see this game
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
                  : 'Game will be available as soon as child enrolls in this curriculum'}
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
    </main>
  );
}
