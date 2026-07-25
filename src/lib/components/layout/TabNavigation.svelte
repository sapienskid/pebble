<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Plus } from "@lucide/svelte";
  import { noteDialogOpen } from "$lib/stores/ui";
  export let active: "capture" | "plan" = "capture";
  export let select: (tab: "capture" | "plan") => void;
</script>

<nav class="sticky bottom-0 mx-auto max-w-md bg-background border-t p-4 px-8 z-10 flex justify-center">
  <Button
    variant={active === "capture" ? "default" : "outline"}
    size="icon"
    aria-label="Capture tab"
    onclick={() => { select("capture"); noteDialogOpen.set(true); }}
  >
    <Plus
      class="w-6 h-6 hover:scale-110  transition-transform"
    />
  </Button>

  <!-- <Button variant={active === "plan" ? "default" : "outline"} size="icon" onclick={() => select("plan")} aria-label="Plan tab">
    <Calendar
      class="w-6 h-6 hover:scale-110 transition-transform"
    />
  </Button> -->
</nav>
