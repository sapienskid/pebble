<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import CaptureTab from "$lib/components/tabs/CaptureTab.svelte";
	import Header from "$lib/components/layout/Header.svelte";
	import { settingsStore } from '$lib/stores/settings';
	import { syncUnsyncedItems } from '$lib/services/sync';
	import { Button } from '$lib/components/ui/button';
	import { Plus } from '@lucide/svelte';
	import { noteDialogOpen } from '$lib/stores/ui';

	onMount(() => {
		const settings = get(settingsStore);
		if (settings.autoSyncOnStart) {
			syncUnsyncedItems();
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
	</div>
</div>
