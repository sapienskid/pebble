<script lang="ts">
  import { themeStore } from '$lib/stores/theme';
  import { settingsStore } from '$lib/stores/settings';
  import { Button } from '$lib/components/ui/button';
  import { Label } from '$lib/components/ui/label';
  import { Switch } from '$lib/components/ui/switch';
  import { Input } from '$lib/components/ui/input';
  import { Separator } from '$lib/components/ui/separator';
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
  } from '$lib/components/ui/dialog';
  import DeleteWarningDialog from './DeleteWarningDialog.svelte';
  import { X, Copy, Trash2, Plus } from '@lucide/svelte';
  import { requestNotificationPermission } from '$lib/services/notification';

  export let open = false;

  let currentTheme: 'light' | 'dark' | 'device';
  let settings: {
    syncEnabled: boolean;
    apiKeys: string[];
    autoSyncOnStart: boolean;
    notificationMethod: 'browser' | 'ntfy';
  } = {
    syncEnabled: false,
    apiKeys: [],
    autoSyncOnStart: false,
    notificationMethod: 'browser'
  };

  let deleteDialogOpen = false;
  let apiKeyToDelete: string | null = null;
  let newlyCreatedKey: string | null = null;
  let copied = false;
  let notificationPermission: NotificationPermission = 'default';

  // Subscribe to stores
  themeStore.subscribe(value => currentTheme = value);
  settingsStore.subscribe(value => settings = { ...value }); // Ensure it's a copy to avoid mutation issues

  // Initialize notification permission
  if (typeof Notification !== 'undefined') {
    notificationPermission = Notification.permission;
  }

  async function handleNotificationMethodChange(method: 'browser' | 'ntfy') {
    settings.notificationMethod = method;
    if (method === 'browser') {
      const granted = await requestNotificationPermission();
      notificationPermission = Notification.permission;
      if (!granted) {
        // Could show a message, but for now just update status
      }
    }
  }

  function saveSettings() {
    themeStore.set(currentTheme);
    settingsStore.update(() => ({ ...settings, id: 'settings' }));
    open = false;
  }

  function addApiKey() {
    const newKey = crypto.randomUUID();
    settings.apiKeys = [...settings.apiKeys, newKey];
    newlyCreatedKey = newKey;
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
      setTimeout(() => copied = false, 2000); // Reset after 2 seconds
      // Could add a toast notification here if available
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  }

  function dismissNewKey() {
    newlyCreatedKey = null;
    copied = false;
  }

  function maskApiKey(key: string): string {
    // Show first 8 characters and last 4 characters, mask the rest
    if (key.length <= 12) return '••••••••••••';
    return key.substring(0, 8) + '••••••••' + key.substring(key.length - 4);
  }

  function confirmDeleteApiKey(key: string) {
    apiKeyToDelete = key;
    deleteDialogOpen = true;
  }

  function deleteApiKey() {
    if (apiKeyToDelete) {
      settings.apiKeys = settings.apiKeys.filter(key => key !== apiKeyToDelete);
      apiKeyToDelete = null;
      deleteDialogOpen = false;
    }
  }
</script>

<Dialog bind:open>
  <DialogContent class="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Settings</DialogTitle>
      <DialogDescription>
        Customize your Pebble experience.
      </DialogDescription>
    </DialogHeader>

    <div class="grid gap-4 py-4">
      <!-- Theme Section -->
      <div class="space-y-2">
        <h3 class="text-sm font-medium">Theme</h3>
        <div class="space-y-2">
          <Label>Appearance</Label>
          <div class="flex gap-2">
            <Button
              variant={currentTheme === 'light' ? 'default' : 'outline'}
              size="sm"
              onclick={() => { currentTheme = 'light'; themeStore.set('light'); }}
            >
              Light
            </Button>
            <Button
              variant={currentTheme === 'dark' ? 'default' : 'outline'}
              size="sm"
              onclick={() => { currentTheme = 'dark'; themeStore.set('dark'); }}
            >
              Dark
            </Button>
            <Button
              variant={currentTheme === 'device' ? 'default' : 'outline'}
              size="sm"
              onclick={() => { currentTheme = 'device'; themeStore.set('device'); }}
            >
              Device
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      <!-- Sync Section -->
      <div class="space-y-2">
        <h3 class="text-sm font-medium">Sync</h3>
        <div class="flex items-center space-x-2">
          <Switch bind:checked={settings.syncEnabled} on:change={(e) => settingsStore.update(s => ({...s, syncEnabled: e.detail}))} ariaLabel="Enable background sync" />
          <Label>Enable background sync</Label>
        </div>
        <div class="space-y-2">
          <Label>API Keys (for Obsidian plugin)</Label>
          
          {#if newlyCreatedKey}
            <div class="p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-medium text-green-800 dark:text-green-200">New API Key Created</span>
                <Button onclick={dismissNewKey} size="sm" variant="ghost" class="h-6 w-6 p-0">
                  <X class="w-3 h-3" />
                </Button>
              </div>
              <div class="flex gap-2">
                <Input value={newlyCreatedKey} readonly class="flex-1 font-mono text-xs h-8" />
                <Button onclick={() => copyToClipboard(newlyCreatedKey!)} size="sm" disabled={copied} class="h-8 px-2">
                  <Copy class="w-3 h-3 mr-1" />
                  <span class="text-xs">{copied ? 'Copied' : 'Copy'}</span>
                </Button>
              </div>
              <p class="text-xs text-green-600 dark:text-green-400 mt-1">
                Copy this key now - it won't be shown again for security reasons.
              </p>
            </div>
          {/if}
          
          <div class="space-y-1">
            {#each settings.apiKeys as key (key)}
              <div class="flex gap-2 items-center">
                <Input value={maskApiKey(key)} readonly class="flex-1 font-mono h-8" />
                <Button onclick={() => confirmDeleteApiKey(key)} size="sm" variant="destructive" class="h-8 w-8 p-0">
                  <Trash2 class="w-3 h-3" />
                </Button>
              </div>
            {/each}
            <Button onclick={addApiKey} size="sm" variant="outline" class="h-8">
              <Plus class="w-3 h-3 mr-2" />
              <span class="text-xs">Add API Key</span>
            </Button>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <Switch bind:checked={settings.autoSyncOnStart} on:change={(e) => settingsStore.update(s => ({...s, autoSyncOnStart: e.detail}))} ariaLabel="Auto-sync on app start" />
          <Label>Auto-sync on app start</Label>
        </div>
      </div>

      <Separator />

            <Separator />

      <!-- Notifications Section -->
      <div class="space-y-2">
        <h3 class="text-sm font-medium">Notifications</h3>
        <div class="space-y-2">
          <Label>Notification Method</Label>
          <div class="flex gap-4">
            <label class="flex items-center space-x-2">
              <input type="radio" bind:group={settings.notificationMethod} value="browser" on:change={() => handleNotificationMethodChange('browser')} />
              <span>Browser</span>
            </label>
            <label class="flex items-center space-x-2">
              <input type="radio" bind:group={settings.notificationMethod} value="ntfy" on:change={() => handleNotificationMethodChange('ntfy')} />
              <span>Ntfy</span>
            </label>
          </div>
          {#if settings.notificationMethod === 'browser'}
            <p class="text-xs text-muted-foreground">
              Permission: {notificationPermission === 'granted' ? 'Granted' : notificationPermission === 'denied' ? 'Denied' : 'Not requested'}
            </p>
          {:else if settings.notificationMethod === 'ntfy'}
            <div class="text-xs text-muted-foreground space-y-1">
              <p>Server URL, topic, username and password are configured via environment variables:</p>
              <div class="grid grid-cols-2 gap-1 text-xs">
                <span class="font-mono">VITE_NTFY_SERVER:</span>
                <span class="{import.meta.env.VITE_NTFY_SERVER ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
                  {import.meta.env.VITE_NTFY_SERVER ? '✓ Set' : '✗ Not set'}
                </span>
                <span class="font-mono">VITE_NTFY_TOPIC:</span>
                <span class="{import.meta.env.VITE_NTFY_TOPIC ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
                  {import.meta.env.VITE_NTFY_TOPIC ? '✓ Set' : '✗ Not set'}
                </span>
                <span class="font-mono">VITE_NTFY_USERNAME:</span>
                <span class="{import.meta.env.VITE_NTFY_USERNAME ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
                  {import.meta.env.VITE_NTFY_USERNAME ? '✓ Set' : '✗ Not set'}
                </span>
                <span class="font-mono">VITE_NTFY_PASSWORD:</span>
                <span class="{import.meta.env.VITE_NTFY_PASSWORD ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
                  {import.meta.env.VITE_NTFY_PASSWORD ? '✓ Set' : '✗ Not set'}
                </span>
              </div>
            </div>
          {/if}
        </div>
      </div>

      <Separator />
      <div class="space-y-2">
        <h3 class="text-sm font-medium">About</h3>
        <div class="text-sm text-muted-foreground space-y-1">
          <p><strong>Pebble</strong> v1.0.0</p>
          <p>Offline-first atomic note taking and task management.</p>
          <p>Built with SvelteKit and Cloudflare Workers.</p>
          <p><a href="https://github.com/yourusername/pebble" target="_blank" class="text-primary hover:underline">View on GitHub</a></p>
        </div>
      </div>
    </div>

    <DialogFooter>
      <DialogClose>
        <Button variant="outline">Cancel</Button>
      </DialogClose>
      <Button onclick={saveSettings}>Save changes</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

<DeleteWarningDialog
  bind:open={deleteDialogOpen}
  onOpenChange={(open) => deleteDialogOpen = open}
  onConfirm={deleteApiKey}
  title={apiKeyToDelete || 'API Key'}
/>