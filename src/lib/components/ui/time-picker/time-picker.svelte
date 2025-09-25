<script lang="ts">
  import {
    Root as SelectRoot,
    Trigger as SelectTrigger,
    Content as SelectContent,
    Item as SelectItem,
  } from "$lib/components/ui/select";
  import { Label } from "$lib/components/ui/label";

  export let value: string = '';
  export let id: string | undefined = undefined;
  export let label: string = '';

  const times = [
    { value: '', label: 'No specific time' },
    { value: 'now', label: 'Now' },
    { value: '09:00', label: '9:00 AM' },
    { value: '10:00', label: '10:00 AM' },
    { value: '11:00', label: '11:00 AM' },
    { value: '12:00', label: '12:00 PM' },
    { value: '13:00', label: '1:00 PM' },
    { value: '14:00', label: '2:00 PM' },
    { value: '15:00', label: '3:00 PM' },
    { value: '16:00', label: '4:00 PM' },
    { value: '17:00', label: '5:00 PM' },
    { value: '18:00', label: '6:00 PM' },
    { value: '19:00', label: '7:00 PM' },
    { value: '20:00', label: '8:00 PM' },
    { value: '21:00', label: '9:00 PM' },
    { value: '22:00', label: '10:00 PM' },
  ];

  $: if (value === 'now') {
    value = new Date().toTimeString().slice(0, 5);
  }

  $: selectedLabel = times.find(t => t.value === value)?.label || 'Select time';
</script>

<div>
  {#if label}
    <Label for={id}>{label}</Label>
  {/if}
  <SelectRoot bind:value type="single">
    <SelectTrigger>
      {selectedLabel}
    </SelectTrigger>
    <SelectContent>
      {#each times as time}
        <SelectItem value={time.value}>{time.label}</SelectItem>
      {/each}
    </SelectContent>
  </SelectRoot>
</div>