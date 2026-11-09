import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Book, BookPage, CreatePageRequest, UpdatePageRequest } from '@/lib/api/books';
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
vi.mock('@/components/audio/AudioPicker', () => ({ AudioPicker: () => null }));
vi.mock('@/components/curriculum/forms/ImageLibraryModal', () => ({
  ImageLibraryModal: ({ isOpen, onSelectImage }: {
    isOpen: boolean;
    onSelectImage: (url: string) => void;
  }) => isOpen ? (
    <button onClick={() => onSelectImage('https://assets.invalid/scene.png')}>Choose test image</button>
  ) : null,
}));

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
    json: async () => ({ data: { audio_data: 'YXVkaW8=', content_type: 'audio/mpeg' } }),
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

function setNarration(value: string) {
  fireEvent.change(screen.getByPlaceholderText('Enter text to generate audio...'), {
    target: { value },
  });
}

function currentAudio() {
  return document.querySelector('audio source')?.getAttribute('src');
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

describe('BookEditorPage narration text persistence', () => {
  it('generates, saves, and reopens a new page with tag-free mixed-language display text', async () => {
    openPages();
    fireEvent.click(screen.getByRole('button', { name: '+ Add Page' }));
    fireEvent.click(screen.getByRole('button', { name: 'Click to select background image' }));
    fireEvent.click(screen.getByRole('button', { name: 'Choose test image' }));
    const narration = '[excited] Saleh found a فَانُوس [أزرق].\n\n[short pause] It glowed in [A]!';
    const display = 'Saleh found a فَانُوس [أزرق].\n\nIt glowed in [A]!';
    setNarration(narration);

    await generateAudio();

    expect(JSON.parse(mocks.fetch.mock.calls[0][1].body).text).toBe(narration);
    expect(screen.getByLabelText('Text', { exact: true })).toHaveValue(display);
    expect(currentAudio()).toBe(generatedAudio);
    saveAndReopen('Add Page');
    expect(mocks.createPage).toHaveBeenCalledWith(
      { bookId: 'book-1', data: expect.objectContaining({ text: display, audio_url: generatedAudio }) },
      expect.any(Object),
    );
    expect(screen.getByLabelText('Text', { exact: true })).toHaveValue(display);
    expect(screen.getByPlaceholderText('Enter text to generate audio...')).toHaveValue(display);
    expect(currentAudio()).toBe(generatedAudio);
  });

  it('preserves separately authored display text when generating and saving different narration', async () => {
    const display = '  Saleh found his فَانُوس.\nIt was bright!  ';
    editPage(makePage({ text: display }));
    setNarration('[gentle] A different spoken version.');

    await generateAudio();
    expect(screen.getByLabelText('Text', { exact: true })).toHaveValue(display);
    saveAndReopen();

    expect(mocks.updatePage.mock.calls[0][0].data).toMatchObject({ text: display, audio_url: generatedAudio });
    expect(screen.getByLabelText('Text', { exact: true })).toHaveValue(display);
  });

  it('updates automatically filled text and audio together when regenerating, then saves and reopens both', async () => {
    const regeneratedAudio = 'https://assets.invalid/regenerated.mp3';
    mocks.getPublicUrl
      .mockReturnValueOnce({ data: { publicUrl: generatedAudio } })
      .mockReturnValueOnce({ data: { publicUrl: regeneratedAudio } });
    editPage();
    setNarration('[happy] First narration.');
    await generateAudio();
    expect(screen.getByLabelText('Text', { exact: true })).toHaveValue('First narration.');
    expect(currentAudio()).toBe(generatedAudio);

    setNarration('[gentle] Revised narration.');
    await generateAudio();

    expect(JSON.parse(mocks.fetch.mock.calls[1][1].body).text).toBe('[gentle] Revised narration.');
    expect(screen.getByLabelText('Text', { exact: true })).toHaveValue('Revised narration.');
    expect(currentAudio()).toBe(regeneratedAudio);
    saveAndReopen();
    expect(mocks.updatePage.mock.calls[0][0].data).toMatchObject({
      text: 'Revised narration.',
      audio_url: regeneratedAudio,
    });
    expect(screen.getByLabelText('Text', { exact: true })).toHaveValue('Revised narration.');
    expect(currentAudio()).toBe(regeneratedAudio);
  });

  it('preserves a manual display edit made while regenerated audio is uploading', async () => {
    const regeneratedAudio = 'https://assets.invalid/regenerated.mp3';
    mocks.getPublicUrl
      .mockReturnValueOnce({ data: { publicUrl: generatedAudio } })
      .mockReturnValueOnce({ data: { publicUrl: regeneratedAudio } });
    editPage();
    setNarration('[happy] First narration.');
    await generateAudio();

    const upload = deferred<{ data: { path: string }; error: null }>();
    mocks.upload.mockReturnValueOnce(upload.promise);
    setNarration('[gentle] Revised narration.');
    const regeneration = generateAudio();
    await waitFor(() => expect(mocks.upload).toHaveBeenCalledTimes(2));
    const display = '  My own display text.\nWith فَانُوس!  ';
    fireEvent.change(screen.getByLabelText('Text', { exact: true }), { target: { value: display } });
    await act(async () => { upload.resolve({ data: { path: 'books/regenerated.mp3' }, error: null }); });
    await regeneration;

    expect(screen.getByLabelText('Text', { exact: true })).toHaveValue(display);
    expect(currentAudio()).toBe(regeneratedAudio);
    saveAndReopen();
    expect(mocks.updatePage.mock.calls[0][0].data).toMatchObject({ text: display, audio_url: regeneratedAudio });
    expect(screen.getByLabelText('Text', { exact: true })).toHaveValue(display);
    expect(currentAudio()).toBe(regeneratedAudio);
  });

  it('keeps Save disabled through generation and upload and uses the submitted narration snapshot', async () => {
    const generation = deferred<ReturnType<typeof ttsResponse>>();
    const upload = deferred<{ data: { path: string }; error: null }>();
    mocks.fetch.mockReturnValue(generation.promise);
    mocks.upload.mockReturnValue(upload.promise);
    editPage();
    setNarration('[happy] This was submitted.');
    fireEvent.click(screen.getByRole('button', { name: /Generate Audio/ }));

    await waitFor(() => expect(mocks.fetch).toHaveBeenCalledOnce());
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeDisabled();
    expect(screen.getByLabelText('Text', { exact: true })).toHaveValue('');
    expect(currentAudio()).toBe(originalAudio);
    setNarration('[calm] This edit was not submitted.');

    await act(async () => { generation.resolve(ttsResponse()); });
    await waitFor(() => expect(mocks.upload).toHaveBeenCalledOnce());
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeDisabled();
    expect(screen.getByLabelText('Text', { exact: true })).toHaveValue('');
    expect(currentAudio()).toBe(originalAudio);

    await act(async () => { upload.resolve({ data: { path: 'books/generated.mp3' }, error: null }); });
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeEnabled();
    expect(screen.getByLabelText('Text', { exact: true })).toHaveValue('This was submitted.');
    expect(currentAudio()).toBe(generatedAudio);
    setNarration('[gentle] A later draft without regenerating.');
    saveAndReopen();
    expect(mocks.fetch).toHaveBeenCalledOnce();
    expect(mocks.updatePage.mock.calls[0][0].data).toMatchObject({
      text: 'This was submitted.',
      audio_url: generatedAudio,
    });
    expect(screen.getByLabelText('Text', { exact: true })).toHaveValue('This was submitted.');
    expect(currentAudio()).toBe(generatedAudio);
  });

  it('does not replace audio or prefill display on TTS failure, while allowing a deliberate text save', async () => {
    mocks.fetch.mockResolvedValue({ ok: false, json: async () => ({ error: 'Narration unavailable' }) });
    editPage();
    setNarration('[gentle] Keep this authored story.');
    fireEvent.click(screen.getByRole('button', { name: /Generate Audio/ }));

    await waitFor(() => expect(mocks.error).toHaveBeenCalledWith('Narration unavailable'));
    expect(mocks.upload).not.toHaveBeenCalled();
    expect(mocks.updatePage).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Text', { exact: true })).toHaveValue('');
    expect(currentAudio()).toBe(originalAudio);
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeEnabled();

    saveAndReopen();
    expect(screen.getByLabelText('Text', { exact: true })).toHaveValue('Keep this authored story.');
    expect(currentAudio()).toBe(originalAudio);
  });

  it('does not replace audio or prefill display when uploading generated audio fails', async () => {
    mocks.upload.mockResolvedValue({ data: null, error: { message: 'Storage unavailable' } });
    editPage();
    setNarration('[playful] A new narration.');
    fireEvent.click(screen.getByRole('button', { name: /Generate Audio/ }));

    await waitFor(() => expect(mocks.error).toHaveBeenCalledWith('Upload failed: Storage unavailable'));
    expect(mocks.getPublicUrl).not.toHaveBeenCalled();
    expect(mocks.success).not.toHaveBeenCalled();
    expect(mocks.updatePage).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Text', { exact: true })).toHaveValue('');
    expect(currentAudio()).toBe(originalAudio);
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeEnabled();
  });

  it('ignores a late upload after cancelling and opening a different page', async () => {
    const upload = deferred<{ data: { path: string }; error: null }>();
    const secondAudio = 'https://assets.invalid/second.mp3';
    mocks.upload.mockReturnValue(upload.promise);
    mocks.pages = [makePage(), makePage({ id: 'page-2', page_number: 2, audio_url: secondAudio })];
    openPages();
    fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
    setNarration('[happy] Page one narration.');
    fireEvent.click(screen.getByRole('button', { name: /Generate Audio/ }));
    await waitFor(() => expect(mocks.upload).toHaveBeenCalledOnce());

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[1]);
    setNarration('Page two narration.');
    await act(async () => { upload.resolve({ data: { path: 'books/generated.mp3' }, error: null }); });

    expect(screen.getByRole('heading', { name: 'Edit Page 2' })).toBeInTheDocument();
    expect(screen.getByLabelText('Text', { exact: true })).toHaveValue('');
    expect(screen.getByPlaceholderText('Enter text to generate audio...')).toHaveValue('Page two narration.');
    expect(currentAudio()).toBe(secondAudio);
    expect(mocks.success).not.toHaveBeenCalled();
    expect(mocks.error).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    expect(mocks.updatePage).toHaveBeenCalledWith(
      {
        bookId: 'book-1',
        pageId: 'page-2',
        data: expect.objectContaining({ text: 'Page two narration.', audio_url: secondAudio }),
      },
      expect.any(Object),
    );
  });

  it.each(['', ' \n '])('saves narration as plain text without generation when display text is %j', (text) => {
    editPage(makePage({ text }));
    setNarration('[WHISPERS] أهلاً يا صديقي [أزرق]!\n[long pause] Welcome [A].');

    saveAndReopen();

    expect(mocks.fetch).not.toHaveBeenCalled();
    expect(mocks.upload).not.toHaveBeenCalled();
    expect(mocks.updatePage.mock.calls[0][0].data).toMatchObject({
      text: 'أهلاً يا صديقي [أزرق]!\nWelcome [A].',
      audio_url: originalAudio,
    });
    expect(screen.getByLabelText('Text', { exact: true })).toHaveValue('أهلاً يا صديقي [أزرق]!\nWelcome [A].');
  });

  it.each([
    { narration: 'Hello[pause]world [A]', display: 'Hello world [A]' },
    { narration: 'مرحبًا[pause]صديقي [أزرق]', display: 'مرحبًا صديقي [أزرق]' },
  ])('keeps words separate when saving a voice tag without surrounding spaces: $narration', ({ narration, display }) => {
    editPage();
    setNarration(narration);

    saveAndReopen();

    expect(mocks.fetch).not.toHaveBeenCalled();
    expect(mocks.updatePage.mock.calls[0][0].data).toMatchObject({ text: display, audio_url: originalAudio });
    expect(screen.getByLabelText('Text', { exact: true })).toHaveValue(display);
  });
});
