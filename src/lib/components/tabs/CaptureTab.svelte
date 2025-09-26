<script lang="ts">
  import { onMount } from 'svelte';
  import { notesStore } from '$lib/stores/notes';
  import { Button } from "$lib/components/ui/button";
  import NoteDialog from '$lib/components/dialogs/NoteDialog.svelte';
  import { Lightbulb, Plus } from '@lucide/svelte';
  import Icon from '@iconify/svelte';
  import { getTagIcon, getRelativeTime } from '$lib/utils';

  let notes: Note[] = [];
  // local state for dialog open control
  let noteDialogOpen = false;

  onMount(() => {
    const unsubscribe = notesStore.subscribe((value: Note[]) => {
      notes = value;
    });

    return () => unsubscribe();
  });
</script>

<div class="flex flex-col relative">

  <main class="flex-1  p-4 space-y-4 ">
    {#if notes.length === 0}
      <div class="flex flex-col items-center justify-center h-full text-center p-8">
        <Lightbulb class="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h3 class="text-lg font-semibold text-foreground mb-2">No notes yet</h3>
        <p class="text-sm text-muted-foreground mb-6">Capture your first atomic note to get started. Keep it concise!</p>
      </div>
    {:else}
      {#each notes as note}
        <div class="group flex items-start p-6 bg-card rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/20">
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
  <!-- Use an explicit open binding to avoid nesting a <button> inside the dialog trigger (SSR/hydration issues) -->
  <NoteDialog bind:open={noteDialogOpen} />
  <button
    type="button"
    on:click={() => (noteDialogOpen = true)}
    class="fixed right-4 sm:right-[calc(50vw-15rem)] lg:right-[calc(50vw-13rem)] bottom-[calc(theme(spacing.20)+env(safe-area-inset-bottom,0px))] p-4 bg-primary rounded-full shadow-lg hover:bg-primary/90 z-[60] text-primary-foreground"
    aria-label="Add new note"
    style="translate: 0 0;"
  >
    <Plus class="w-6 h-6" />
  </button>

</div>