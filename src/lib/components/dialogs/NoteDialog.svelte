<script lang="ts">
  import { tick } from 'svelte';
  import { Button } from "$lib/components/ui/button";
  import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "$lib/components/ui/dialog";
  import { Textarea } from "$lib/components/ui/textarea";
  import { Label } from "$lib/components/ui/label";
  import { addNote } from '$lib/stores/notes';

  export let open: boolean = false;

  let content = '';
  let isSubmitting = false;
  let contentRef: HTMLTextAreaElement | null = null;

  function normalizeTag(rawTag: string): string {
    return rawTag
      .trim()
      .replace(/^#+/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .toLowerCase();
  }

  function uniqueTags(tags: string[]): string[] {
    return [...new Set(tags.filter(Boolean))];
  }

  function extractHashtags(input: string): string[] {
    const matches = input.match(/#[a-zA-Z0-9_-]+/g) ?? [];
    return uniqueTags(matches.map(normalizeTag));
  }

  $: isValid = content.trim().length > 0 && content.length <= 500;
  $: finalTags = extractHashtags(content);

  $: if (open) {
    tick().then(() => {
      contentRef?.focus();
    });
  }

  function handleContentKeydown(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      void handleCreate();
    }
  }

  async function handleFinalConfirm(finalContent: string, tags: string[]) {
    const defaultTag = 'thoughts';
    const tagsToSave = tags.length > 0 ? tags : [defaultTag];
    await addNote(finalContent, tagsToSave);
    content = '';
    open = false;
  }

  async function handleCreate() {
    if (!isValid || isSubmitting) return;
    isSubmitting = true;
    try {
      await handleFinalConfirm(content, finalTags);
    } finally {
      isSubmitting = false;
    }
  }
</script>

<Dialog bind:open>
  <DialogTrigger>
    <slot />
  </DialogTrigger>
  <DialogContent class="flex w-[calc(100%-1.5rem)] max-w-md max-h-[calc(100dvh-1.5rem)] flex-col overflow-hidden p-0 gap-0">
    <DialogHeader class="shrink-0 border-b border-border/70 px-5 pt-5 pb-4">
      <DialogTitle class="text-xl font-semibold">Capture a New Note</DialogTitle>
    </DialogHeader>
    <div class="flex-1 space-y-6 overflow-y-auto px-5 py-4">
      <div>
        <Label for="content" class="text-sm font-medium">Content</Label>
        <Textarea
          id="content"
          bind:ref={contentRef}
          bind:value={content}
          placeholder="Capture your atomic note..."
          class="mt-2 h-36 max-h-36 overflow-y-auto resize-none"
          maxlength={500}
          onkeydown={handleContentKeydown}
        />
        <div class="flex justify-between items-center mt-2 text-xs text-muted-foreground">
          <span>{content.length} / 500 characters</span>
          <span class="hidden sm:inline">Ctrl/⌘ + Enter to create</span>
          <span class="sm:hidden">Tap Create below</span>
        </div>
        <p class="mt-2 text-xs text-muted-foreground">
          Add tags directly in the note like `#idea` or `#research`.
        </p>
        {#if finalTags.length > 0}
          <div class="mt-3 flex flex-wrap gap-2">
            {#each finalTags as tag}
              <span class="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                #{tag}
              </span>
            {/each}
          </div>
        {/if}
      </div>
    </div>
    <DialogFooter class="shrink-0 border-t border-border/70 bg-background/95 px-5 py-4 gap-3">
      <Button onclick={handleCreate} disabled={!isValid || isSubmitting} class="px-6">
        {isSubmitting ? 'Creating...' : 'Create'}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
