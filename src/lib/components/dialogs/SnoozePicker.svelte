<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Clock, X } from '@lucide/svelte';

  export let onRemind: (until: string) => void;
  export let onClose: () => void;

  function remindPreset(hours: number): string {
    const d = new Date(Date.now() + hours * 60 * 60 * 1000);
    return d.toISOString();
  }

  function remindTomorrow9am(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
    return d.toISOString();
  }

  function remindTomorrow6pm(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(18, 0, 0, 0);
    return d.toISOString();
  }

  function remindMonday9am(): string {
    const d = new Date();
    const daysUntilMonday = (8 - d.getDay()) % 7 || 7;
    d.setDate(d.getDate() + daysUntilMonday);
    d.setHours(9, 0, 0, 0);
    return d.toISOString();
  }

  const presets = [
    { label: '1 hour', get: () => remindPreset(1) },
    { label: '3 hours', get: () => remindPreset(3) },
    { label: 'Tomorrow 9 AM', get: remindTomorrow9am },
    { label: 'Tomorrow 6 PM', get: remindTomorrow6pm },
    { label: 'Monday 9 AM', get: remindMonday9am },
    { label: '3 days', get: () => remindPreset(72) },
    { label: '1 week', get: () => remindPreset(168) },
  ];
</script>

<div class="absolute right-0 top-full mt-1 z-50 w-48 rounded-lg border border-border bg-background shadow-lg p-2">
  <div class="flex items-center justify-between mb-2 px-1">
    <span class="text-xs font-medium text-muted-foreground flex items-center gap-1">
      <Clock class="w-3 h-3" /> Remind me at
    </span>
    <button class="p-0.5 rounded hover:bg-muted" onclick={onClose} aria-label="Close">
      <X class="w-3 h-3" />
    </button>
  </div>
  <div class="space-y-0.5">
    {#each presets as preset}
      <Button
        variant="ghost"
        size="sm"
        class="w-full justify-start text-xs h-8"
        onclick={() => onRemind(preset.get())}
      >
        {preset.label}
      </Button>
    {/each}
  </div>
</div>
