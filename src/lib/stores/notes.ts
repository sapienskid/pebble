import { writable } from 'svelte/store';
// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
import { db, type Note } from '../db';

export const notesStore = writable<Note[]>([]);

// Initialize store from IndexedDB
async function initNotesStore() {
  try {
      if (isBrowser) {
      const notes = await (db as any).notes.toArray();
      notesStore.set(notes);
    }
  } catch (error) {
    console.error('Failed to load notes from IndexedDB:', error);
  }
}

// Subscribe to store changes and save to IndexedDB
notesStore.subscribe(async (notes) => {
  if (!isBrowser) return;
  if (notes.length > 0) {
    try {
      await (db as any).notes.clear();
      await (db as any).notes.bulkAdd(notes);
    } catch (error) {
      console.error('Failed to save notes to IndexedDB:', error);
    }
  }
});

// Initialize on module load
initNotesStore();