import { writable } from 'svelte/store';

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

export const remindersStore = writable<Reminder[]>([
  { id: 'r1', type: 'reminder', title: 'Bookstore Visit', description: 'New Fiction Release', scheduledFor: '2025-09-28T15:00:00.000Z', reminderType: 'one-time', completed: false, notified: false, timestamp: '2025-09-25T10:00:00.000Z', synced: false, createdAt: '2025-09-25T10:00:00.000Z', updatedAt: '2025-09-25T10:00:00.000Z' },
  { id: 'r2', type: 'reminder', title: 'Pet Supplies', description: 'Purchase dog food, cat litter, and toys', scheduledFor: '2025-09-25T14:30:00.000Z', reminderType: 'one-time', completed: false, notified: true, timestamp: '2025-09-24T09:00:00.000Z', synced: false, createdAt: '2025-09-24T09:00:00.000Z', updatedAt: '2025-09-24T09:00:00.000Z' },
  { id: 'r3', type: 'reminder', title: 'Grocery Shopping', description: 'Buy milk, eggs, bread, and cheese', scheduledFor: '2025-09-26T11:30:00.000Z', reminderType: 'one-time', completed: false, notified: false, timestamp: '2025-09-23T08:00:00.000Z', synced: false, createdAt: '2025-09-23T08:00:00.000Z', updatedAt: '2025-09-23T08:00:00.000Z' }
]);

export function deleteReminder(id: string) {
  remindersStore.update((reminders) => reminders.filter((r) => r.id !== id));
}