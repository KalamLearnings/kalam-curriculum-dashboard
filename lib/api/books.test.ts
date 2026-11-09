import { afterEach, describe, expect, it, vi } from 'vitest';
import { createPage, listPages, updatePage } from './books';

vi.mock('@/lib/stores/environmentStore', () => ({
  getPersistedEnvironment: () => 'test',
  getConfigForEnvironment: () => ({ url: 'https://test.invalid', anonKey: 'test' }),
}));
vi.mock('@/lib/supabase/client', () => ({
  getClientForEnv: () => ({ auth: { getSession: async () => ({ data: { session: {
    access_token: 'test-token', expires_at: Math.floor(Date.now() / 1000) + 3600,
  } } }) } }),
}));

const page = { id: 'page', book_id: 'book', page_number: 1, layout: 'single',
  background_image_url: 'https://test.invalid/image.png', audio_url: null,
  word_timings: [], interactive_elements: [], layers: [], created_at: '' };
function respond(data: unknown) {
  const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data }) });
  vi.stubGlobal('fetch', fetch);
  return fetch;
}
afterEach(() => vi.unstubAllGlobals());

describe('book page authoring text', () => {
  it('loads legacy saved text for reopening without exposing the legacy name to the editor', async () => {
    respond([{ ...page, text_ar: 'Maya found a كِتَاب.' }]);
    const [loaded] = await listPages('book');
    expect(loaded.text).toBe('Maya found a كِتَاب.');
    expect(loaded).not.toHaveProperty('text_ar');
  });
  it('prefers canonical text including an intentional empty string', async () => {
    respond([{ ...page, text: '', text_ar: 'old' }, { ...page, text: 'new', text_ar: 'old' }]);
    expect((await listPages('book')).map(p => p.text)).toEqual(['', 'new']);
  });
  it('sends canonical text on create and normalizes the older response', async () => {
    const fetch = respond({ ...page, text_ar: 'A قِطَّة.' });
    const saved = await createPage('book', { page_number: 1, background_image_url: page.background_image_url, text: 'A قِطَّة.' });
    expect(saved.text).toBe('A قِطَّة.');
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ page_number: 1, background_image_url: page.background_image_url, text: 'A قِطَّة.' });
  });
  it('saves edits and reloads the exact mixed-language text', async () => {
    const text = 'Here is the كِتَاب!';
    const fetch = respond({ ...page, text, text_ar: text });
    expect((await updatePage('book', 'page', { text })).text).toBe(text);
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ text });
    respond([{ ...page, text, text_ar: text }]);
    expect((await listPages('book'))[0].text).toBe(text);
  });
});
