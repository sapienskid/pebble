<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { FileText, RefreshCw, Settings } from '@lucide/svelte';
  import SettingsDialog from '$lib/components/dialogs/SettingsDialog.svelte';
  import { onMount } from 'svelte';

  let { title = '' } = $props();

  let settingsOpen = $state(false);
  let isOnline = $state(navigator.onLine);

  onMount(() => {
    const updateOnline = () => isOnline = navigator.onLine;
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);
    return () => {
      window.removeEventListener('online', updateOnline);
      window.removeEventListener('offline', updateOnline);
    };
  });
</script>

<header class="sticky top-0 bg-background flex items-center justify-between p-4">
  <div class="flex items-center gap-3">
    <div class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
      <FileText class="w-4 h-4 text-primary" />
    </div>
    <div class="text-lg font-semibold">{title}</div>
    <div class="w-2 h-2 rounded-full {isOnline ? 'bg-green-500' : 'bg-red-500'}"></div>
  </div>
  <div class="flex items-center gap-2">
    <Button variant="outline" size="icon" aria-label="Sync">
      <RefreshCw class="w-4 h-4" />
    </Button>
    <Button variant="outline" size="icon" onclick={() => settingsOpen = true} aria-label="Settings">
      <Settings class="w-4 h-4" />
    </Button>
  </div>
</header>

<SettingsDialog bind:open={settingsOpen} />
