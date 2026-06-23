<script lang="ts">
  import { get } from 'svelte/store';
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
  } from "$lib/components/ui/dialog";
  import type { Note } from '$lib/db';
  import { notesStore } from '$lib/stores/notes';

  let { open = $bindable(false) }: { open: boolean } = $props();

  let notes: Note[] = $state([]);

  $effect(() => {
    if (open) {
      notes = get(notesStore);
      const unsub = notesStore.subscribe(v => {
        notes = v;
      });
      return unsub;
    }
  });

  const stats = $derived.by(() => {
    const now = new Date();

    const total = notes.length;

    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    weekStart.setHours(0, 0, 0, 0);
    const weekCount = notes.filter(n => new Date(n.timestamp) >= weekStart).length;

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthCount = notes.filter(n => new Date(n.timestamp) >= monthStart).length;

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayCount = notes.filter(n => new Date(n.timestamp) >= todayStart).length;

    const dailyMap = new Map<string, number>();
    notes.forEach(n => {
      const day = new Date(n.timestamp).toISOString().split('T')[0];
      dailyMap.set(day, (dailyMap.get(day) || 0) + 1);
    });

    let streak = 0;
    const d = new Date(now);
    while (true) {
      const day = d.toISOString().split('T')[0];
      if (dailyMap.has(day)) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }

    const tagCounts: Record<string, number> = {};
    notes.forEach(n => {
      n.tags?.forEach(t => {
        tagCounts[t] = (tagCounts[t] || 0) + 1;
      });
    });
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const pinnedCount = notes.filter(n => n.pinned).length;
    const snoozedCount = notes.filter(n => n.snoozedUntil && new Date(n.snoozedUntil) > now).length;

    const last7Days: { day: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayKey = date.toISOString().split('T')[0];
      const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
      last7Days.push({ day: dayLabel, count: dailyMap.get(dayKey) || 0 });
    }

    return { total, weekCount, monthCount, todayCount, streak, topTags, pinnedCount, snoozedCount, last7Days };
  });
</script>

<Dialog bind:open>
  <DialogContent class="sm:max-w-[400px]">
    <DialogHeader>
      <DialogTitle>Note Statistics</DialogTitle>
      <DialogDescription>Your capture activity overview.</DialogDescription>
    </DialogHeader>

    <div class="space-y-4">
      <div class="grid grid-cols-2 gap-3">
        <div class="rounded-lg border border-border p-3">
          <p class="text-2xl font-bold">{stats.total}</p>
          <p class="text-xs text-muted-foreground">Total notes</p>
        </div>
        <div class="rounded-lg border border-border p-3">
          <p class="text-2xl font-bold">{stats.todayCount}</p>
          <p class="text-xs text-muted-foreground">Today</p>
        </div>
        <div class="rounded-lg border border-border p-3">
          <p class="text-2xl font-bold">{stats.weekCount}</p>
          <p class="text-xs text-muted-foreground">This week</p>
        </div>
        <div class="rounded-lg border border-border p-3">
          <p class="text-2xl font-bold">{stats.monthCount}</p>
          <p class="text-xs text-muted-foreground">This month</p>
        </div>
      </div>

      <div class="rounded-lg border border-border p-3">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-2xl font-bold">{stats.streak} day{stats.streak !== 1 ? 's' : ''}</p>
            <p class="text-xs text-muted-foreground">Current streak</p>
          </div>
          <div>
            <p class="text-sm text-muted-foreground">{stats.pinnedCount} pinned</p>
            <p class="text-sm text-muted-foreground">{stats.snoozedCount} snoozed</p>
          </div>
        </div>
      </div>

      <div class="rounded-lg border border-border p-3">
        <p class="text-xs text-muted-foreground mb-2">Last 7 days</p>
        <div class="flex items-end justify-between gap-1 h-16">
          {#each stats.last7Days as day}
            {@const maxCount = Math.max(...stats.last7Days.map(d => d.count), 1)}
            {@const height = Math.max((day.count / maxCount) * 100, day.count > 0 ? 8 : 2)}
            <div class="flex flex-col items-center gap-1 flex-1">
              <div
                class="w-full rounded-sm bg-primary/60 transition-all"
                style="height: {height}%"
                title="{day.count} notes"
              ></div>
              <span class="text-[10px] text-muted-foreground">{day.day}</span>
            </div>
          {/each}
        </div>
      </div>

      {#if stats.topTags.length > 0}
        <div class="rounded-lg border border-border p-3">
          <p class="text-xs text-muted-foreground mb-2">Top tags</p>
          <div class="space-y-1.5">
            {#each stats.topTags as [tag, count]}
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium">#{tag}</span>
                <span class="text-xs text-muted-foreground">{count} note{count !== 1 ? 's' : ''}</span>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </DialogContent>
</Dialog>
