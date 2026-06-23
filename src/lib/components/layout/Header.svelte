<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { AlertTriangle, RefreshCw, Settings } from '@lucide/svelte';
  import SettingsDialog from '$lib/components/dialogs/SettingsDialog.svelte';
  import { onMount } from 'svelte';
  import logoUrl from '$lib/assets/logo.svg?url';
  import { syncUnsyncedItems } from '$lib/services/sync';
  import { syncStore, clearSyncError } from '$lib/stores/sync';
  import { settingsStore } from '$lib/stores/settings';
  import { getRelativeTime } from '$lib/utils';

  let settingsOpen = $state(false);
  let isOnline = $state(navigator.onLine);

  const syncing = $derived($syncStore.syncing);
  const lastSyncAt = $derived($syncStore.lastSyncAt);
  const syncError = $derived($syncStore.error);
  const syncEnabled = $derived($settingsStore.syncEnabled);
  const syncDisabled = $derived(!syncEnabled);

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

<header class="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border/50 flex items-center justify-between p-4">
  <div class="flex items-center gap-3">
    <img src={logoUrl} alt="Logo" class="w-32 h-auto dark:invert" />
    <div class="w-2 h-2 rounded-full {isOnline ? 'bg-green-500' : 'bg-red-500'}"></div>
  </div>
  <div class="flex items-center gap-3">
    {#if lastSyncAt && !syncError}
      <div class="text-xs text-muted-foreground hidden sm:block">Last sync {getRelativeTime(lastSyncAt)}</div>
    {/if}
    {#if syncError}
      <button
        class="text-xs text-destructive flex items-center gap-1 max-w-[200px] truncate"
        onclick={clearSyncError}
        title={syncError}
      >
        <AlertTriangle class="w-3 h-3 shrink-0" />
        <span class="truncate">{syncError}</span>
      </button>
    {/if}
    <Button
      variant="outline"
      size="icon"
      onclick={handleSync}
      disabled={syncDisabled || !isOnline || syncing}
      aria-label={syncDisabled ? 'Sync disabled' : 'Sync'}
      title={syncDisabled ? 'Enable sync in Settings first' : 'Sync unsynced notes'}
    >
      <RefreshCw class="w-4 h-4 {syncing ? 'animate-spin' : ''}" />
    </Button>
    <Button variant="outline" size="icon" onclick={() => settingsOpen = true} aria-label="Settings">
      <Settings class="w-4 h-4" />
    </Button>
  </div>
</header>

<SettingsDialog bind:open={settingsOpen} />
