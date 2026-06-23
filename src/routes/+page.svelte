<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import CaptureTab from "$lib/components/tabs/CaptureTab.svelte";
	import Header from "$lib/components/layout/Header.svelte";
	import { settingsStore } from '$lib/stores/settings';
	import { syncUnsyncedItems } from '$lib/services/sync';
	import { Button } from '$lib/components/ui/button';
	import { Plus, BarChart3 } from '@lucide/svelte';
	import { noteDialogOpen, sharedText } from '$lib/stores/ui';
	import StatsDialog from '$lib/components/dialogs/StatsDialog.svelte';
	import { page } from '$app/stores';

	let statsOpen = $state(false);

	onMount(() => {
		const settings = get(settingsStore);
		if (settings.autoSyncOnStart) {
			syncUnsyncedItems();
		}

		const queryText = $page.url.searchParams.get('sharedText');
		if (queryText) {
			sharedText.set(decodeURIComponent(queryText));
			noteDialogOpen.set(true);
		}
	});
</script>

<div class="bg-muted/50 ">
	<!-- Full-width header background -->
	<div class="bg-background max-w-md mx-auto min-h-screen relative">
		<Header />
		<CaptureTab />

		<!-- Floating Action Button for creating a note -->
		<Button
			variant="default"
			size="icon"
			aria-label="Create note"
			class="fixed fab-abs-450 bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-20"
			onclick={() => noteDialogOpen.set(true)}
		>
			<Plus class="w-7 h-7" />
		</Button>

		<!-- Stats button -->
		<Button
			variant="outline"
			size="icon"
			aria-label="Note statistics"
			class="fixed fab-abs-450 bottom-6 right-24 h-10 w-10 rounded-full shadow-lg z-20 bg-background"
			onclick={() => statsOpen = true}
		>
			<BarChart3 class="w-5 h-5" />
		</Button>

		<StatsDialog bind:open={statsOpen} />
	</div>
</div>
