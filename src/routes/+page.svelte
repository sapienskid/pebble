<script lang="ts">
	import CaptureTab from "$lib/components/tabs/CaptureTab.svelte";
	import PlanTab from "$lib/components/tabs/PlanTab.svelte";
	import RemindTab from "$lib/components/tabs/RemindTab.svelte";
	import TabNavigation from "$lib/components/layout/TabNavigation.svelte";
	import Header from "$lib/components/layout/Header.svelte";

	let active: "capture" | "plan" | "remind" = $state("capture");

	function select(tab: "capture" | "plan" | "remind") {
		active = tab;
	}
</script>

<div class="bg-muted/50 ">
	<!-- Full-width header background -->
	<div class="bg-background max-w-md mx-auto min-h-screen">
		<Header />
		{#if active === "capture"}
			<CaptureTab />
		{:else if active === "plan"}
			<PlanTab />
		{:else}
			<RemindTab />
		{/if}
	</div>
	<TabNavigation {active} {select} />
</div>
