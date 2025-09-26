import { writable } from 'svelte/store';
import { browser } from '$app/environment';
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

  // Initialize from IndexedDB (only in browser)
  async function initSettings() {
    if (!browser) return;
    try {
      const stored = await (db as any).settings.get('settings');
      if (stored) {
        set(stored);
      } else {
        // Save defaults to DB
        await (db as any).settings.put(defaultSettings);
      }
    } catch (error) {
      console.error('Failed to load settings from IndexedDB:', error);
    }
  }

  if (browser) initSettings();

  return {
    subscribe,
    update: (updater: (settings: Settings) => Settings) => {
      update(settings => {
        const newSettings = updater(settings);
        // Save to IndexedDB (only in browser)
        if (browser) {
          (db as any).settings.put(newSettings).catch((error: unknown) => {
            console.error('Failed to save settings to IndexedDB:', error);
          });
        }
        return newSettings;
      });
    },
    reset: () => {
      set(defaultSettings);
      if (browser) {
        (db as any).settings.put(defaultSettings).catch((error: unknown) => {
          console.error('Failed to reset settings in IndexedDB:', error);
        });
      }
    }
  };
}

export const settingsStore = createSettingsStore();