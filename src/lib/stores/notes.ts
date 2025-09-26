import { writable } from 'svelte/store';
import { db, type Note } from '../db';

export const notesStore = writable<Note[]>([]);

// Initialize store from IndexedDB
async function initNotesStore() {
  try {
    const notes = await db.notes.toArray();
    notesStore.set(notes);
  } catch (error) {
    console.error('Failed to load notes from IndexedDB:', error);
  }
}

// Subscribe to store changes and save to IndexedDB
notesStore.subscribe(async (notes) => {
  if (notes.length > 0) {
    try {
      await db.notes.clear();
      await db.notes.bulkAdd(notes);
    } catch (error) {
      console.error('Failed to save notes to IndexedDB:', error);
    }
  }
});

// Initialize on module load
initNotesStore();