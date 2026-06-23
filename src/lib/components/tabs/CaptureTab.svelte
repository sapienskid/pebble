<script lang="ts">
  import { onMount } from 'svelte';
  import { notesStore, togglePin, snoozeNote, unsnoozeNote, deleteNote } from '$lib/stores/notes';
  import { Button } from "$lib/components/ui/button";
  import NoteDialog from '$lib/components/dialogs/NoteDialog.svelte';
  import SnoozePicker from '$lib/components/dialogs/SnoozePicker.svelte';
  import { Lightbulb, Pin, PinOff, Bell, BellOff, Search, X } from '@lucide/svelte';
  import Icon from '@iconify/svelte';
  import { getTagIcon, getRelativeTime } from '$lib/utils';
  import { noteDialogOpen } from '$lib/stores/ui';
  import type { Note } from '$lib/db';

  let notes: Note[] = $state([]);
  let dialogOpen = $state(false);
  let searchQuery = $state('');
  let showPinnedOnly = $state(false);
  let snoozePickerNoteId: string | null = $state(null);

  $effect(() => {
    dialogOpen = $noteDialogOpen;
  });

  $effect(() => {
    if (dialogOpen !== $noteDialogOpen) noteDialogOpen.set(dialogOpen);
  });

  onMount(() => {
    const unsubscribe = notesStore.subscribe((value: Note[]) => {
      notes = value;
    });
    return () => unsubscribe();
  });

  // Fuzzy: check if all query chars appear in order (allowing gaps)
  function fuzzyMatch(query: string, target: string): boolean {
    let qi = 0;
    for (let ti = 0; ti < target.length && qi < query.length; ti++) {
      if (target[ti] === query[qi]) qi++;
    }
    return qi === query.length;
  }

  // Match if query is a substring OR fuzzy character-order match
  function matchesQuery(query: string, target: string): boolean {
    if (target.includes(query)) return true;
    return fuzzyMatch(query, target);
  }

  const filteredNotes = $derived.by(() => {
    let result = notes;
    if (showPinnedOnly) {
      result = result.filter(n => n.pinned);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(n =>
        matchesQuery(q, n.content.toLowerCase()) ||
        n.tags.some(t => matchesQuery(q, t.toLowerCase()))
      );
    }
    // Sort: pinned first, non-snoozed before snoozed, then by timestamp descending
    const sorted = [...result].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      const aHasSnooze = a.snoozedUntil ? 1 : 0;
      const bHasSnooze = b.snoozedUntil ? 1 : 0;
      if (aHasSnooze !== bHasSnooze) return aHasSnooze - bHasSnooze;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
    return sorted;
  });

  function handleRemind(noteId: string) {
    snoozePickerNoteId = noteId;
  }

  async function onRemindSelect(until: string) {
    if (snoozePickerNoteId) {
      await snoozeNote(snoozePickerNoteId, until);
    }
    snoozePickerNoteId = null;
  }

  function clearSearch() {
    searchQuery = '';
  }

  const isSnoozeExpired = (note: Note) => {
    if (!note.snoozedUntil) return false;
    return new Date(note.snoozedUntil) < new Date();
  };

  const formatSnooze = (iso: string): string => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = d.getTime() - now.getTime();
    const diffHrs = Math.round(diffMs / (1000 * 60 * 60));
    if (diffHrs < 0) return 'Overdue';
    if (diffHrs < 24) return `${diffHrs}h left`;
    const days = Math.round(diffHrs / 24);
    return `${days}d left`;
  };
</script>

<div class="flex flex-col relative">
  <main class="flex-1 p-4 space-y-4">
    <!-- Search & Filter -->
    <div class="flex gap-2">
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search notes..."
          class="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          bind:value={searchQuery}
        />
        {#if searchQuery}
          <button
            class="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted"
            onclick={clearSearch}
            aria-label="Clear search"
          >
            <X class="w-3 h-3 text-muted-foreground" />
          </button>
        {/if}
      </div>
      <Button
        variant={showPinnedOnly ? 'default' : 'outline'}
        size="icon"
        aria-label="Show pinned only"
        onclick={() => showPinnedOnly = !showPinnedOnly}
        class="shrink-0"
      >
        <Pin class="w-4 h-4" />
      </Button>
    </div>

    <!-- Notes list -->
    {#if filteredNotes.length === 0}
      <div class="flex flex-col items-center justify-center h-full text-center p-8">
        <Lightbulb class="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h3 class="text-lg font-semibold text-foreground mb-2">
          {searchQuery ? 'No notes match your search' : 'No notes yet'}
        </h3>
        <p class="text-sm text-muted-foreground mb-6">
          {searchQuery ? 'Try a different search term.' : 'Capture your first atomic note to get started.'}
        </p>
      </div>
    {:else}
      {#each filteredNotes as note (note.id)}
        {@const expired = isSnoozeExpired(note)}
        <div
          class="group flex items-start p-4 bg-card rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/20 relative {expired ? 'ring-2 ring-amber-500/50' : ''} {note.pinned ? 'border-primary/30' : ''}"
          role="button"
          tabindex="0"
          ondblclick={() => togglePin(note.id)}
        >
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              {#if note.pinned}
                <Pin class="w-3 h-3 text-primary shrink-0" />
              {/if}
              {#if note.snoozedUntil}
                <Bell class="w-3 h-3 shrink-0 {expired ? 'text-amber-500' : 'text-muted-foreground'}" />
                <span class="text-xs {expired ? 'text-amber-500 font-medium' : 'text-muted-foreground'}">
                  {formatSnooze(note.snoozedUntil)}
                </span>
              {/if}
            </div>
            <p class="text-base text-foreground leading-relaxed mb-2 line-clamp-3">{note.content}</p>
            {#if note.tags.length > 0}
              <div class="flex flex-wrap gap-1 mb-2">
                {#each note.tags as tag}
                  <button
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    onclick={() => searchQuery = tag}
                    aria-label="Search tag: {tag}"
                  >
                    <Icon icon={getTagIcon(tag)} class="w-3 h-3 mr-1" />
                    {tag}
                  </button>
                {/each}
              </div>
            {/if}
            <p class="text-xs text-muted-foreground/70 font-medium">{getRelativeTime(note.timestamp)}</p>
          </div>

          <!-- Action buttons — always visible -->
          <div class="flex items-center gap-0.5 ml-2">
            <Button
              variant="ghost"
              size="icon"
              class="h-8 w-8"
              aria-label={note.pinned ? 'Unpin' : 'Pin'}
              onclick={() => togglePin(note.id)}
            >
              {#if note.pinned}
                <PinOff class="w-4 h-4 text-primary" />
              {:else}
                <Pin class="w-4 h-4" />
              {/if}
            </Button>
            <div class="relative">
              <Button
                variant="ghost"
                size="icon"
                class="h-8 w-8"
                aria-label={note.snoozedUntil ? 'Remove reminder' : 'Set reminder'}
                onclick={() => {
                  if (note.snoozedUntil) {
                    unsnoozeNote(note.id);
                  } else {
                    handleRemind(note.id);
                  }
                }}
              >
                {#if note.snoozedUntil}
                  <BellOff class="w-4 h-4" />
                {:else}
                  <Bell class="w-4 h-4" />
                {/if}
              </Button>
              {#if snoozePickerNoteId === note.id}
                <SnoozePicker
                  onRemind={onRemindSelect}
                  onClose={() => snoozePickerNoteId = null}
                />
              {/if}
            </div>
          </div>
        </div>
      {/each}
    {/if}
  </main>

  <NoteDialog bind:open={dialogOpen} />
</div>
