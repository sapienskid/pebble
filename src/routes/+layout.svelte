<script>
import "../app.css";
import favicon from '$lib/assets/favicon.svg';
import { themeStore } from '$lib/stores/theme';
import { onMount } from 'svelte';

let { children } = $props();

onMount(() => {
  const unsubscribe = themeStore.subscribe((theme) => {
    const html = document.documentElement;
    const isDark = theme === 'dark' || (theme === 'device' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    html.classList.toggle('dark', isDark);
  });
  return unsubscribe;
});
</script>

<svelte:head>
	<link rel="icon" href="{favicon}" />
	<!-- {@html webManifestLink} -->
</svelte:head>

{@render children?.()}
