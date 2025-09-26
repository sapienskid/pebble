<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import {
    Root as SelectRoot,
    Trigger as SelectTrigger,
    Content as SelectContent,
    Item as SelectItem,
  } from "$lib/components/ui/select";
  import { Label } from "$lib/components/ui/label";

  export let initialValue: string = '';
  export let id: string | undefined = undefined;
  export let label: string = '';

  const dispatch = createEventDispatcher();

  let hour: string = '';
  let minute: string = '';

  const hours = Array.from({ length: 24 }, (_, i) => ({
    value: i.toString().padStart(2, '0'),
    label: i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`
  }));

  const minutes = Array.from({ length: 60 }, (_, i) => ({
    value: i.toString().padStart(2, '0'),
    label: i.toString().padStart(2, '0')
  }));

  $: if (initialValue) {
    const [h, m] = initialValue.split(':');
    hour = h || '';
    minute = m || '';
  }

  $: if (hour && minute) {
    const newValue = `${hour}:${minute}`;
    if (newValue !== initialValue) {
      dispatch('change', newValue);
    }
  }

  $: selectedLabel = hour && minute ? `${parseInt(hour) === 0 ? 12 : parseInt(hour) <= 12 ? parseInt(hour) : parseInt(hour) - 12}:${minute} ${parseInt(hour) < 12 ? 'AM' : 'PM'}` : 'Select time';
</script>

<div>
  {#if label}
    <Label for={id}>{label}</Label>
  {/if}
  <div class="flex gap-2">
    <SelectRoot bind:value={hour} type="single">
      <SelectTrigger class="flex-1">
        {hour ? hours.find(h => h.value === hour)?.label : 'Hour'}
      </SelectTrigger>
      <SelectContent class="max-h-32 overflow-y-auto">
        {#each hours as h}
          <SelectItem value={h.value}>{h.label}</SelectItem>
        {/each}
      </SelectContent>
    </SelectRoot>
    <SelectRoot bind:value={minute} type="single">
      <SelectTrigger class="flex-1">
        {minute ? minute : 'Minute'}
      </SelectTrigger>
      <SelectContent class="max-h-40 overflow-y-auto">
        {#each minutes as m}
          <SelectItem value={m.value}>{m.label}</SelectItem>
        {/each}
      </SelectContent>
    </SelectRoot>
  </div>
</div>