<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "$lib/components/ui/dialog";
  import { Textarea } from "$lib/components/ui/textarea";
  import { Label } from "$lib/components/ui/label";
  import Icon from '@iconify/svelte';
  import { getTagIcon } from '$lib/utils';

  export let open: boolean = false;
  export let initialContent: string = '';
  export let initialTag: string | null = null;
  export let onConfirm: (content: string, tag: string | null) => void;
  export let onCancel: () => void;

  let content = initialContent;
  let selectedTag = initialTag;

  const availableTags = ['queries', 'thought', 'idea'];

  $: isValid = content.trim().length > 0 && content.length <= 500;

  function selectTag(tag: string) {
    selectedTag = selectedTag === tag ? null : tag;
  }

  function handleConfirm() {
    if (isValid) {
      onConfirm(content.trim(), selectedTag);
      open = false;
    }
  }

  function handleCancel() {
    onCancel();
    open = false;
  }

  // Reset when dialog opens
  $: if (open) {
    content = initialContent;
    selectedTag = initialTag;
  }
</script>

<Dialog bind:open>
  <DialogContent class="sm:max-w-md">
    <DialogHeader>
      <DialogTitle class="text-xl font-semibold">Review and Edit Note</DialogTitle>
    </DialogHeader>
    <div class="space-y-6">
      <div>
        <Label for="content" class="text-sm font-medium">Content</Label>
        <Textarea
          id="content"
          bind:value={content}
          placeholder="Capture your atomic note..."
          class="mt-2 min-h-[100px] resize-none"
          maxlength={500}
        />
        <div class="flex justify-between items-center mt-2 text-xs text-muted-foreground">
          <span>{content.length} / 500 characters</span>
        </div>
      </div>
      <div>
        <Label for="tags" class="text-sm font-medium">Tag (optional)</Label>
        <div class="flex flex-wrap gap-3 mt-3">
          {#each availableTags as tag}
            <button
              type="button"
              onclick={() => selectTag(tag)}
              class="flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-200 capitalize text-sm font-medium
                {selectedTag === tag
                  ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                  : 'border-border bg-background text-foreground hover:border-primary/50 hover:bg-primary/5'}"
            >
              <Icon icon={getTagIcon(tag)} class="w-4 h-4" />
              {tag}
            </button>
          {/each}
        </div>
      </div>
    </div>
    <DialogFooter class="gap-3">
      <Button onclick={handleCancel} variant="outline" class="px-6">Cancel</Button>
      <Button onclick={handleConfirm} disabled={!isValid} class="px-6">
        Create Note
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
