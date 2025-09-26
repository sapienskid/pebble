import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { db, type ThemeRecord } from '../db';

type Theme = 'light' | 'dark' | 'device';

function createThemeStore() {
  const defaultTheme: Theme = 'device';
  const { subscribe, set, update } = writable<Theme>(defaultTheme);

  // Initialize from IndexedDB
  async function initTheme() {
    if (!browser) return;
    try {
      const stored = await db.theme.get('theme');
      if (stored) {
        set(stored.value);
      } else {
        // Save default to DB
        await db.theme.put({ id: 'theme', value: defaultTheme });
      }
    } catch (error) {
      console.error('Failed to load theme from IndexedDB:', error);
    }
  }

  initTheme();

  return {
    subscribe,
    set: async (theme: Theme) => {
      set(theme);
      updateDocumentTheme(theme);
      if (browser) {
        try {
          await db.theme.put({ id: 'theme', value: theme });
        } catch (error) {
          console.error('Failed to save theme to IndexedDB:', error);
        }
      }
    }
  };
}

function updateDocumentTheme(theme: Theme) {
  if (!browser) return;

  const root = document.documentElement;
  const isDark = theme === 'dark' || (theme === 'device' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  root.classList.toggle('dark', isDark);
}

export const themeStore = createThemeStore();

// Initialize theme on load
if (browser) {
  themeStore.subscribe(updateDocumentTheme);
}