<script lang="ts">
  import { themeStore } from "$lib/stores/theme";
  import { settingsStore } from "$lib/stores/settings";
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

  export let open = false;

  let currentTheme: "light" | "dark" | "device";
  let settings: {
    syncEnabled: boolean;
    autoSyncOnStart: boolean;
  } = {
    syncEnabled: false,
    autoSyncOnStart: false,
  };

  // Subscribe to stores
  themeStore.subscribe((value) => (currentTheme = value));

  function saveSettings() {
    themeStore.set(currentTheme);
    settingsStore.update(() => ({ ...settings, id: "settings" }));
    open = false;
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
            bind:checked={settings.syncEnabled}
            on:change={(e) =>
              settingsStore.update((s) => ({ ...s, syncEnabled: e.detail }))}
            ariaLabel="Enable background sync"
          />
          <Label>Enable background sync</Label>
        </div>
        <div class="flex items-center space-x-2">
          <Switch
            bind:checked={settings.autoSyncOnStart}
            on:change={(e) =>
              settingsStore.update((s) => ({
                ...s,
                autoSyncOnStart: e.detail,
              }))}
            ariaLabel="Auto-sync on app start"
          />
          <Label>Auto-sync on app start</Label>
        </div>
      </div>

      <Separator />

      <Separator />

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
      <Button onclick={saveSettings}>Save changes</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
