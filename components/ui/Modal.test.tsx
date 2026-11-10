import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Modal } from './Modal';

afterEach(cleanup);

describe('Modal Escape handling', () => {
  it('keeps the default Escape dismissal for existing callers', () => {
    const close = vi.fn();
    render(<Modal isOpen onClose={close} title="Page editor">Page content</Modal>);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(close).toHaveBeenCalledOnce();
  });

  it('preserves the parent draft while Escape dismisses a nested image library', () => {
    function Editor() {
      const [open, setOpen] = useState(true);
      const [imageOpen, setImageOpen] = useState(false);
      return <>
        <Modal isOpen={open} onClose={() => setOpen(false)} title="Page editor" closeOnEscape={!imageOpen}>
          <input aria-label="Page text" defaultValue="Saved narration" />
          <button onClick={() => setImageOpen(true)}>Choose image</button>
        </Modal>
        <Modal isOpen={imageOpen} onClose={() => setImageOpen(false)} title="Image library">Images</Modal>
      </>;
    }

    render(<Editor />);
    fireEvent.change(screen.getByLabelText('Page text'), { target: { value: 'Unsaved story text' } });
    fireEvent.click(screen.getByRole('button', { name: 'Choose image' }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByText('Image library')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Page text')).toHaveValue('Unsaved story text');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByLabelText('Page text')).not.toBeInTheDocument();
  });
});
