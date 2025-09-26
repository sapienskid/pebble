import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { db } from '../db';

export type BaseItem = {
  id: string;
  timestamp: string; // ISO 8601
  synced: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Reminder = BaseItem & {
  type: 'reminder';
  title: string;
  description?: string;
  scheduledFor: string; // ISO 8601
  reminderType: 'one-time' | 'recurring';
  recurring?: 'daily' | 'weekly' | 'monthly';
  completed: boolean;
  notified: boolean;
};

export const remindersStore = writable<Reminder[]>([]);

// Initialize store from IndexedDB
async function initRemindersStore() {
  try {
    if (browser) {
      const reminders = await (db as any).reminders.toArray();
      remindersStore.set(reminders);
    }
  } catch (error) {
    console.error('Failed to load reminders from IndexedDB:', error);
  }
}

// Subscribe to store changes and save to IndexedDB
remindersStore.subscribe(async (reminders) => {
  if (!browser) return;
  if (reminders.length > 0) {
    try {
      await (db as any).reminders.clear();
      await (db as any).reminders.bulkAdd(reminders);
    } catch (error) {
      console.error('Failed to save reminders to IndexedDB:', error);
    }
  }
});

// Initialize on module load
initRemindersStore();

export function deleteReminder(id: string) {
  remindersStore.update((reminders) => reminders.filter((r) => r.id !== id));
}