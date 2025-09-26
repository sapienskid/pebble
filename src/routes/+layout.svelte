<script lang="ts">
import "../app.css";
import { themeStore } from '$lib/stores/theme';
import { settingsStore } from '$lib/stores/settings';
import { checkDueReminders } from '$lib/services/notification';
import { syncUnsyncedItems } from '$lib/services/sync';
import { onMount } from 'svelte';

let { children } = $props();

let notificationInterval: number | null = null;

function startNotificationChecking() {
  if (notificationInterval) return; // Already running

  // Check every 30 seconds
  notificationInterval = setInterval(() => {
    checkDueReminders();
  }, 30000);

  // Check immediately on start
  checkDueReminders();
}

function stopNotificationChecking() {
  if (notificationInterval) {
    clearInterval(notificationInterval);
    notificationInterval = null;
  }
}

async function registerBackgroundSync() {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await (registration as any).sync.register('background-sync');
    } catch (error) {
      console.error('Background sync registration failed:', error);
    }
  }
}

onMount(() => {
  const unsubscribeTheme = themeStore.subscribe((theme) => {
    const html = document.documentElement;
    const isDark = theme === 'dark' || (theme === 'device' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    html.classList.toggle('dark', isDark);
  });

  const unsubscribeSettings = settingsStore.subscribe(async (settings) => {
    if (settings.notificationMethod === 'browser') {
      startNotificationChecking();
    } else {
      stopNotificationChecking();
    }

    if (settings.autoSyncOnStart && navigator.onLine) {
      await syncUnsyncedItems();
    }
  });

  // Register background sync
  registerBackgroundSync();

  return () => {
    unsubscribeTheme();
    unsubscribeSettings();
    stopNotificationChecking();
  };
});
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" />
	<!-- {@html webManifestLink} -->
</svelte:head>

{@render children?.()}
