<script lang="ts">
  import { onMount } from 'svelte';
  import { remindersStore, type Reminder, deleteReminder } from '$lib/stores/reminders';
  import { Button } from "$lib/components/ui/button";
  import { Switch } from "$lib/components/ui/switch";
  import ReminderDialog from '$lib/components/dialogs/ReminderDialog.svelte';
  import DeleteWarningDialog from '$lib/components/dialogs/DeleteWarningDialog.svelte';
  import { format } from 'date-fns';
  import { Trash2, Plus, Bell } from '@lucide/svelte';

  let reminders: Reminder[] = [];
  let reminderDialogOpen = false;
  let deleteDialogOpen = false;
  let reminderToDelete: Reminder | null = null;

  onMount(() => {
    const unsubscribe = remindersStore.subscribe((value) => (reminders = value));
    return () => unsubscribe();
  });

  // Set notified state for a reminder. If `value` is undefined, toggle the current value.
  function setNotified(id: string, value?: boolean) {
    remindersStore.update((list) =>
      list.map((r) => {
        if (r.id !== id) return r;
        const newVal = typeof value === 'boolean' ? value : !r.notified;
        return { ...r, notified: newVal };
      }),
    );
  }

  function handleDelete(reminder: Reminder) {
    reminderToDelete = reminder;
    deleteDialogOpen = true;
  }

  function confirmDelete() {
    if (reminderToDelete) {
      deleteReminder(reminderToDelete.id);
      deleteDialogOpen = false;
      reminderToDelete = null;
    }
  }
</script>

<div class="grid grid-rows-[auto_1fr] h-full bg-background relative">

  <main class="overflow-y-auto p-4 pb-20">
    {#if reminders.length === 0}
      <div class="flex flex-col items-center justify-center h-full text-center p-8">
        <Bell class="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h3 class="text-lg font-semibold text-foreground mb-2">No reminders set</h3>
        <p class="text-sm text-muted-foreground mb-6">Set your first reminder to stay on track and never miss important moments.</p>
      </div>
    {:else}
      {#each reminders as rem}
        <div class="group flex items-start p-6 bg-card rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/20 {rem.notified ? 'border-green-200 dark:border-green-700 bg-green-50/50 dark:bg-green-900/20' : ''}">
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-start mb-2">
              <div class="flex-1">
                <h3 class="text-base font-medium text-foreground leading-relaxed mb-1">{rem.title}</h3>
                {#if rem.description}
                  <p class="text-sm text-muted-foreground leading-relaxed">{rem.description}</p>
                {/if}
              </div>
              {#if rem.notified}
                <div class="ml-3 flex items-center text-green-600 dark:text-green-400">
                  <Bell class="w-4 h-4" />
                </div>
              {/if}
            </div>
            <div class="flex justify-between items-center">
              <div class="text-xs text-muted-foreground/70 font-medium">
                {rem.scheduledFor
                  ? `${format(new Date(rem.scheduledFor), 'EEE, d MMM, yyyy')} · ${format(
                      new Date(rem.scheduledFor),
                      'p',
                    )}`
                  : ''}
                {#if rem.reminderType === 'recurring'}
                  <span class="ml-2 px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">
                    {rem.recurring}
                  </span>
                {/if}
              </div>
              <div class="flex items-center gap-2">
                <Button variant="ghost" size="icon" class="h-8 w-8 text-muted-foreground hover:text-destructive" aria-label="Delete reminder" onclick={() => handleDelete(rem)}>
                  <Trash2 class="w-4 h-4" />
                </Button>
                <Switch checked={rem.notified} ariaLabel="Toggle reminder notified" on:change={(e) => setNotified(rem.id, e.detail)} />
              </div>
            </div>
          </div>
        </div>
      {/each}
    {/if}
  </main>

  <ReminderDialog bind:open={reminderDialogOpen} />
  <DeleteWarningDialog
    open={deleteDialogOpen}
    onOpenChange={(open) => (deleteDialogOpen = open)}
    onConfirm={confirmDelete}
    title={reminderToDelete?.title || ''}
  />
  <button
    type="button"
    on:click={() => (reminderDialogOpen = true)}
    class="fixed right-4 sm:right-[calc(50vw-15rem)] lg:right-[calc(50vw-13rem)] bottom-[calc(theme(spacing.20)+env(safe-area-inset-bottom,0px))] p-4 bg-primary rounded-full shadow-lg hover:bg-primary/90 z-[60] text-primary-foreground"
    aria-label="Add reminder"
    style="translate: 0 0;"
  >
    <Plus class="w-4 h-6" />
  </button>

  </div>
