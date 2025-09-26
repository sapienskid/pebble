import { writable, get } from 'svelte/store';
// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
import { db, type Settings } from '../db';
import { requestNotificationPermission } from '../services/notification';

const defaultSettings: Settings = {
  id: 'settings',
  syncEnabled: false,
  apiKeys: [],
  autoSyncOnStart: false,
  notificationMethod: 'browser'
};

function createSettingsStore() {
  let currentValue = defaultSettings;
  const { subscribe, set, update } = writable<Settings>(defaultSettings);

  // Subscribe to keep currentValue in sync
  const unsubscribeInternal = subscribe(value => {
    currentValue = value;
  });

  // Initialize from IndexedDB (only in browser)
  async function initSettings() {
    if (!isBrowser) return;
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

  if (isBrowser) initSettings();

  return {
    subscribe,
    update: async (updater: (settings: Settings) => Settings) => {
      const currentSettings = currentValue;
      const newSettings = updater(currentSettings);

      // Handle notification method change
      if (newSettings.notificationMethod !== currentSettings.notificationMethod) {
        if (newSettings.notificationMethod === 'browser') {
          const granted = await requestNotificationPermission();
          if (!granted) {
            // Permission denied, fallback to ntfy
            newSettings.notificationMethod = 'ntfy';
            console.warn('Notification permission denied, falling back to ntfy');
          }
        }
      }

      // Save to IndexedDB (only in browser)
      if (isBrowser) {
        (db as any).settings.put(newSettings).catch((error: unknown) => {
          console.error('Failed to save settings to IndexedDB:', error);
        });
      }
      set(newSettings);
    },
    reset: () => {
      set(defaultSettings);
      if (isBrowser) {
        (db as any).settings.put(defaultSettings).catch((error: unknown) => {
          console.error('Failed to reset settings in IndexedDB:', error);
        });
      }
    }
  };
}

export const settingsStore = createSettingsStore();