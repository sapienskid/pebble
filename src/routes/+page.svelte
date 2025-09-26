<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import CaptureTab from "$lib/components/tabs/CaptureTab.svelte";
	import TabNavigation from "$lib/components/layout/TabNavigation.svelte";
	import Header from "$lib/components/layout/Header.svelte";
	import { settingsStore } from '$lib/stores/settings';
	import { syncUnsyncedItems } from '$lib/services/sync';

	let active: "capture" | "plan" | "remind" = $state("capture");

	function select(tab: "capture" | "plan" | "remind") {
		active = tab;
	}


	onMount(() => {
		const settings = get(settingsStore);
		if (settings.autoSyncOnStart) {
			syncUnsyncedItems();
		}
	});
</script>

<div class="bg-muted/50 ">
	<!-- Full-width header background -->
	<div class="bg-background max-w-md mx-auto min-h-screen">
		<Header />
		{#if active === "capture"}
			<CaptureTab />
		{/if}
	</div>
	<TabNavigation {active} {select} />
</div>
