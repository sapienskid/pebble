<script lang="ts">
  import { themeStore } from '$lib/stores/theme';
  import { settingsStore } from '$lib/stores/settings';
  import { db, type ApiKey } from '$lib/db';
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
    syncToken?: string;
    autoSyncOnStart: boolean;
    notificationMethod: 'browser' | 'ntfy';
  } = {
    syncEnabled: false,
    autoSyncOnStart: false,
    notificationMethod: 'browser'
  };

  let apiKeys: { keyId: string; name: string; createdAt: string; lastUsedAt: string | null; revoked: boolean }[] = [];
  let loadingKeys = false;
  let creatingKey = false;
  let revokingKeys = new Set<string>();

  let deleteDialogOpen = false;
  let apiKeyToDelete: string | null = null;
  let newlyCreatedKey: string | null = null;
  let copied = false;
  let notificationPermission: NotificationPermission = 'default';

  // Subscribe to stores
  themeStore.subscribe(value => currentTheme = value);
  settingsStore.subscribe(value => settings = { ...value }); // Ensure it's a copy to avoid mutation issues

  $: if (open && !loadingKeys) loadApiKeysFromDB();

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
    createApiKey();
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

  function confirmDeleteApiKey(keyId: string) {
    apiKeyToDelete = keyId;
    deleteDialogOpen = true;
  }

  function deleteApiKey() {
    if (apiKeyToDelete) {
      revokeApiKey(apiKeyToDelete);
      apiKeyToDelete = null;
      deleteDialogOpen = false;
    }
  }

  async function loadApiKeysFromDB() {
    loadingKeys = true;
    try {
      const keys = await db.apiKeys.toArray();
      apiKeys = keys.map(k => ({
        keyId: k.id,
        name: k.name,
        createdAt: k.createdAt,
        lastUsedAt: k.lastUsedAt || null,
        revoked: k.revoked
      }));
    } catch (error) {
      console.error('Error loading API keys from DB:', error);
    } finally {
      loadingKeys = false;
    }
  }

  async function fetchApiKeys() {
    // This can be called to sync with server if needed
    loadingKeys = true;
    try {
      const response = await fetch('/api/keys/list');
      if (response.ok) {
        const data: { keys: any[] } = await response.json();
        // Update local DB with server data
        for (const serverKey of data.keys) {
          const localKey = await db.apiKeys.get(serverKey.keyId);
          if (!localKey || localKey.synced === false) {
            // Update local with server data
            await db.apiKeys.put({
              id: serverKey.keyId,
              tokenSecret: '', // We don't have it from server
              createdAt: serverKey.createdAt,
              revoked: serverKey.revoked,
              synced: true,
              name: serverKey.name,
              lastUsedAt: serverKey.lastUsedAt
            });
          }
        }
        await loadApiKeysFromDB(); // Refresh from updated DB
      } else {
        console.error('Failed to fetch API keys from server');
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
    } finally {
      loadingKeys = false;
    }
  }

  async function createApiKey() {
    creatingKey = true;
    try {
      // Generate locally
      const keyId = crypto.randomUUID();
      const tokenSecret = crypto.randomUUID();
      const token = `${keyId}.${tokenSecret}`;

      const apiKey: ApiKey = {
        id: keyId,
        tokenSecret,
        createdAt: new Date().toISOString(),
        revoked: false,
        synced: false,
        name: `Key ${keyId.slice(0, 8)}`
      };

      // Store locally immediately
      await db.apiKeys.put(apiKey);

      // Display the token for copying
      newlyCreatedKey = token;

      // Refresh local list
      await loadApiKeysFromDB();
    } catch (error) {
      console.error('Error creating API key:', error);
    } finally {
      creatingKey = false;
    }
  }

  async function revokeApiKey(keyId: string) {
    revokingKeys.add(keyId);
    try {
      // Mark as revoked locally first
      const key = await db.apiKeys.get(keyId);
      if (key) {
        key.revoked = true;
        key.synced = false; // Mark for sync
        await db.apiKeys.put(key);
      }

      // If this was the current sync token, clear it
      if (settings.syncToken && settings.syncToken.startsWith(keyId + '.')) {
        settingsStore.update(s => ({ ...s, syncToken: undefined }));
      }

      await loadApiKeysFromDB(); // Refresh local list

      // Try to sync revocation to server (don't block on failure)
      try {
        const response = await fetch('/api/keys/revoke', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keyId })
        });
        if (response.ok) {
          // Mark as synced
          if (key) {
            key.synced = true;
            await db.apiKeys.put(key);
          }
        }
      } catch (syncError) {
        console.warn('Failed to sync key revocation to server:', syncError);
      }
    } catch (error) {
      console.error('Error revoking API key:', error);
    } finally {
      revokingKeys.delete(keyId);
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
      <div class="space-y-4">
        <h3 class="text-sm font-medium">Sync</h3>
        <div class="flex items-center space-x-2">
          <Switch bind:checked={settings.syncEnabled} on:change={(e) => settingsStore.update(s => ({...s, syncEnabled: e.detail}))} ariaLabel="Enable background sync" />
          <Label>Enable background sync</Label>
        </div>
        <div class="space-y-2">
          <Label>Sync Token</Label>
          <Input bind:value={settings.syncToken} placeholder="Paste your API token here" class="font-mono text-sm" />
          <p class="text-xs text-muted-foreground">
            Enter the API token from the Obsidian plugin or copy from newly created keys above.
          </p>
        </div>
        <div class="space-y-2">
          <Label>API Keys (for Obsidian plugin)</Label>
          
          {#if newlyCreatedKey}
            <div class="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-green-800 dark:text-green-200">New API Key Created</span>
                <Button onclick={dismissNewKey} size="sm" variant="ghost">
                  <X class="w-4 h-4" />
                </Button>
              </div>
              <div class="flex gap-2">
                <Input value={newlyCreatedKey} readonly class="flex-1 font-mono text-sm" />
                <Button onclick={() => { copyToClipboard(newlyCreatedKey!); settings.syncToken = newlyCreatedKey ?? undefined; }} size="sm" disabled={copied}>
                  <Copy class="w-4 h-4 mr-1" />
                  {copied ? 'Copied & Set' : 'Copy & Set as Sync Token'}
                </Button>
              </div>
              <p class="text-xs text-green-600 dark:text-green-400 mt-1">
                Copy this key now - it won't be shown again for security reasons.
              </p>
            </div>
          {/if}
          
          <div class="space-y-2">
            {#each apiKeys.filter(k => !k.revoked) as key (key.keyId)}
              <div class="flex gap-2 items-center">
                <Input value={maskApiKey(key.keyId)} readonly class="flex-1 font-mono" />
                <Button onclick={() => confirmDeleteApiKey(key.keyId)} size="sm" variant="destructive" disabled={revokingKeys.has(key.keyId)}>
                  <Trash2 class="w-4 h-4" />
                </Button>
              </div>
            {/each}
            <Button onclick={addApiKey} size="sm" variant="outline" disabled={creatingKey}>
              <Plus class="w-4 h-4 mr-2" />
              {creatingKey ? 'Creating...' : 'Add API Key'}
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
  title="API Key"
/>