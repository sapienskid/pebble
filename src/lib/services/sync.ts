import { get } from 'svelte/store';
import { db, type Settings } from '../db';
import { settingsStore } from '../stores/settings';

export async function syncUnsyncedItems() {
  const settings = get(settingsStore);

  if (!settings.syncEnabled) {
    return;
  }

  // Cast db to PebbleDB
  const pebbleDB = db as any;

  // Get unsynced notes
  const unsyncedNotes = await pebbleDB.notes.where('synced').equals(false).toArray();

  // Get unsynced tasks
  const unsyncedTasks = await pebbleDB.tasks.where('synced').equals(false).toArray();

  const items = [
    ...unsyncedNotes.map((note: any) => ({ type: 'note', data: note, markdown: note.content })),
    ...unsyncedTasks.map((task: any) => ({ type: 'task', data: task, markdown: formatTaskAsMarkdown(task) }))
  ];

  for (const item of items) {
    try {
      const response = await fetch('/api/sync/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: item.type,
          markdown: item.markdown,
          id: item.data.id,
          createdAt: item.data.timestamp
        })
      });

      if (response.ok) {
        // Mark as synced
        if (item.type === 'note') {
          await pebbleDB.notes.update(item.data.id, { synced: true });
        } else {
          await pebbleDB.tasks.update(item.data.id, { synced: true });
        }
      } else {
        console.error(`Failed to sync ${item.type}:`, response.statusText);
      }
    } catch (error) {
      console.error(`Error syncing ${item.type}:`, error);
    }
  }
}

function formatTaskAsMarkdown(task: any): string {
  const date = new Date(task.date).toLocaleDateString();
  const timeSlot = task.timeSlot;
  const scheduledTime = task.scheduledTime ? ` at ${task.scheduledTime}` : '';
  const status = task.completed ? '✅ Completed' : '⏳ Pending';

  let markdown = `- [${task.title}](${status}) - ${date} ${timeSlot}${scheduledTime}\n`;

  if (task.description) {
    markdown += `  ${task.description}\n`;
  }

  return markdown;
}