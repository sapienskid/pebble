<script lang="ts">
  import { onMount } from 'svelte';
  import { notesStore } from '$lib/stores/notes';
  import { Button } from "$lib/components/ui/button";
  import NoteDialog from '$lib/components/dialogs/NoteDialog.svelte';
  import { Lightbulb, Plus } from '@lucide/svelte';
  import Icon from '@iconify/svelte';
  import { getTagIcon, getRelativeTime } from '$lib/utils';
  import { noteDialogOpen } from '$lib/stores/ui';
  import type { Note } from '$lib/db';

  let notes: Note[] = [];
  let dialogOpen = false;

  $: dialogOpen = $noteDialogOpen;
  $: if (dialogOpen !== $noteDialogOpen) noteDialogOpen.set(dialogOpen);

  onMount(() => {
    const unsubscribe = notesStore.subscribe((value: Note[]) => {
      notes = value;
    });

    return () => unsubscribe();
  });
</script>

<div class="flex flex-col relative">

  <main class="flex-1 p-4 space-y-4">
    {#if notes.length === 0}
      <div class="flex flex-col items-center justify-center h-full text-center p-8">
        <Lightbulb class="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h3 class="text-lg font-semibold text-foreground mb-2">No notes yet</h3>
        <p class="text-sm text-muted-foreground mb-6">Capture your first atomic note to get started. Keep it concise!</p>
      </div>
    {:else}
      {#each notes as note (note.id)}
        <div class="group flex items-start p-6 bg-card rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/20 relative">
          <div class="flex-1 min-w-0">
            <p class="text-base text-foreground leading-relaxed mb-2 line-clamp-3">{note.content}</p>
            {#if note.tags.length > 0}
              <div class="flex flex-wrap gap-1 mb-2">
                {#each note.tags as tag}
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    <Icon icon={getTagIcon(tag)} class="w-3 h-3 mr-1" />
                    {tag}
                  </span>
                {/each}
              </div>
            {/if}
            <p class="text-xs text-muted-foreground/70 font-medium">{getRelativeTime(note.timestamp)}</p>
          </div>
        </div>
      {/each}
    {/if}
  </main>

  <NoteDialog bind:open={dialogOpen} />

</div>