<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter } from "$lib/components/ui/dialog";
  import { Textarea } from "$lib/components/ui/textarea";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { v4 as uuidv4 } from 'uuid';
  import { notesStore } from '$lib/stores/notes';
  import { HelpCircle, Wifi, Lightbulb } from '@lucide/svelte';

  export let open: boolean = false;

  let content = '';
  let selectedTag: string | null = null;
  let showFinalEdit = false;

  const availableTags = ['queries', 'thought', 'idea'];

  function getTagComponent(tag: string) {
    switch (tag) {
      case 'queries': return HelpCircle;
      case 'thought': return Wifi;
      case 'idea': return Lightbulb;
      default: return Wifi;
    }
  }

  $: isValid = content.trim().length > 0 && content.length <= 500;

  function selectTag(tag: string) {
    selectedTag = selectedTag === tag ? null : tag;
  }


  function handleFinalConfirm(finalContent: string, finalTag: string | null) {
    const defaultTag = 'thoughts';
    const tags = finalTag ? [finalTag] : [defaultTag];
    notesStore.update(list => [...list, { id: uuidv4(), content: finalContent, tags, timestamp: new Date().toISOString(), synced: false }]);
    content = '';
    selectedTag = null;
    showFinalEdit = false;
    open = false;
  }

  function handleFinalCancel() {
    showFinalEdit = false;
  }
</script>

<Dialog bind:open>
  <DialogTrigger>
    <slot />
  </DialogTrigger>
  <DialogContent class="sm:max-w-md">
    <DialogHeader>
      <DialogTitle class="text-xl font-semibold">Capture a New Note</DialogTitle>
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
              <svelte:component this={getTagComponent(tag)} class="w-4 h-4" />
              {tag}
            </button>
          {/each}
        </div>
      </div>
    </div>
    <DialogFooter class="gap-3">
      <DialogClose>
        <Button variant="outline" class="px-6">Cancel</Button>
      </DialogClose>
      <Button onclick={()=> handleFinalConfirm(content,selectedTag)} disabled={!isValid} class="px-6">
        Create
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

