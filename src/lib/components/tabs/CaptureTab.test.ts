import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import CaptureTab from './CaptureTab.svelte';
import { notesStore } from '$lib/stores/notes';

vi.mock('@iconify/svelte', () => ({
  default: () => null,
}));

function makeNote(overrides: Partial<any> = {}) {
  return {
    id: crypto.randomUUID(),
    content: 'Test note',
    tags: [],
    timestamp: new Date().toISOString(),
    synced: false,
    syncedAt: null,
    pinned: false,
    ...overrides,
  };
}

beforeEach(() => {
  notesStore.set([]);
});

describe('CaptureTab', () => {
  it('shows empty state when no notes', () => {
    render(CaptureTab);
    expect(screen.getByText('No notes yet')).toBeInTheDocument();
  });

  it('renders notes from the store', () => {
    notesStore.set([makeNote({ content: 'Hello world' })]);
    render(CaptureTab);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders multiple notes', () => {
    notesStore.set([
      makeNote({ content: 'First note' }),
      makeNote({ content: 'Second note' }),
    ]);
    render(CaptureTab);
    expect(screen.getByText('First note')).toBeInTheDocument();
    expect(screen.getByText('Second note')).toBeInTheDocument();
  });

  it('shows pinned icon for pinned notes', () => {
    notesStore.set([makeNote({ content: 'Pinned note', pinned: true })]);
    render(CaptureTab);
    expect(screen.getByLabelText('Unpin')).toBeInTheDocument();
  });

  it('shows pin button for unpinned notes', () => {
    notesStore.set([makeNote({ content: 'Unpinned note', pinned: false })]);
    render(CaptureTab);
    expect(screen.getByLabelText('Pin')).toBeInTheDocument();
  });

  it('shows tags when present', () => {
    notesStore.set([makeNote({ content: 'Tagged note', tags: ['idea'] })]);
    render(CaptureTab);
    expect(screen.getByText('idea')).toBeInTheDocument();
  });
});
