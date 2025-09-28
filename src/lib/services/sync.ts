import { get } from 'svelte/store';
import { db, type Settings } from '../db';
import { settingsStore } from '../stores/settings';
import { syncStore } from '../stores/sync';

export async function syncUnsyncedItems() {
  const settings = get(settingsStore);

  if (!settings.syncEnabled) {
    return;
  }

  // Cast db to PebbleDB
  const pebbleDB = db as any;

  // Get unsynced notes - filter to handle undefined/null synced values
  const allNotes = await pebbleDB.notes.toArray();
  const unsyncedNotes = allNotes.filter((note: any) => note.synced === false || note.synced === undefined || note.synced === null);

  const items = [
    ...unsyncedNotes.map((note: any) => ({ type: 'note', data: note, markdown: note.content }))
  ];

  syncStore.update((s) => ({ ...s, syncing: true }));
  const ttlDays = (settings as Settings).syncRetentionDays ?? 7;
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
          // Mark as synced
          await pebbleDB.notes.update(item.data.id, { synced: true });
        } else {
          console.error(`Failed to sync ${item.type}:`, response.statusText);
        }
      } catch (error) {
        console.error(`Error syncing ${item.type}:`, error);
      }
    }
    // Mark last sync time even if there were zero items
    syncStore.update((s) => ({ ...s, lastSyncAt: new Date().toISOString() }));
  } finally {
    syncStore.update((s) => ({ ...s, syncing: false }));
  }
}

