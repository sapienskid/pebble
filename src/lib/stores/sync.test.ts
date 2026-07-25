import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { syncStore, clearSyncError, setSyncError } from './sync';
import { get } from 'svelte/store';

beforeEach(() => {
  vi.useFakeTimers();
  syncStore.set({ syncing: false, lastSyncAt: null, error: null, successCount: 0, failCount: 0 });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('syncStore', () => {
  it('has default state', () => {
    const state = get(syncStore);
    expect(state.syncing).toBe(false);
    expect(state.error).toBeNull();
    expect(state.lastSyncAt).toBeNull();
    expect(state.successCount).toBe(0);
    expect(state.failCount).toBe(0);
  });

  it('sets and clears error', () => {
    setSyncError('Something went wrong');
    expect(get(syncStore).error).toBe('Something went wrong');
    clearSyncError();
    expect(get(syncStore).error).toBeNull();
  });

  it('auto-clears error after 8 seconds', () => {
    setSyncError('Temporary error');
    expect(get(syncStore).error).toBe('Temporary error');
    vi.advanceTimersByTime(8000);
    expect(get(syncStore).error).toBeNull();
  });

  it('updates syncing state', () => {
    syncStore.update((s) => ({ ...s, syncing: true }));
    expect(get(syncStore).syncing).toBe(true);
    syncStore.update((s) => ({ ...s, syncing: false }));
    expect(get(syncStore).syncing).toBe(false);
  });

  it('tracks success and failure counts', () => {
    syncStore.update((s) => ({ ...s, successCount: 3, failCount: 1 }));
    const state = get(syncStore);
    expect(state.successCount).toBe(3);
    expect(state.failCount).toBe(1);
  });
});
