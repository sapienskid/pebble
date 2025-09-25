<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import Icon from '@iconify/svelte';
  import SettingsDialog from '$lib/components/dialogs/SettingsDialog.svelte';
  export let title = '';

  let settingsOpen = false;
</script>

<header class="sticky top-0 bg-background flex items-center justify-between p-4">
  <div class="flex items-center gap-3">
    <div class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
      <Icon icon="streamline-freehand:notes-paper" class="w-4 h-4 text-primary" />
    </div>
    <div class="text-lg font-semibold">{title}</div>
  </div>
  <div class="flex items-center gap-2">
    <Button variant="outline" size="icon" aria-label="Sync">
      <Icon icon="streamline-freehand:synchronize-arrows" class="w-4 h-4" />
    </Button>
    <Button variant="outline" size="icon" onclick={() => settingsOpen = true} aria-label="Settings">
      <Icon icon="streamline-freehand:settings-cog" class="w-4 h-4" />
    </Button>
  </div>
</header>

<SettingsDialog bind:open={settingsOpen} />
