<script lang="ts">
  import { onMount } from 'svelte';
  import { remindersStore, type Reminder, deleteReminder } from '$lib/stores/reminders';
  import { Button } from "$lib/components/ui/button";
  import { Switch } from "$lib/components/ui/switch";
  import ReminderDialog from '$lib/components/dialogs/ReminderDialog.svelte';
  import DeleteWarningDialog from '$lib/components/dialogs/DeleteWarningDialog.svelte';
  import Header from '$lib/components/layout/Header.svelte';
  import TabNavigation from '$lib/components/layout/TabNavigation.svelte';
  import { format } from 'date-fns';
  import { Trash2, Plus } from '@lucide/svelte';

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
  <Header title="Remind" />

  <main class="overflow-y-auto p-4 pb-20">
    {#each reminders as rem}
      <div
        class="flex items-start p-4 mb-4 rounded-lg border shadow-sm"
        class:bg-card={!rem.notified}
        class:bg-green-50={rem.notified}
        class:dark:bg-green-900={rem.notified}
        class:border-green-200={rem.notified}
        class:dark:border-green-700={rem.notified}
      >
        <div class="flex-1">
          <div class="flex justify-between items-start">
            <div>
              <div class="font-medium">{rem.title}</div>
              <div class="text-sm text-muted-foreground">{rem.description}</div>
            </div>
            <div class="text-xs text-muted-foreground">
              {rem.scheduledFor
                ? `${format(new Date(rem.scheduledFor), 'EEE, d MMM, yyyy')} · ${format(
                    new Date(rem.scheduledFor),
                    'p',
                  )}`
                : ''}
            </div>
          </div>
          <div class="mt-3 flex items-center justify-between">
            <div class="text-xs text-muted-foreground">{rem.reminderType}</div>
            <div class="flex items-center">
              <Button variant="ghost" size="icon" class="mr-3" aria-label="Delete reminder" onclick={() => handleDelete(rem)}>
                <Trash2 class="w-4 h-4" />
              </Button>
              <Switch checked={rem.notified} ariaLabel="Toggle reminder notified" on:change={(e) => setNotified(rem.id, e.detail)} />
            </div>
          </div>
        </div>
      </div>
    {/each}
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
    class="fixed right-4 lg:right-[calc(50vw-13rem)] bottom-[calc(theme(spacing.20)+env(safe-area-inset-bottom,0px))] p-4 bg-primary rounded-full shadow-lg hover:bg-primary/90 z-[60] text-primary-foreground"
    aria-label="Add reminder"
    style="translate: 0 0;"
  >
    <Plus class="w-6 h-6" />
  </button>

  </div>
