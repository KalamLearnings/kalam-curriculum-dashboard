import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AudioAsset } from '@/lib/types/audio';
import { Modal } from '@/components/ui/Modal';
import { AudioPicker } from './AudioPicker';

const audio = {
  id: 'audio-1', name: 'narration', displayName: 'Narration',
  url: 'https://example.test/narration.mp3', storagePath: 'narration.mp3',
  category: 'instructions', tags: [], mimeType: 'audio/mpeg',
  createdAt: '', updatedAt: '',
} satisfies AudioAsset;

vi.mock('@/lib/hooks/useAudio', () => ({
  useAudio: () => ({
    audioAssets: [], loading: false, error: null, selectedCategory: undefined,
    searchQuery: '', setCategory: vi.fn(), setSearchQuery: vi.fn(),
  }),
}));
vi.mock('./AudioGrid', () => ({
  AudioGrid: ({ onSelectAudio }: { onSelectAudio: (asset: AudioAsset) => void }) =>
    <button onClick={() => onSelectAudio(audio)}>Choose narration</button>,
}));
vi.mock('./AudioCategoryFilter', () => ({ AudioCategoryFilter: () => null }));
vi.mock('./AudioSearchBar', () => ({ AudioSearchBar: () => null }));

afterEach(cleanup);

describe('AudioPicker nested dismissal', () => {
  it('notifies the editor so Escape keeps its unsaved text', () => {
    function Editor() {
      const [open, setOpen] = useState(true);
      const [audioOpen, setAudioOpen] = useState(false);
      return <Modal isOpen={open} onClose={() => setOpen(false)} title="Page editor" closeOnEscape={!audioOpen}>
        <input aria-label="Page text" defaultValue="Unsaved story text" />
        <AudioPicker onChange={vi.fn()} onOpenChange={setAudioOpen} />
      </Modal>;
    }

    render(<Editor />);
    fireEvent.click(screen.getByText('Select audio...'));
    expect(screen.getByText('Select Audio')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByText('Select Audio')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Page text')).toHaveValue('Unsaved story text');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByLabelText('Page text')).not.toBeInTheDocument();
  });

  it('reports both opening and closing when an audio asset is selected', () => {
    const change = vi.fn();
    const openChange = vi.fn();
    render(<AudioPicker onChange={change} onOpenChange={openChange} />);
    fireEvent.click(screen.getByText('Select audio...'));
    fireEvent.click(screen.getByRole('button', { name: 'Choose narration' }));
    expect(change).toHaveBeenCalledWith(audio.id, audio);
    expect(openChange.mock.calls).toEqual([[true], [false]]);
    expect(screen.queryByText('Select Audio')).not.toBeInTheDocument();
  });
});
