import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import Toast from './Toast.svelte';
import { addToast, removeToast, toasts } from '$lib/stores/toast';

beforeEach(() => {
  vi.useFakeTimers();
  toasts.set([]);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('Toast component', () => {
  it('renders nothing when no toasts', () => {
    const { container } = render(Toast);
    expect(container.textContent?.trim()).toBe('');
  });

  it('renders a success toast', () => {
    addToast({ type: 'success', message: 'Note saved.' });
    render(Toast);
    expect(screen.getByText('Note saved.')).toBeInTheDocument();
  });

  it('renders an error toast', () => {
    addToast({ type: 'error', message: 'Sync failed.' });
    render(Toast);
    expect(screen.getByText('Sync failed.')).toBeInTheDocument();
  });

  it('renders an info toast', () => {
    addToast({ type: 'info', message: 'Something happened.' });
    render(Toast);
    expect(screen.getByText('Something happened.')).toBeInTheDocument();
  });

  it('renders action button when provided', () => {
    addToast({ type: 'success', message: 'Note created.', action: { label: 'Undo', onClick: vi.fn() } });
    render(Toast);
    expect(screen.getByText('Undo')).toBeInTheDocument();
  });

  it('dismisses toast when X is clicked', async () => {
    addToast({ type: 'info', message: 'Dismiss me' });
    render(Toast);
    expect(screen.getByText('Dismiss me')).toBeInTheDocument();
    const dismissBtn = screen.getByLabelText('Dismiss');
    dismissBtn.click();
    await waitFor(() => {
      expect(screen.queryByText('Dismiss me')).not.toBeInTheDocument();
    });
  });

  it('renders multiple toasts', () => {
    addToast({ type: 'success', message: 'First' });
    addToast({ type: 'error', message: 'Second' });
    render(Toast);
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });
});
