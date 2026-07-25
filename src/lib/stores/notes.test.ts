import { describe, it, expect, vi, beforeEach } from 'vitest';
import { get } from 'svelte/store';

const mockNotes = new Map<string, any>();

vi.mock('../db', () => ({
  db: {
    notes: {
      toArray: vi.fn(async () => Array.from(mockNotes.values())),
      add: vi.fn(async (note: any) => { mockNotes.set(note.id, note); return note.id; }),
      delete: vi.fn(async (id: string) => { mockNotes.delete(id); }),
      update: vi.fn(async (id: string, changes: any) => {
        const existing = mockNotes.get(id);
        if (existing) mockNotes.set(id, { ...existing, ...changes });
      }),
      get: vi.fn(async (id: string) => mockNotes.get(id) ?? null),
      clear: vi.fn(async () => { mockNotes.clear(); }),
      bulkAdd: vi.fn(async (items: any[]) => items.forEach((item: any) => mockNotes.set(item.id, item))),
    },
  },
}));

vi.mock('./settings', () => ({
  settingsStore: {
    subscribe: vi.fn(() => vi.fn()),
    get: vi.fn(() => ({ retentionDays: null })),
  },
}));

import { notesStore, addNote, deleteNote, togglePin } from './notes';

beforeEach(async () => {
  mockNotes.clear();
  notesStore.set([]);
});

describe('notes store', () => {
  it('adds a note', async () => {
    const note = await addNote('Hello world', ['test']);
    expect(note).not.toBeNull();
    expect(note!.content).toBe('Hello world');
    expect(note!.tags).toEqual(['test']);
    expect(note!.id).toBeTruthy();
    expect(note!.synced).toBe(false);
    expect(note!.pinned).toBe(false);
  });

  it('preserves empty tags when none provided', async () => {
    const note = await addNote('Just text');
    expect(note!.tags).toEqual([]);
  });

  it('deletes a note', async () => {
    const note = await addNote('To delete', ['test']);
    const deleted = await deleteNote(note!.id);
    expect(deleted).toBe(true);
    const notes = get(notesStore);
    expect(notes.find((n) => n.id === note!.id)).toBeUndefined();
  });

  it('toggles pin on a note', async () => {
    const note = await addNote('Pin me', ['test']);
    expect(note!.pinned).toBe(false);
    await togglePin(note!.id);
    const notes = get(notesStore);
    const updated = notes.find((n) => n.id === note!.id);
    expect(updated?.pinned).toBe(true);
    await togglePin(note!.id);
    const notes2 = get(notesStore);
    expect(notes2.find((n) => n.id === note!.id)?.pinned).toBe(false);
  });
});
