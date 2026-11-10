import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPage, listPages, updatePage, type BookPage } from '@/lib/api/books';
import { useBookPages, useCreatePage, useUpdatePage } from './useBooks';

vi.mock('@/lib/api/books', () => ({
  createPage: vi.fn(),
  updatePage: vi.fn(),
  listPages: vi.fn(),
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const original: BookPage = {
  id: 'page-1', book_id: 'book', page_number: 1, layout: 'single',
  background_image_url: 'https://example.test/page.png', text: 'Original text',
  audio_url: null, word_timings: [], interactive_elements: [], layers: [], created_at: '',
};
const saved = { ...original, text: 'Here is the كِتَاب.' };
const queryKey = ['book-pages', 'book'];

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((complete) => { resolve = complete; });
  return { promise, resolve };
}

function setup(pages: BookPage[] = [original]) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  client.setQueryData(queryKey, pages);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, wrapper };
}

beforeEach(() => vi.resetAllMocks());

describe('saved page cache', () => {
  it('shows the saved wording immediately when reopening before a slow refresh finishes', async () => {
    const refresh = deferred<BookPage[]>();
    vi.mocked(listPages).mockReturnValue(refresh.promise);
    vi.mocked(updatePage).mockResolvedValue(saved);
    const { client, wrapper } = setup();
    const { result, unmount } = renderHook(() => ({
      pages: useBookPages('book'), update: useUpdatePage(),
    }), { wrapper });

    await act(async () => {
      await result.current.update.mutateAsync({ bookId: 'book', pageId: original.id, data: { text: saved.text } });
    });
    await waitFor(() => expect(result.current.pages.data?.[0].text).toBe(saved.text));
    expect(client.getQueryData<BookPage[]>(queryKey)?.[0].text).toBe(saved.text);
    expect(listPages).toHaveBeenCalledTimes(1);
    await act(async () => refresh.resolve([saved]));
    unmount();
    client.clear();
  });

  it('includes a newly created page before refreshing, preserving the other pages', async () => {
    const refresh = deferred<BookPage[]>();
    const added = { ...saved, id: 'page-2', page_number: 2 };
    vi.mocked(listPages).mockReturnValue(refresh.promise);
    vi.mocked(createPage).mockResolvedValue(added);
    const { client, wrapper } = setup();
    const { result, unmount } = renderHook(() => ({
      pages: useBookPages('book'), create: useCreatePage(),
    }), { wrapper });

    await act(async () => {
      await result.current.create.mutateAsync({ bookId: 'book', data: {
        text: added.text, page_number: 2, background_image_url: added.background_image_url,
      } });
    });
    await waitFor(() => expect(result.current.pages.data).toEqual([original, added]));
    await act(async () => refresh.resolve([original, added]));
    unmount();
    client.clear();
  });

  it('prevents a read started before the save from restoring old text after success', async () => {
    const staleRead = deferred<BookPage[]>();
    vi.mocked(updatePage).mockResolvedValue(saved);
    const { client, wrapper } = setup();
    const olderRequest = client.fetchQuery({ queryKey, queryFn: () => staleRead.promise }).catch(() => undefined);
    const { result, unmount } = renderHook(() => useUpdatePage(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ bookId: 'book', pageId: original.id, data: { text: saved.text } });
      staleRead.resolve([original]);
      await olderRequest;
    });
    expect(client.getQueryData<BookPage[]>(queryKey)?.[0].text).toBe(saved.text);
    unmount();
    client.clear();
  });

  it('keeps existing saved text when a write fails', async () => {
    vi.mocked(updatePage).mockRejectedValue(new Error('Save failed'));
    const { client, wrapper } = setup();
    const { result, unmount } = renderHook(() => useUpdatePage(), { wrapper });

    await act(async () => {
      await expect(result.current.mutateAsync({
        bookId: 'book', pageId: original.id, data: { text: saved.text },
      })).rejects.toThrow('Save failed');
    });
    expect(client.getQueryData(queryKey)).toEqual([original]);
    unmount();
    client.clear();
  });
});
