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
import { Modal } from '@/components/ui/Modal';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { ImageLibraryModal } from '@/components/curriculum/forms/ImageLibraryModal';
import type {
  Book,
  BookPage,
  BookAvailability,
  CreateBookRequest,
  CreatePageRequest,
  UpdatePageRequest,
  AvailabilityType,
  CreateAvailabilityRequest,
} from '@/lib/api/books';
import { toast } from 'sonner';

type Tab = 'details' | 'pages' | 'availability';

const difficultyOptions = [
  { value: 1, label: 'Beginner' },
  { value: 2, label: 'Intermediate' },
  { value: 3, label: 'Advanced' },
];

const availabilityTypeLabels: Record<AvailabilityType, string> = {
  store_always: 'Store - Always Available',
  store_unlockable: 'Store - Unlockable',
  curriculum_reward: 'Curriculum Reward',
  default: 'Default (Everyone)',
};

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

  // Availability modal state
  const [availabilityModalOpen, setAvailabilityModalOpen] = useState(false);
  const [availabilityFormData, setAvailabilityFormData] = useState<CreateAvailabilityRequest>({
    availability_type: 'store_always',
  });

  // Delete availability confirmation
  const [deleteAvailConfirmOpen, setDeleteAvailConfirmOpen] = useState(false);
  const [availToDelete, setAvailToDelete] = useState<BookAvailability | null>(null);

  // Target letters input
  const [targetLetterInput, setTargetLetterInput] = useState('');

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
  }>({
    title: '',
    title_ar: '',
    synopsis: '',
    synopsis_ar: '',
    cover_image_url: '',
    difficulty_level: 1,
    target_letters: [],
    price: 0,
    is_premium: false,
  });
  const [createTargetLetterInput, setCreateTargetLetterInput] = useState('');

  // Cover image picker modal state
  const [coverPickerOpen, setCoverPickerOpen] = useState(false);
  const [coverPickerTarget, setCoverPickerTarget] = useState<'create' | 'edit'>('create');

  // Page image picker modal state
  const [pageImagePickerOpen, setPageImagePickerOpen] = useState(false);

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

  const handleAddTargetLetter = () => {
    const letter = targetLetterInput.trim();
    if (letter && !formData.target_letters.includes(letter)) {
      setFormData((prev) => ({
        ...prev,
        target_letters: [...prev.target_letters, letter],
      }));
      setTargetLetterInput('');
    }
  };

  const handleRemoveTargetLetter = (letter: string) => {
    setFormData((prev) => ({
      ...prev,
      target_letters: prev.target_letters.filter((l) => l !== letter),
    }));
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
    } else {
      setEditingPage(null);
      setPageFormData({
        page_number: (pages?.length || 0) + 1,
        layout: 'single',
        background_image_url: '',
        text_ar: '',
        audio_url: '',
      });
    }
    setPageModalOpen(true);
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
    createAvailability(
      { bookId, data: availabilityFormData },
      {
        onSuccess: () => {
          setAvailabilityModalOpen(false);
          setAvailabilityFormData({ availability_type: 'store_always' });
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

  // Create form handlers
  const handleCreateAddTargetLetter = () => {
    const letter = createTargetLetterInput.trim();
    if (letter && !createFormData.target_letters.includes(letter)) {
      setCreateFormData((prev) => ({
        ...prev,
        target_letters: [...prev.target_letters, letter],
      }));
      setCreateTargetLetterInput('');
    }
  };

  const handleCreateRemoveTargetLetter = (letter: string) => {
    setCreateFormData((prev) => ({
      ...prev,
      target_letters: prev.target_letters.filter((l) => l !== letter),
    }));
  };

  const handleCreateBook = () => {
    // Validate required fields
    if (!createFormData.title.trim()) {
      toast.error('Title (English) is required');
      return;
    }
    if (!createFormData.cover_image_url.trim()) {
      toast.error('Cover image URL is required');
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
        router.push(`/books/${newBook.id}`);
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
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={createTargetLetterInput}
                  onChange={(e) => setCreateTargetLetterInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' &&
                    (e.preventDefault(), handleCreateAddTargetLetter())
                  }
                  className="px-3 py-2 border rounded-md"
                  placeholder="Add letter"
                  dir="rtl"
                />
                <button
                  type="button"
                  onClick={handleCreateAddTargetLetter}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {createFormData.target_letters.map((letter) => (
                  <span
                    key={letter}
                    className="px-2 py-1 bg-blue-50 text-blue-700 rounded flex items-center gap-1"
                    dir="rtl"
                  >
                    {letter}
                    <button
                      type="button"
                      onClick={() => handleCreateRemoveTargetLetter(letter)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      &times;
                    </button>
                  </span>
                ))}
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
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={targetLetterInput}
                  onChange={(e) => setTargetLetterInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTargetLetter())}
                  className="px-3 py-2 border rounded-md"
                  placeholder="Add letter"
                  dir="rtl"
                />
                <button
                  type="button"
                  onClick={handleAddTargetLetter}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.target_letters.map((letter) => (
                  <span
                    key={letter}
                    className="px-2 py-1 bg-blue-50 text-blue-700 rounded flex items-center gap-1"
                    dir="rtl"
                  >
                    {letter}
                    <button
                      type="button"
                      onClick={() => handleRemoveTargetLetter(letter)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      &times;
                    </button>
                  </span>
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
            <h3 className="font-medium">Availability Rules ({availability?.length || 0})</h3>
            <button
              onClick={() => setAvailabilityModalOpen(true)}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
            >
              + Add Rule
            </button>
          </div>

          {!availability || availability.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No availability rules. Add one to control how this book is accessed.
            </div>
          ) : (
            <div className="divide-y">
              {availability.map((rule) => (
                <div key={rule.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {availabilityTypeLabels[rule.availability_type]}
                    </div>
                    {rule.prerequisite_type && (
                      <div className="text-sm text-gray-500">
                        Prerequisite: Complete {rule.prerequisite_type}
                        {rule.prerequisite_topic_id && ` (Topic: ${rule.prerequisite_topic_id})`}
                        {rule.prerequisite_node_id && ` (Node: ${rule.prerequisite_node_id})`}
                      </div>
                    )}
                    {rule.curriculum_id && (
                      <div className="text-sm text-gray-500">
                        Curriculum: {rule.curriculum_id}
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
              Arabic Text
            </label>
            <textarea
              value={pageFormData.text_ar}
              onChange={(e) => setPageFormData((p) => ({ ...p, text_ar: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md"
              rows={3}
              dir="rtl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Audio URL (optional)
            </label>
            <input
              type="text"
              value={pageFormData.audio_url || ''}
              onChange={(e) =>
                setPageFormData((p) => ({ ...p, audio_url: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-md"
              placeholder="https://..."
            />
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
        onClose={() => setAvailabilityModalOpen(false)}
        title="Add Availability Rule"
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Availability Type
            </label>
            {Object.entries(availabilityTypeLabels).map(([value, label]) => (
              <label key={value} className="flex items-center gap-2 mb-2">
                <input
                  type="radio"
                  name="availability_type"
                  value={value}
                  checked={availabilityFormData.availability_type === value}
                  onChange={(e) =>
                    setAvailabilityFormData((p) => ({
                      ...p,
                      availability_type: e.target.value as AvailabilityType,
                      prerequisite_type: undefined,
                      prerequisite_topic_id: undefined,
                      prerequisite_node_id: undefined,
                    }))
                  }
                />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>

          {(availabilityFormData.availability_type === 'store_unlockable' ||
            availabilityFormData.availability_type === 'curriculum_reward') && (
            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prerequisite Type
              </label>
              <select
                value={availabilityFormData.prerequisite_type || ''}
                onChange={(e) =>
                  setAvailabilityFormData((p) => ({
                    ...p,
                    prerequisite_type: e.target.value as 'topic' | 'node' | undefined,
                  }))
                }
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select...</option>
                <option value="topic">Complete Topic</option>
                <option value="node">Complete Node</option>
              </select>

              {availabilityFormData.prerequisite_type && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Topic ID
                  </label>
                  <input
                    type="text"
                    value={availabilityFormData.prerequisite_topic_id || ''}
                    onChange={(e) =>
                      setAvailabilityFormData((p) => ({
                        ...p,
                        prerequisite_topic_id: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Enter topic ID"
                  />
                </div>
              )}

              {availabilityFormData.prerequisite_type === 'node' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Node ID
                  </label>
                  <input
                    type="text"
                    value={availabilityFormData.prerequisite_node_id || ''}
                    onChange={(e) =>
                      setAvailabilityFormData((p) => ({
                        ...p,
                        prerequisite_node_id: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Enter node ID"
                  />
                </div>
              )}
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
    </main>
  );
}
