import { writable } from 'svelte/store';
import { browser } from '$app/environment';

interface Settings {
  syncEnabled: boolean;
  apiKeys: string[];
  autoSyncOnStart: boolean;
  notificationMethod: 'browser' | 'ntfy';
}

const defaultSettings: Settings = {
  syncEnabled: false,
  apiKeys: [],
  autoSyncOnStart: false,
  notificationMethod: 'browser'
};

function createSettingsStore() {
  let initialSettings: Settings;
  if (browser) {
    try {
      const stored = localStorage.getItem('pebble-settings');
      initialSettings = stored ? JSON.parse(stored) : defaultSettings;
      // Ensure apiKeys is always an array
      if (!Array.isArray(initialSettings.apiKeys)) {
        initialSettings.apiKeys = [];
      }
    } catch (e) {
      initialSettings = defaultSettings;
    }
  } else {
    initialSettings = defaultSettings;
  }

  const { subscribe, set, update } = writable<Settings>(initialSettings);

  return {
    subscribe,
    update: (updater: (settings: Settings) => Settings) => {
      update(settings => {
        const newSettings = updater(settings);
        if (browser) {
          localStorage.setItem('pebble-settings', JSON.stringify(newSettings));
        }
        return newSettings;
      });
    },
    reset: () => {
      if (browser) {
        localStorage.setItem('pebble-settings', JSON.stringify(defaultSettings));
      }
      set(defaultSettings);
    }
  };
}

export const settingsStore = createSettingsStore();