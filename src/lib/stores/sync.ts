import { writable } from 'svelte/store';

export type SyncState = {
  syncing: boolean;
  lastSyncAt?: string | null;
};

export const syncStore = writable<SyncState>({ syncing: false, lastSyncAt: null });
