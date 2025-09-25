<script lang="ts">
  import { onMount } from 'svelte';
  import { format, addDays } from 'date-fns';
  import { tasksStore, type Task } from '$lib/stores/tasks';
  import { Button } from "$lib/components/ui/button";
  import { Checkbox } from "$lib/components/ui/checkbox";
  import TaskDialog from '$lib/components/dialogs/TaskDialog.svelte';
  import Header from '$lib/components/layout/Header.svelte';
  import TabNavigation from '$lib/components/layout/TabNavigation.svelte';
  import Icon from '@iconify/svelte';
  import { formatTime12Hour } from '$lib/utils';

  let tasks: Task[] = [];
  let taskDialogOpen = false;

  $: today = format(new Date(), 'yyyy-MM-dd');
  $: tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');

  onMount(() => {
    const unsubscribe = tasksStore.subscribe((value) => (tasks = value));
    return () => unsubscribe();
  });

  function toggleComplete(id: string) {
    tasksStore.update((list) => list.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }

  function handleCardClick(id: string) {
    toggleComplete(id);
  }
</script>

<div class="grid grid-rows-[auto_1fr] h-full bg-background relative">
  <Header title="Plan" />

  <main class="overflow-y-auto p-4 pb-20">
    <!-- Today -->
    <section class="mb-6">
      <h2 class="text-lg font-semibold mb-4">Today</h2>
      {#each ['morning', 'afternoon', 'evening'] as slot}
        {@const slotTasks = tasks.filter(t => t.date === today && t.timeSlot === slot)}
        {#if slotTasks.length > 0}
          <h3 class="text-sm font-medium mb-3 text-muted-foreground capitalize">{slot}</h3>
          {#each slotTasks as task}
            <div 
              class="flex items-center p-3 mb-3 bg-card rounded-lg border cursor-pointer transition-all duration-200 hover:bg-accent hover:shadow-sm active:scale-95"
              on:click={() => handleCardClick(task.id)}
              role="button"
              tabindex="0"
              on:keydown={(e) => e.key === 'Enter' && handleCardClick(task.id)}
            >
              <Checkbox class="w-5 h-5 mr-3 pointer-events-none" checked={task.completed} aria-label="Toggle task completion" />
              <div class="flex-1">
                <div class="text-sm font-medium {task.completed ? 'line-through text-muted-foreground' : ''} transition-all duration-200">{task.title}</div>
                {#if task.description}
                  <div class="text-xs text-muted-foreground mt-1">{task.description}</div>
                {/if}
                <div class="text-xs text-muted-foreground">{formatTime12Hour(task.scheduledTime)}</div>
              </div>
              {#if task.completed}
                <Icon icon="streamline-freehand:check-bold" class="w-4 h-4 text-green-500 ml-2" />
              {/if}
            </div>
          {/each}
        {/if}
      {/each}
    </section>

    <!-- Tomorrow -->
    <section>
      <h2 class="text-lg font-semibold mb-4">Tomorrow</h2>
      {#each ['morning', 'afternoon', 'evening'] as slot}
        {@const slotTasks = tasks.filter(t => t.date === tomorrow && t.timeSlot === slot)}
        {#if slotTasks.length > 0}
          <h3 class="text-sm font-medium mb-3 text-muted-foreground capitalize">{slot}</h3>
          {#each slotTasks as task}
            <div 
              class="flex items-center p-3 mb-3 bg-card rounded-lg border cursor-pointer transition-all duration-200 hover:bg-accent hover:shadow-sm active:scale-95"
              on:click={() => handleCardClick(task.id)}
              role="button"
              tabindex="0"
              on:keydown={(e) => e.key === 'Enter' && handleCardClick(task.id)}
            >
              <Checkbox class="w-5 h-5 mr-3 pointer-events-none" checked={task.completed} aria-label="Toggle task completion" />
              <div class="flex-1">
                <div class="text-sm font-medium {task.completed ? 'line-through text-muted-foreground' : ''} transition-all duration-200">{task.title}</div>
                {#if task.description}
                  <div class="text-xs text-muted-foreground mt-1">{task.description}</div>
                {/if}
                <div class="text-xs text-muted-foreground">{formatTime12Hour(task.scheduledTime)}</div>
              </div>
              {#if task.completed}
                <Icon icon="streamline-freehand:check-bold" class="w-4 h-4 text-green-500 ml-2" />
              {/if}
            </div>
          {/each}
        {/if}
      {/each}
    </section>
  </main>

  <TaskDialog bind:open={taskDialogOpen} />
  <button
    type="button"
    on:click={() => (taskDialogOpen = true)}
    class="fixed right-4 lg:right-[calc(50vw-13rem)] bottom-[calc(theme(spacing.20)+env(safe-area-inset-bottom,0px))] p-4 bg-primary rounded-full shadow-lg hover:bg-primary/90 z-[60] text-primary-foreground"
    aria-label="Add task"
    style="translate: 0 0;"
  >
    <Icon icon="streamline-freehand:add-sign-bold" class="w-6 h-6" />
  </button>

</div>
