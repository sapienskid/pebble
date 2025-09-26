import { writable } from 'svelte/store';
import { db, type Settings } from '../db';

const defaultSettings: Settings = {
  id: 'settings',
  syncEnabled: false,
  apiKeys: [],
  autoSyncOnStart: false,
  notificationMethod: 'browser'
};

function createSettingsStore() {
  const { subscribe, set, update } = writable<Settings>(defaultSettings);

  // Initialize from IndexedDB
  async function initSettings() {
    try {
      const stored = await db.settings.get('settings');
      if (stored) {
        set(stored);
      } else {
        // Save defaults to DB
        await db.settings.put(defaultSettings);
      }
    } catch (error) {
      console.error('Failed to load settings from IndexedDB:', error);
    }
  }

  initSettings();

  return {
    subscribe,
    update: (updater: (settings: Settings) => Settings) => {
      update(settings => {
        const newSettings = updater(settings);
        // Save to IndexedDB
        db.settings.put(newSettings).catch(error => {
          console.error('Failed to save settings to IndexedDB:', error);
        });
        return newSettings;
      });
    },
    reset: () => {
      set(defaultSettings);
      db.settings.put(defaultSettings).catch(error => {
        console.error('Failed to reset settings in IndexedDB:', error);
      });
    }
  };
}

export const settingsStore = createSettingsStore();