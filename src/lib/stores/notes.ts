import { writable, get } from 'svelte/store';
// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
import { db, type Note } from '../db';
import { settingsStore } from './settings';

export const notesStore = writable<Note[]>([]);

function isExpired(timestampISO: string, retentionDays: number | null): boolean {
  if (retentionDays === null || retentionDays === undefined) return false;
  const created = new Date(timestampISO).getTime();
  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  return created < cutoff;
}

async function purgeByRetention(retentionDays: number | null) {
  if (!isBrowser) return;
  try {
    const allNotes: Note[] = await (db as any).notes.toArray();
    // Safety: never purge unsynced notes
    const kept = allNotes.filter(n => n.synced === false || !isExpired(n.timestamp, retentionDays));
    // Sort by timestamp descending (newest first)
    kept.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    if (kept.length !== allNotes.length) {
      // Persist filtered notes and update store
      await (db as any).notes.clear();
      if (kept.length > 0) {
        await (db as any).notes.bulkAdd(kept);
      }
      notesStore.set(kept);
    } else {
      // Ensure store has current value (sorted)
      notesStore.set(kept);
    }
  } catch (error) {
    console.error('Failed to purge notes by retention:', error);
  }
}

// Initialize store from IndexedDB respecting retention
async function initNotesStore() {
  try {
    if (isBrowser) {
      const retention = get(settingsStore).retentionDays ?? null;
      await purgeByRetention(retention);
    }
  } catch (error) {
    console.error('Failed to load notes from IndexedDB:', error);
  }
}


export async function addNote(content: string, tags: string[] = []) {
	if (!isBrowser) return;
	const note: Note = {
		id: crypto.randomUUID(),
		content,
		tags,
		timestamp: new Date().toISOString(),
		synced: false
	};
	try {
		await (db as any).notes.add(note);
		notesStore.update((notes) => [note, ...notes]);
		if (navigator.onLine) {
			import('$lib/services/sync').then(({ syncUnsyncedItems }) => {
				syncUnsyncedItems().catch((error) => {
					console.error('Failed to sync note:', error);
				});
			});
		}
	} catch (error) {
		console.error('Failed to add note:', error);
	}
}


// React to retention settings changes
settingsStore.subscribe((s) => {

	if (!isBrowser) return;
	// Purge in background; no await
	purgeByRetention(s.retentionDays ?? null);
});

// Initialize on module load
initNotesStore();
