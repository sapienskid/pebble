import { writable } from 'svelte/store';
import { browser } from '$app/environment';

type Theme = 'light' | 'dark' | 'device';

function createThemeStore() {
  const defaultTheme: Theme = 'device';
  const initialTheme = browser ? (localStorage.getItem('pebble-theme') as Theme) || defaultTheme : defaultTheme;

  const { subscribe, set, update } = writable<Theme>(initialTheme);

  return {
    subscribe,
    set: (theme: Theme) => {
      if (browser) {
        localStorage.setItem('pebble-theme', theme);
        updateDocumentTheme(theme);
      }
      set(theme);
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