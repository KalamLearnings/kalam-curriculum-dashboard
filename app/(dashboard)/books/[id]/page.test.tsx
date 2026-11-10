import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Book, BookPage, CreatePageRequest, UpdatePageRequest } from '@/lib/api/books';
import type { AudioAsset } from '@/lib/types/audio';
import BookEditorPage from './page';

const mocks = vi.hoisted(() => ({
  book: null as Book | null,
  pages: [] as BookPage[],
  createPage: vi.fn(),
  updatePage: vi.fn(),
  getSession: vi.fn(),
  upload: vi.fn(),
  getPublicUrl: vi.fn(),
  fetch: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
  audioAssets: [] as AudioAsset[],
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'book-1' }),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/lib/hooks/useBooks', () => ({
  useBook: () => ({ data: mocks.book, isLoading: false }),
  useBookPages: () => ({ data: mocks.pages, isLoading: false }),
  useBookAvailability: () => ({ data: [] }),
  useCreateBook: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdateBook: () => ({ mutate: vi.fn(), isPending: false }),
  useCreatePage: () => ({ mutate: mocks.createPage }),
  useUpdatePage: () => ({ mutate: mocks.updatePage }),
  useDeletePage: () => ({ mutate: vi.fn() }),
  useCreateAvailability: () => ({ mutate: vi.fn() }),
  useDeleteAvailability: () => ({ mutate: vi.fn() }),
}));

vi.mock('@/lib/hooks/useCurriculum', () => ({ useCurricula: () => ({ data: [] }) }));
vi.mock('@/lib/hooks/useTopics', () => ({ useTopics: () => ({ data: [] }) }));
vi.mock('@/lib/hooks/useLetters', () => ({ useLetters: () => ({ letters: [] }) }));
vi.mock('@/components/curriculum/LetterSelectorModal', () => ({ LetterSelectorModal: () => null }));
vi.mock('@/lib/hooks/useAudio', () => ({
  useAudio: () => ({
    audioAssets: mocks.audioAssets, loading: false, error: null, searchQuery: '',
    selectedCategory: undefined, setCategory: vi.fn(), setSearchQuery: vi.fn(),
  }),
}));
vi.mock('@/components/audio/AudioGrid', () => ({
  AudioGrid: ({ onSelectAudio }: { onSelectAudio: (asset: AudioAsset) => void }) =>
    <>{mocks.audioAssets.map((asset) => (
      <button key={asset.id} onClick={() => onSelectAudio(asset)}>Choose {asset.displayName}</button>
    ))}</>,
}));
vi.mock('@/components/audio/AudioCategoryFilter', () => ({ AudioCategoryFilter: () => null }));
vi.mock('@/components/audio/AudioSearchBar', () => ({ AudioSearchBar: () => null }));
vi.mock('@/components/curriculum/forms/ImageLibraryModal', async () => {
  const { Modal } = await import('@/components/ui/Modal');
  return {
    ImageLibraryModal: ({ isOpen, onClose, onSelectImage }: {
      isOpen: boolean;
      onClose: () => void;
      onSelectImage: (url: string) => void;
    }) => <Modal isOpen={isOpen} onClose={onClose} title="Choose image">
      <button onClick={() => onSelectImage('https://assets.invalid/scene.png')}>Choose test image</button>
    </Modal>,
  };
});

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: { getSession: mocks.getSession },
    storage: {
      from: () => ({ upload: mocks.upload, getPublicUrl: mocks.getPublicUrl }),
    },
  }),
  getEnvironmentBaseUrl: () => 'https://backend.invalid',
  getEdgeFunctionAuthHeaders: () => ({ Authorization: 'Bearer fake-session' }),
}));
vi.mock('sonner', () => ({ toast: { success: mocks.success, error: mocks.error } }));

const originalAudio = 'https://assets.invalid/original.mp3';
const generatedAudio = 'https://assets.invalid/generated.mp3';
const libraryAudio = 'https://assets.invalid/library.mp3';
const timings = [{ word: 'Saleh', start_ms: 0, end_ms: 300 }];

function makeAudio(transcript?: string): AudioAsset {
  return {
    id: 'audio-1', name: 'narration', displayName: 'Library narration',
    url: libraryAudio, storagePath: 'library.mp3', category: 'instructions',
    tags: [], mimeType: 'audio/mpeg', createdAt: '', updatedAt: '',
    ...(transcript ? { metadata: { ttsText: transcript } } : {}),
  };
}

function chooseLibraryAudio(transcript?: string) {
  mocks.audioAssets = [makeAudio(transcript)];
  fireEvent.click(screen.getByText('Select narration audio...'));
  fireEvent.click(screen.getByRole('button', { name: 'Choose Library narration' }));
}

function makePage(overrides: Partial<BookPage> = {}): BookPage {
  return {
    id: 'page-1',
    book_id: 'book-1',
    page_number: 1,
    layout: 'single',
    background_image_url: 'https://assets.invalid/scene.png',
    text: '',
    audio_url: originalAudio,
    word_timings: [],
    interactive_elements: [],
    layers: [],
    created_at: '2026-11-09T00:00:00Z',
    ...overrides,
  };
}

function ttsResponse() {
  return {
    ok: true,
    json: async () => ({ data: { audio_data: 'YXVkaW8=', content_type: 'audio/mpeg', word_timings: timings } }),
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => { resolve = resolvePromise; });
  return { promise, resolve };
}

function openPages() {
  render(<BookEditorPage />);
  fireEvent.click(screen.getByRole('button', { name: /^Pages/ }));
}

function editPage(page: BookPage = makePage()) {
  mocks.pages = [page];
  openPages();
  fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
}

function setText(value: string) {
  fireEvent.change(screen.getByLabelText('Text', { exact: true }), {
    target: { value },
  });
}

function currentAudio() {
  return document.querySelector('audio')?.getAttribute('src');
}

async function generateAudio() {
  const successCount = mocks.success.mock.calls.length + 1;
  fireEvent.click(screen.getByRole('button', { name: /Generate Audio/ }));
  await waitFor(() => expect(mocks.success).toHaveBeenCalledTimes(successCount));
  expect(mocks.success).toHaveBeenLastCalledWith('Audio generated and uploaded!');
}

function saveAndReopen(saveLabel = 'Save Changes') {
  fireEvent.click(screen.getByRole('button', { name: saveLabel }));
  expect(screen.queryByLabelText('Text', { exact: true })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal('fetch', mocks.fetch);
  mocks.pages = [];
  mocks.audioAssets = [];
  mocks.book = {
    id: 'book-1',
    shop_item_id: 'shop-1',
    title: 'Fancy Shoes',
    title_ar: 'حذاء جميل',
    synopsis: null,
    synopsis_ar: null,
    difficulty_level: 1,
    page_count: 1,
    estimated_read_time_minutes: null,
    target_letters: [],
    created_at: '2026-11-09T00:00:00Z',
    updated_at: '2026-11-09T00:00:00Z',
    image_url: '',
    price: 0,
    is_premium: false,
    is_active: true,
    availability_rules: [],
  };
  mocks.getSession.mockResolvedValue({ data: { session: { access_token: 'fake-session' } } });
  mocks.fetch.mockResolvedValue(ttsResponse());
  mocks.upload.mockResolvedValue({ data: { path: 'books/generated.mp3' }, error: null });
  mocks.getPublicUrl.mockReturnValue({ data: { publicUrl: generatedAudio } });
  // Persist only the submitted mutation payload, so reopening cannot rely on unsaved form state.
  mocks.createPage.mockImplementation((
    { data }: { data: CreatePageRequest },
    options: { onSuccess: () => void },
  ) => {
    mocks.pages = [makePage(data)];
    options.onSuccess();
  });
  mocks.updatePage.mockImplementation((
    { pageId, data }: { pageId: string; data: UpdatePageRequest },
    options: { onSuccess: () => void },
  ) => {
    mocks.pages = mocks.pages.map((page) => page.id === pageId ? { ...page, ...data } : page);
    options.onSuccess();
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('BookEditorPage text and narration persistence', () => {
  it('generates, saves, and reopens one mixed-language source with clean reader text and timings', async () => {
    openPages();
    fireEvent.click(screen.getByRole('button', { name: '+ Add Page' }));
    fireEvent.click(screen.getByRole('button', { name: 'Click to select background image' }));
    fireEvent.click(screen.getByRole('button', { name: 'Choose test image' }));
    const source = '[excited] Saleh found a فَانُوس [أزرق].\n\n[short pause] It glowed in [A]!';
    const display = 'Saleh found a فَانُوس [أزرق].\n\nIt glowed in [A]!';
    setText(source);

    await generateAudio();

    expect(JSON.parse(mocks.fetch.mock.calls[0][1].body)).toMatchObject({
      text: source, display_text: display, timestamps: true,
    });
    expect(screen.getAllByRole('textbox')).toHaveLength(1);
    expect(screen.getByLabelText('Text')).toHaveValue(source);
    expect(currentAudio()).toBe(generatedAudio);
    saveAndReopen('Add Page');
    expect(mocks.createPage.mock.calls[0][0].data).toMatchObject({
      text: display, audio_url: generatedAudio, word_timings: timings,
    });
    expect(screen.getByLabelText('Text')).toHaveValue(display);
    expect(currentAudio()).toBe(generatedAudio);
  });

  it('voices the latest edited wording, clears previous narration, and refreshes the preview', async () => {
    editPage(makePage({ text: 'Original wording.', word_timings: timings }));
    const originalPreview = document.querySelector('audio');
    setText('[gentle] Revised wording.');
    expect(currentAudio()).toBeUndefined();
    expect(screen.getByRole('status')).toHaveTextContent('Text changed. Generate narration again');

    await generateAudio();
    expect(JSON.parse(mocks.fetch.mock.calls[0][1].body).text).toBe('[gentle] Revised wording.');
    expect(document.querySelector('audio')).not.toBe(originalPreview);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    saveAndReopen();
    expect(mocks.updatePage.mock.calls[0][0].data).toMatchObject({
      text: 'Revised wording.', audio_url: generatedAudio, word_timings: timings,
    });
    expect(screen.getByLabelText('Text')).toHaveValue('Revised wording.');
  });

  it('clears generated audio and timing when Text changes again before saving', async () => {
    editPage();
    setText('First wording.');
    await generateAudio();
    setText('Second wording.');
    expect(currentAudio()).toBeUndefined();
    saveAndReopen();
    expect(mocks.updatePage.mock.calls[0][0].data).toMatchObject({
      text: 'Second wording.', audio_url: '', word_timings: [],
    });
    expect(currentAudio()).toBeUndefined();
  });

  it('preserves unchanged saved text, audio, and timings', () => {
    editPage(makePage({ text: 'Saved words.', word_timings: timings }));
    saveAndReopen();
    expect(mocks.updatePage.mock.calls[0][0].data).toMatchObject({
      text: 'Saved words.', audio_url: originalAudio, word_timings: timings,
    });
    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  it('allows exact wording to be recovered for legacy audio without inventing a transcript', () => {
    editPage();
    expect(screen.getByText(/This audio has no saved text/)).toBeInTheDocument();
    expect(screen.getByLabelText('Text')).toHaveValue('');
    setText('The exact recovered wording.');
    expect(screen.queryByText(/This audio has no saved text/)).not.toBeInTheDocument();
    saveAndReopen();
    expect(mocks.updatePage.mock.calls[0][0].data).toMatchObject({
      text: 'The exact recovered wording.', audio_url: originalAudio, word_timings: [],
    });
    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  it.each([
    { source: 'Hello[pause]world [A]', display: 'Hello world [A]' },
    { source: 'مرحبًا[pause]صديقي [أزرق]', display: 'مرحبًا صديقي [أزرق]' },
    { source: '[WHISPERS] أهلاً!\n\n[long pause] Welcome.', display: 'أهلاً!\n\nWelcome.' },
  ])('keeps prose and word boundaries when saving $source', ({ source, display }) => {
    editPage();
    setText(source);
    saveAndReopen();
    expect(mocks.updatePage.mock.calls[0][0].data.text).toBe(display);
    expect(screen.getByLabelText('Text')).toHaveValue(display);
  });

  it('keeps supported voice-tag insertion in the single text input', async () => {
    editPage();
    setText('Hello');
    const input = screen.getByLabelText('Text') as HTMLTextAreaElement;
    input.setSelectionRange(5, 5);
    fireEvent.click(screen.getByRole('button', { name: '[pause]' }));
    expect(input).toHaveValue('Hello [pause] ');
    await generateAudio();
    expect(JSON.parse(mocks.fetch.mock.calls[0][1].body)).toMatchObject({
      text: 'Hello [pause]', display_text: 'Hello',
    });
  });

  it('does not call TTS for a draft containing only performance tags', () => {
    editPage();
    setText('[happy] [pause]');
    fireEvent.click(screen.getByRole('button', { name: /Generate Audio/ }));
    expect(mocks.error).toHaveBeenCalledWith('Please enter text for audio generation');
    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  it('keeps draft text on provider failure and permits saving it without stale known audio', async () => {
    mocks.fetch.mockResolvedValue({ ok: false, json: async () => ({ error: 'Narration unavailable' }) });
    editPage(makePage({ text: 'Old words.', word_timings: timings }));
    setText('[gentle] Keep this authored story.');
    fireEvent.click(screen.getByRole('button', { name: /Generate Audio/ }));
    await waitFor(() => expect(mocks.error).toHaveBeenCalledWith('Narration unavailable'));
    expect(mocks.upload).not.toHaveBeenCalled();
    expect(mocks.updatePage).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Text')).toHaveValue('[gentle] Keep this authored story.');
    saveAndReopen();
    expect(mocks.updatePage.mock.calls[0][0].data).toMatchObject({
      text: 'Keep this authored story.', audio_url: '', word_timings: [],
    });
  });

  it('retains the draft and enables retry when audio upload fails', async () => {
    mocks.upload.mockResolvedValue({ data: null, error: { message: 'Storage unavailable' } });
    editPage();
    setText('A new narration.');
    fireEvent.click(screen.getByRole('button', { name: /Generate Audio/ }));
    await waitFor(() => expect(mocks.error).toHaveBeenCalledWith('Upload failed: Storage unavailable'));
    expect(mocks.success).not.toHaveBeenCalled();
    expect(mocks.updatePage).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Text')).toHaveValue('A new narration.');
    expect(screen.getByRole('button', { name: /Generate Audio/ })).toBeEnabled();
  });

  it('keeps Save disabled through the current provider and storage request', async () => {
    const generation = deferred<ReturnType<typeof ttsResponse>>();
    const upload = deferred<{ data: { path: string }; error: null }>();
    mocks.fetch.mockReturnValue(generation.promise);
    mocks.upload.mockReturnValue(upload.promise);
    editPage();
    setText('Submitted wording.');
    fireEvent.click(screen.getByRole('button', { name: /Generate Audio/ }));
    await waitFor(() => expect(mocks.fetch).toHaveBeenCalledOnce());
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeDisabled();
    await act(async () => { generation.resolve(ttsResponse()); });
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeDisabled();
    await act(async () => { upload.resolve({ data: { path: 'generated.mp3' }, error: null }); });
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeEnabled();
    expect(currentAudio()).toBe(generatedAudio);
  });

  it('does not start a stale provider request after the draft closes during authentication', async () => {
    const session = deferred<{ data: { session: { access_token: string } } }>();
    mocks.getSession.mockReturnValue(session.promise);
    editPage();
    setText('Abandoned draft.');
    fireEvent.click(screen.getByRole('button', { name: /Generate Audio/ }));
    await waitFor(() => expect(mocks.getSession).toHaveBeenCalledOnce());
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await act(async () => { session.resolve({ data: { session: { access_token: 'fake-session' } } }); });
    expect(mocks.fetch).not.toHaveBeenCalled();
    expect(mocks.upload).not.toHaveBeenCalled();
  });

  it('ignores a pending response after Text changes', async () => {
    const generation = deferred<ReturnType<typeof ttsResponse>>();
    mocks.fetch.mockReturnValue(generation.promise);
    editPage(makePage({ text: 'Old words.' }));
    setText('Submitted words.');
    fireEvent.click(screen.getByRole('button', { name: /Generate Audio/ }));
    await waitFor(() => expect(mocks.fetch).toHaveBeenCalledOnce());
    setText('New draft words.');
    await act(async () => { generation.resolve(ttsResponse()); });
    expect(mocks.upload).not.toHaveBeenCalled();
    expect(mocks.success).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Text')).toHaveValue('New draft words.');
    expect(currentAudio()).toBeUndefined();
  });

  it('does not overwrite a library selection with a late generated upload', async () => {
    const upload = deferred<{ data: { path: string }; error: null }>();
    mocks.upload.mockReturnValue(upload.promise);
    editPage();
    setText('Matching words.');
    fireEvent.click(screen.getByRole('button', { name: /Generate Audio/ }));
    await waitFor(() => expect(mocks.upload).toHaveBeenCalledOnce());
    chooseLibraryAudio('[gentle] Matching words.');
    expect(currentAudio()).toBe(libraryAudio);
    await act(async () => { upload.resolve({ data: { path: 'generated.mp3' }, error: null }); });
    expect(currentAudio()).toBe(libraryAudio);
    expect(mocks.success).not.toHaveBeenCalled();
    saveAndReopen();
    expect(mocks.updatePage.mock.calls[0][0].data).toMatchObject({
      text: 'Matching words.', audio_url: libraryAudio, word_timings: [],
    });
  });

  it('ignores a late upload after cancelling and opening a different page', async () => {
    const upload = deferred<{ data: { path: string }; error: null }>();
    const secondAudio = 'https://assets.invalid/second.mp3';
    mocks.upload.mockReturnValue(upload.promise);
    mocks.pages = [makePage(), makePage({ id: 'page-2', page_number: 2, text: 'Second page.', audio_url: secondAudio })];
    openPages();
    fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
    setText('Page one narration.');
    fireEvent.click(screen.getByRole('button', { name: /Generate Audio/ }));
    await waitFor(() => expect(mocks.upload).toHaveBeenCalledOnce());
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[1]);
    await act(async () => { upload.resolve({ data: { path: 'generated.mp3' }, error: null }); });
    expect(screen.getByRole('heading', { name: 'Edit Page 2' })).toBeInTheDocument();
    expect(screen.getByLabelText('Text')).toHaveValue('Second page.');
    expect(currentAudio()).toBe(secondAudio);
    expect(mocks.success).not.toHaveBeenCalled();
  });

  it('imports library narration text into an empty page and saves clean copy without guessed timings', () => {
    editPage();
    chooseLibraryAudio('[happy] Library words [أزرق].');
    expect(screen.getByLabelText('Text')).toHaveValue('[happy] Library words [أزرق].');
    expect(currentAudio()).toBe(libraryAudio);
    saveAndReopen();
    expect(mocks.updatePage.mock.calls[0][0].data).toMatchObject({
      text: 'Library words [أزرق].', audio_url: libraryAudio, word_timings: [],
    });
  });

  it('rejects mismatched library narration without replacing authored text or existing audio', () => {
    editPage(makePage({ text: 'Authored words.', word_timings: timings }));
    chooseLibraryAudio('Different words.');
    expect(mocks.error).toHaveBeenCalledWith('This audio has different words. Clear Text first to use its transcript.');
    expect(screen.getByLabelText('Text')).toHaveValue('Authored words.');
    expect(currentAudio()).toBe(originalAudio);
    expect(screen.queryByText('Library narration')).not.toBeInTheDocument();
    saveAndReopen();
    expect(mocks.updatePage.mock.calls[0][0].data.word_timings).toEqual(timings);
  });

  it('does not invent text for library audio without a transcript and can clear that audio', () => {
    editPage(makePage({ word_timings: timings }));
    chooseLibraryAudio();
    expect(screen.getByLabelText('Text')).toHaveValue('');
    expect(screen.getByText(/This audio has no saved text/)).toBeInTheDocument();
    // This is AudioPicker’s clear target, rather than the separate preview removal button.
    const label = screen.getByText('Library narration');
    fireEvent.click(label.parentElement!.parentElement!.querySelector('button')!);
    expect(currentAudio()).toBeUndefined();
    saveAndReopen();
    expect(mocks.updatePage.mock.calls[0][0].data).toMatchObject({ text: '', audio_url: '', word_timings: [] });
  });

  it('preserves paragraph formatting when library narration has the same spoken words', () => {
    editPage(makePage({ text: 'Hello\n\nصديقي.' }));
    chooseLibraryAudio('[gentle] Hello صديقي.');
    expect(mocks.error).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Text')).toHaveValue('Hello\n\nصديقي.');
    expect(currentAudio()).toBe(libraryAudio);
    saveAndReopen();
    expect(mocks.updatePage.mock.calls[0][0].data.text).toBe('Hello\n\nصديقي.');
  });

  it('invalidates manually supplied library audio after its authored text is edited', () => {
    editPage(makePage({ text: 'Current wording.' }));
    chooseLibraryAudio();
    expect(currentAudio()).toBe(libraryAudio);
    setText('Revised wording.');
    expect(currentAudio()).toBeUndefined();
    expect(screen.getByRole('status')).toHaveTextContent('Text changed. Generate narration again');
    saveAndReopen();
    expect(mocks.updatePage.mock.calls[0][0].data).toMatchObject({
      text: 'Revised wording.', audio_url: '', word_timings: [],
    });
  });

  it.each(['audio', 'image'])('Escape closes only the nested %s picker and keeps unsaved Text', (picker) => {
    editPage();
    setText('Unsaved words.');
    fireEvent.click(picker === 'audio'
      ? screen.getByText('Select narration audio...')
      : screen.getByRole('button', { name: 'Change' }));
    const title = picker === 'audio' ? 'Select Audio' : 'Choose image';
    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('heading', { name: title })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Text')).toHaveValue('Unsaved words.');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByLabelText('Text')).not.toBeInTheDocument();
  });

  it('locks the draft during Save, prevents duplicate writes and dismissal, and restores it after failure', () => {
    let callbacks!: { onSuccess: () => void; onError: () => void };
    mocks.updatePage.mockImplementation((_request, options) => { callbacks = options; });
    editPage();
    setText('Keep this draft.');
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    expect(screen.getByLabelText('Text')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Generate Audio/ })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Saving...' }));
    fireEvent.keyDown(document, { key: 'Escape' });
    const heading = screen.getByRole('heading', { name: 'Edit Page 1' });
    fireEvent.click(heading.parentElement!.querySelector('button')!);
    expect(mocks.updatePage).toHaveBeenCalledOnce();
    expect(screen.getByLabelText('Text')).toHaveValue('Keep this draft.');
    act(() => callbacks.onError());
    expect(screen.getByLabelText('Text')).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    expect(mocks.updatePage).toHaveBeenCalledTimes(2);
    act(() => callbacks.onSuccess());
    expect(screen.queryByLabelText('Text')).not.toBeInTheDocument();
  });
});
