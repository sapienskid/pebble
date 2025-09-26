<script lang="ts">
import "../app.css";
import favicon from '$lib/assets/favicon.svg';
import { themeStore } from '$lib/stores/theme';
import { settingsStore } from '$lib/stores/settings';
import { checkDueReminders } from '$lib/services/notification';
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

onMount(() => {
  const unsubscribeTheme = themeStore.subscribe((theme) => {
    const html = document.documentElement;
    const isDark = theme === 'dark' || (theme === 'device' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    html.classList.toggle('dark', isDark);
  });

  const unsubscribeSettings = settingsStore.subscribe((settings) => {
    if (settings.notificationMethod === 'browser') {
      startNotificationChecking();
    } else {
      stopNotificationChecking();
    }
  });

  return () => {
    unsubscribeTheme();
    unsubscribeSettings();
    stopNotificationChecking();
  };
});
</script>

<svelte:head>
	<link rel="icon" href="{favicon}" />
	<!-- {@html webManifestLink} -->
</svelte:head>

{@render children?.()}
