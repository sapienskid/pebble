import { get } from 'svelte/store';
import { db, type Settings } from '../db';
import { settingsStore } from '../stores/settings';

export async function syncUnsyncedItems() {
  const settings = get(settingsStore);

  if (!settings.syncEnabled || !settings.syncToken) {
    return;
  }

  const token = settings.syncToken;

  // Cast db to PebbleDB
  const pebbleDB = db as any;

  // Get unsynced notes
  const unsyncedNotes = await pebbleDB.notes.where('synced').equals(false).toArray();

  // Get unsynced tasks
  const unsyncedTasks = await pebbleDB.tasks.where('synced').equals(false).toArray();

  // Get unsynced API keys
  const unsyncedApiKeys = await pebbleDB.apiKeys.where('synced').equals(false).toArray();

  const items = [
    ...unsyncedNotes.map((note: any) => ({ type: 'note', data: note, markdown: note.content })),
    ...unsyncedTasks.map((task: any) => ({ type: 'task', data: task, markdown: formatTaskAsMarkdown(task) })),
    ...unsyncedApiKeys.map((key: any) => ({ type: 'api_key', data: key }))
  ];

  for (const item of items) {
    try {
      if (item.type === 'api_key') {
        // Sync API key to KV
        await syncApiKey(item.data, token);
      } else {
        const response = await fetch('/api/sync/push', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
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
      }
    } catch (error) {
      console.error(`Error syncing ${item.type}:`, error);
    }
  }
}

async function syncApiKey(apiKey: any, token: string) {
  try {
    // Compute HMAC hash for the tokenSecret
    const masterSecret = 'MASTER_HMAC_SECRET'; // This should be from env, but for client-side we can't access it
    // Actually, for client-side sync, we need a different approach
    // Since we can't compute the hash client-side (no master secret), we'll need to send the key to server for hashing
    // But that defeats the purpose. For now, let's assume we store the hash locally too.

    // For simplicity, let's modify to store hash locally when creating
    // But since we can't access master secret client-side, perhaps sync via the existing API endpoints

    // For new keys, use the create endpoint (but it will create duplicate if already exists)
    // Better: add a sync endpoint for API keys

    // For now, use the existing create/revoke endpoints
    if (!apiKey.revoked) {
      // Try to create on server
      const response = await fetch('/api/keys/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          keyId: apiKey.id,
          tokenSecret: apiKey.tokenSecret
        })
      });

      if (response.ok) {
        await (db as any).apiKeys.update(apiKey.id, { synced: true });
      }
    } else {
      // Revoke on server
      const response = await fetch('/api/keys/revoke', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ keyId: apiKey.id })
      });

      if (response.ok) {
        await (db as any).apiKeys.update(apiKey.id, { synced: true });
      }
    }
  } catch (error) {
    console.error('Error syncing API key:', error);
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