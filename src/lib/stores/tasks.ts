import { writable } from 'svelte/store';

export type Task = {
  id: string;
  type: 'task';
  title: string;
  description?: string;
  date: string; // ISO date string, e.g., '2025-09-25'
  timeSlot: 'morning' | 'afternoon' | 'evening';
  scheduledTime?: string;
  completed: boolean;
  googleTaskId?: string;
};

export const tasksStore = writable<Task[]>([
  { id: 't1', type: 'task', title: 'Review Project Proposal', date: '2025-09-25', timeSlot: 'morning', scheduledTime: '10:30 AM', completed: false },
  { id: 't2', type: 'task', title: 'Review Project Proposal', date: '2025-09-25', timeSlot: 'morning', scheduledTime: '10:30 AM', completed: true },
  { id: 't3', type: 'task', title: 'Review Project Proposal', date: '2025-09-26', timeSlot: 'afternoon', scheduledTime: '2:00 PM', completed: false },
  { id: 't4', type: 'task', title: 'Review Project Proposal', date: '2025-09-25', timeSlot: 'evening', scheduledTime: '7:00 PM', completed: false }
]);