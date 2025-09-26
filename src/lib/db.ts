import Dexie, { type Table } from 'dexie';

// Theme interface
export interface ThemeRecord {
  id: string; // 'theme'
  value: 'light' | 'dark' | 'device';
}
export interface Settings {
  id: string; // probably just one record with id 'settings'
  syncEnabled: boolean;
  apiKeys: string[];
  autoSyncOnStart: boolean;
  notificationMethod: 'browser' | 'ntfy';
}

// Note interface
export interface Note {
  id: string;
  content: string; // max 500 characters
  timestamp: string;
  tags: string[];
  synced: boolean;
}

// Task interface
export interface Task {
  id: string;
  type: 'task';
  title: string;
  description?: string;
  date: string; // ISO date string, e.g., '2025-09-25'
  timeSlot: 'morning' | 'afternoon' | 'evening';
  scheduledTime?: string; // "9:30 AM"
  completed: boolean;
  synced: boolean;
}

// Reminder interface
export interface Reminder {
  id: string;
  timestamp: string; // ISO 8601
  synced: boolean;
  createdAt: string;
  updatedAt: string;
  type: 'reminder';
  title: string;
  description?: string;
  scheduledFor: string; // ISO 8601
  reminderType: 'one-time' | 'recurring';
  recurring?: 'daily' | 'weekly' | 'monthly';
  completed: boolean;
  notified: boolean;
}

class PebbleDB extends Dexie {
  notes!: Table<Note>;
  tasks!: Table<Task>;
  reminders!: Table<Reminder>;
  settings!: Table<Settings>;
  theme!: Table<ThemeRecord>;

  constructor() {
    super('PebbleDB');
    this.version(1).stores({
      notes: 'id, timestamp, synced, tags',
      tasks: 'id, timestamp, synced, type, timeSlot, completed',
      reminders: 'id, timestamp, synced, type, scheduledFor, reminderType',
      settings: 'id',
      theme: 'id'
    });
  }
}

export const db = new PebbleDB();