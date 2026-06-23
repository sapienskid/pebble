import { get } from 'svelte/store';
import { db, type Settings } from '../db';
import { settingsStore } from '../stores/settings';
import { syncStore, setSyncError, clearSyncError } from '../stores/sync';

export async function syncUnsyncedItems() {
  const settings = get(settingsStore);

  if (!settings.syncEnabled) {
    setSyncError('Sync is disabled. Enable it in Settings.');
    return;
  }

  if (!settings.syncToken) {
    setSyncError('API key not set. Add it in Settings.');
    return;
  }

  const pebbleDB = db as any;

  const allNotes = await pebbleDB.notes.toArray();
  const unsyncedNotes = allNotes.filter((note: any) => note.synced === false || note.synced === undefined || note.synced === null);

  const items = [
    ...unsyncedNotes.map((note: any) => ({ type: 'note', data: note, markdown: note.content }))
  ];

  if (items.length === 0) {
    setSyncError('No unsynced notes to sync.');
    return;
  }

  clearSyncError();
  syncStore.update((s) => ({ ...s, syncing: true, successCount: 0, failCount: 0, error: null }));
  const ttlDays = (settings as Settings).syncRetentionDays ?? 7;

  let successCount = 0;
  let failCount = 0;
  let authFailed = false;

  try {
    for (const item of items) {
      try {
        const response = await fetch('/api/sync/push', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(settings.syncToken ? { 'Authorization': `Bearer ${settings.syncToken}` } : {})
          },
          body: JSON.stringify({
            type: item.type,
            markdown: item.markdown,
            id: item.data.id,
            createdAt: item.data.timestamp,
            tags: Array.isArray(item.data.tags) ? item.data.tags : [],
            ttlDays
          })
        });

        if (response.ok) {
          await pebbleDB.notes.update(item.data.id, { synced: true });
          successCount++;
        } else if (response.status === 401 || response.status === 403) {
          authFailed = true;
          failCount++;
          break;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }
    }

    if (successCount > 0) {
      syncStore.update((s) => ({ ...s, lastSyncAt: new Date().toISOString(), successCount, failCount }));
    }

    if (authFailed) {
      setSyncError('Invalid API key. Check your key in Settings.');
    } else if (failCount > 0 && successCount === 0) {
      setSyncError(`Sync failed for ${failCount} note${failCount > 1 ? 's' : ''}. Check your connection and try again.`);
    } else if (failCount > 0) {
      setSyncError(`${successCount} synced, ${failCount} failed. Check your connection.`);
    }
  } finally {
    syncStore.update((s) => ({ ...s, syncing: false }));
  }
}

