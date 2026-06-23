import { writable } from 'svelte/store';

export type SyncState = {
  syncing: boolean;
  lastSyncAt?: string | null;
  error: string | null;
  successCount: number;
  failCount: number;
};

export const syncStore = writable<SyncState>({
  syncing: false,
  lastSyncAt: null,
  error: null,
  successCount: 0,
  failCount: 0,
});

let errorTimer: ReturnType<typeof setTimeout> | null = null;

export function clearSyncError() {
  syncStore.update((s) => ({ ...s, error: null }));
}

export function setSyncError(message: string) {
  syncStore.update((s) => ({ ...s, error: message }));
  if (errorTimer) clearTimeout(errorTimer);
  errorTimer = setTimeout(() => {
    syncStore.update((s) => ({ ...s, error: null }));
  }, 8000);
}
