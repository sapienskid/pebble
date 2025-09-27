<script lang="ts">
  import { themeStore } from "$lib/stores/theme";
  import { settingsStore } from "$lib/stores/settings";
  import { notesStore } from "$lib/stores/notes";
  import { Button } from "$lib/components/ui/button";
  import { Label } from "$lib/components/ui/label";
  import { Switch } from "$lib/components/ui/switch";
  import { Separator } from "$lib/components/ui/separator";
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
  } from "$lib/components/ui/dialog";
  import { X } from "@lucide/svelte";
  import { db } from "$lib/db";

  export let open = false;

  let currentTheme: "light" | "dark" | "device";
  themeStore.subscribe((value) => (currentTheme = value));

  function saveTheme() {
    themeStore.set(currentTheme);
    open = false;
  }

  function setRetention(retentionDays: number | null) {
    settingsStore.update((s) => ({ ...s, retentionDays }));
  }

  async function clearLocalData() {
    if (!confirm('This will remove all locally stored notes. This cannot be undone. Continue?')) return;
    try {
      await (db as any).notes.clear();
      notesStore.set([]);
    } catch (e) {
      console.error('Failed to clear local data:', e);
    }
  }
</script>

<Dialog bind:open>
  <DialogContent class="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Settings</DialogTitle>
      <DialogDescription>Customize your Pebble experience.</DialogDescription>
    </DialogHeader>

    <div class="grid gap-4 py-4">
      <!-- Theme Section -->
      <div class="space-y-2">
        <h3 class="text-sm font-medium">Theme</h3>
        <div class="space-y-2">
          <Label>Appearance</Label>
          <div class="flex gap-2">
            <Button
              variant={currentTheme === "light" ? "default" : "outline"}
              size="sm"
              onclick={() => {
                currentTheme = "light";
                themeStore.set("light");
              }}
            >
              Light
            </Button>
            <Button
              variant={currentTheme === "dark" ? "default" : "outline"}
              size="sm"
              onclick={() => {
                currentTheme = "dark";
                themeStore.set("dark");
              }}
            >
              Dark
            </Button>
            <Button
              variant={currentTheme === "device" ? "default" : "outline"}
              size="sm"
              onclick={() => {
                currentTheme = "device";
                themeStore.set("device");
              }}
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
          <Switch
            checked={$settingsStore.syncEnabled}
            on:change={(e) => {
              settingsStore.update((s) => ({ ...s, syncEnabled: e.detail }));
            }}
            ariaLabel="Enable background sync"
          />
          <Label>Enable background sync</Label>
        </div>
        <div class="flex items-center space-x-2">
          <Switch
            checked={$settingsStore.autoSyncOnStart}
            on:change={(e) => {
              settingsStore.update((s) => ({ ...s, autoSyncOnStart: e.detail }));
            }}
            ariaLabel="Auto-sync on app start"
          />
          <Label>Auto-sync on app start</Label>
        </div>
      </div>

      <Separator />

      <!-- Data Retention Section -->
      <div class="space-y-3">
        <h3 class="text-sm font-medium">Local data retention</h3>
        <p class="text-xs text-muted-foreground">Choose how long to keep notes locally. Older notes will be automatically removed.</p>
        <div class="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={$settingsStore.retentionDays == null ? 'default' : 'outline'}
            onclick={() => setRetention(null)}
          >Forever</Button>
          <Button
            size="sm"
            variant={$settingsStore.retentionDays === 7 ? 'default' : 'outline'}
            onclick={() => setRetention(7)}
          >7 days</Button>
          <Button
            size="sm"
            variant={$settingsStore.retentionDays === 15 ? 'default' : 'outline'}
            onclick={() => setRetention(15)}
          >15 days</Button>
          <Button
            size="sm"
            variant={$settingsStore.retentionDays === 30 ? 'default' : 'outline'}
            onclick={() => setRetention(30)}
          >30 days</Button>
        </div>
        <div>
          <Button variant="destructive" size="sm" onclick={clearLocalData}>Clear local data</Button>
        </div>
      </div>

      <Separator />

      <!-- Cloud sync retention -->
      <div class="space-y-3">
        <h3 class="text-sm font-medium">Cloud sync retention</h3>
        <p class="text-xs text-muted-foreground">Control how long items stay in Cloudflare KV. Lower values save quota.</p>
        <div class="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={$settingsStore.syncRetentionDays === 7 ? 'default' : 'outline'}
            onclick={() => settingsStore.update(s => ({ ...s, syncRetentionDays: 7 }))}
          >7 days</Button>
          <Button
            size="sm"
            variant={$settingsStore.syncRetentionDays === 15 ? 'default' : 'outline'}
            onclick={() => settingsStore.update(s => ({ ...s, syncRetentionDays: 15 }))}
          >15 days</Button>
          <Button
            size="sm"
            variant={$settingsStore.syncRetentionDays === 30 ? 'default' : 'outline'}
            onclick={() => settingsStore.update(s => ({ ...s, syncRetentionDays: 30 }))}
          >30 days</Button>
        </div>
      </div>

      <Separator />

      <div class="space-y-2">
        <h3 class="text-sm font-medium">About</h3>
        <div class="text-sm text-muted-foreground space-y-1">
          <p><strong>Pebble</strong> v1.0.0</p>
          <p>Offline-first atomic note taking and task management.</p>
          <p>Built with SvelteKit and Cloudflare Workers.</p>
          <p>
            <a
              href="https://github.com/yourusername/pebble"
              target="_blank"
              class="text-primary hover:underline">View on GitHub</a
            >
          </p>
        </div>
      </div>
    </div>

    <DialogFooter>
      <DialogClose>
        <Button variant="outline">Cancel</Button>
      </DialogClose>
      <Button onclick={saveTheme}>Save changes</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
