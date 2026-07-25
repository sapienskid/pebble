import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toasts, addToast, removeToast } from './toast';
import { get } from 'svelte/store';

beforeEach(() => {
  vi.useFakeTimers();
  toasts.set([]);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('toast store', () => {
  it('adds a toast to the store', () => {
    addToast({ type: 'success', message: 'Note created.' });
    const list = get(toasts);
    expect(list).toHaveLength(1);
    expect(list[0].type).toBe('success');
    expect(list[0].message).toBe('Note created.');
  });

  it('removes a toast by id', () => {
    addToast({ type: 'info', message: 'Hello' });
    const first = get(toasts)[0];
    removeToast(first.id);
    expect(get(toasts)).toHaveLength(0);
  });

  it('auto-removes toast after default duration', () => {
    addToast({ type: 'info', message: 'Auto dismiss' });
    expect(get(toasts)).toHaveLength(1);
    vi.advanceTimersByTime(4000);
    expect(get(toasts)).toHaveLength(0);
  });

  it('auto-removes toast after custom duration', () => {
    addToast({ type: 'error', message: 'Error', duration: 2000 });
    expect(get(toasts)).toHaveLength(1);
    vi.advanceTimersByTime(1999);
    expect(get(toasts)).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(get(toasts)).toHaveLength(0);
  });

  it('supports multiple toasts', () => {
    addToast({ type: 'success', message: 'First' });
    addToast({ type: 'error', message: 'Second' });
    addToast({ type: 'info', message: 'Third' });
    const list = get(toasts);
    expect(list).toHaveLength(3);
    expect(list[0].message).toBe('First');
    expect(list[1].message).toBe('Second');
    expect(list[2].message).toBe('Third');
  });

  it('includes action in toast', () => {
    const onClick = vi.fn();
    addToast({ type: 'success', message: 'Note created.', action: { label: 'Undo', onClick } });
    const toast = get(toasts)[0];
    expect(toast.action?.label).toBe('Undo');
    toast.action?.onClick();
    expect(onClick).toHaveBeenCalledOnce();
  });
});
