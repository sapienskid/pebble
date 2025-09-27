<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { RefreshCw, Settings } from '@lucide/svelte';
  import SettingsDialog from '$lib/components/dialogs/SettingsDialog.svelte';
  import { onMount } from 'svelte';
  import logoUrl from '$lib/assets/logo.svg?url';
  import { syncUnsyncedItems } from '$lib/services/sync';
  import { syncStore } from '$lib/stores/sync';
  import { getRelativeTime } from '$lib/utils';

  let settingsOpen = $state(false);
  let isOnline = $state(navigator.onLine);

  const syncing = $derived($syncStore.syncing);
  const lastSyncAt = $derived($syncStore.lastSyncAt);

  onMount(() => {
    const updateOnline = () => isOnline = navigator.onLine;
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);
    return () => {
      window.removeEventListener('online', updateOnline);
      window.removeEventListener('offline', updateOnline);
    };
  });

  async function handleSync() {
    if (!isOnline || syncing) return;
    await syncUnsyncedItems();
  }
</script>

<header class="sticky top-0 bg-background flex items-center justify-between p-4">
  <div class="flex items-center gap-3">
    <img src={logoUrl} alt="Logo" class="w-32 h-auto dark:invert" />
    <div class="w-2 h-2 rounded-full {isOnline ? 'bg-green-500' : 'bg-red-500'}"></div>
  </div>
  <div class="flex items-center gap-3">
    {#if lastSyncAt}
      <div class="text-xs text-muted-foreground hidden sm:block">Last sync {getRelativeTime(lastSyncAt)}</div>
    {/if}
    <Button variant="outline" size="icon" onclick={handleSync} disabled={!isOnline || syncing} aria-label="Sync">
      <RefreshCw class="w-4 h-4 {syncing ? 'animate-spin' : ''}" />
    </Button>
    <Button variant="outline" size="icon" onclick={() => settingsOpen = true} aria-label="Settings">
      <Settings class="w-4 h-4" />
    </Button>
  </div>
</header>

<SettingsDialog bind:open={settingsOpen} />
