<script lang="ts">
  import { onMount } from 'svelte';
  import { notesStore, togglePin, deleteNote } from '$lib/stores/notes';
  import { Button } from "$lib/components/ui/button";
  import NoteDialog from '$lib/components/dialogs/NoteDialog.svelte';
  import { Lightbulb, Pin, PinOff, Search, X } from '@lucide/svelte';
  import Icon from '@iconify/svelte';
  import { getTagIcon, getRelativeTime } from '$lib/utils';
  import { noteDialogOpen } from '$lib/stores/ui';
  import type { Note } from '$lib/db';

  let notes: Note[] = $state([]);
  let dialogOpen = $state(false);
  let searchQuery = $state('');
  let showPinnedOnly = $state(false);
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
    // Sort: pinned first, then by timestamp descending
    const sorted = [...result].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
    return sorted;
  });

  function clearSearch() {
    searchQuery = '';
  }

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
        <div
          class="group flex items-start p-4 bg-card rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/20 relative {note.pinned ? 'border-primary/30' : ''}"
          role="button"
          tabindex="0"
          ondblclick={() => togglePin(note.id)}
        >
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              {#if note.pinned}
                <Pin class="w-3 h-3 text-primary shrink-0" />
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
          </div>
        </div>
      {/each}
    {/if}
  </main>

  <NoteDialog bind:open={dialogOpen} />
</div>
