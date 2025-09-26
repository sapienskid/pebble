import { writable } from 'svelte/store';
import { db } from '../db';

export type Task = {
  id: string;
  type: 'task';
  title: string;
  description?: string;
  date: string; // ISO date string, e.g., '2025-09-25'
  timeSlot: 'morning' | 'afternoon' | 'evening';
  scheduledTime?: string;
  completed: boolean;
  synced: boolean;
};

export const tasksStore = writable<Task[]>([]);

// Initialize store from IndexedDB
async function initTasksStore() {
  try {
    const tasks = await db.tasks.toArray();
    tasksStore.set(tasks);
  } catch (error) {
    console.error('Failed to load tasks from IndexedDB:', error);
  }
}

// Subscribe to store changes and save to IndexedDB
tasksStore.subscribe(async (tasks) => {
  if (tasks.length > 0) {
    try {
      await db.tasks.clear();
      await db.tasks.bulkAdd(tasks);
    } catch (error) {
      console.error('Failed to save tasks to IndexedDB:', error);
    }
  }
});

// Initialize on module load
initTasksStore();