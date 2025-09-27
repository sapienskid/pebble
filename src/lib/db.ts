import Dexie, { type Table } from 'dexie';

// Theme interface
export interface ThemeRecord {
  id: string; // 'theme'
  value: 'light' | 'dark' | 'device';
}
export interface Settings {
  id: string; // probably just one record with id 'settings'
  syncEnabled: boolean;
  syncToken?: string;
  autoSyncOnStart: boolean;
}

// Note interface
export interface Note {
  id: string;
  content: string; // max 500 characters
  timestamp: string;
  tags: string[];
  synced: boolean;
}




class PebbleDB extends Dexie {
  notes!: Table<Note>;
  settings!: Table<Settings>;
  theme!: Table<ThemeRecord>;

  constructor() {
    super('PebbleDB');
    this.version(2).stores({
      notes: 'id, timestamp, synced, *tags',
      settings: 'id',
      theme: 'id'
    }).upgrade(trans => {
      // Ensure all existing notes have synced field set to false
      return trans.table('notes').toCollection().modify(note => {
        if (note.synced === undefined || note.synced === null) {
          note.synced = false;
        }
      });
    });
  }
}

// When running outside the browser (VS Code preview, SSR, tests, or restricted contexts),
// IndexedDB may not be available. Provide a lightweight in-memory mock so imports don't throw
// and store modules can still be loaded. In real browsers, use Dexie.
class MockTable<T extends { id: string }> {
  private map = new Map<string, T>();

  async toArray() {
    return Array.from(this.map.values());
  }

  async clear() {
    this.map.clear();
  }

  async bulkAdd(items: T[]) {
    for (const item of items) {
      this.map.set(item.id, item);
    }
  }

  async get(id: string) {
    return this.map.get(id);
  }

  async put(item: T) {
    this.map.set(item.id, item);
    return item.id;
  }
}

class MockDB {
  notes = new MockTable<Note>();
  settings = new MockTable<Settings>();
  theme = new MockTable<ThemeRecord>();
}

// Check if we're in a browser environment (not service worker)
const isBrowser = typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';

// In service workers, IndexedDB is available via self
const isServiceWorker = typeof self !== 'undefined' && typeof self.indexedDB !== 'undefined';

const hasIndexedDB = isBrowser || isServiceWorker;

export const db: PebbleDB | MockDB = hasIndexedDB ? new PebbleDB() : new MockDB();