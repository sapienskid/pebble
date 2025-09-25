<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import Icon from "@iconify/svelte";
  export let active: "capture" | "plan" | "remind" = "capture";
  export let select: (tab: "capture" | "plan" | "remind") => void;
</script>

<nav class="sticky bottom-0 mx-auto max-w-md bg-background border-t p-4 px-8 z-10 flex justify-between">
  <Button
    variant={active === "capture" ? "default" : "outline"}
    size="icon"
    onclick={() => select("capture")}
    aria-label="Capture tab"
  >
    <Icon
      icon="streamline-freehand:edit-pencil"
      class="w-6 h-6 hover:scale-110 transition-transform"
    />
  </Button>

  <Button variant={active === "plan" ? "default" : "outline"} size="icon" onclick={() => select("plan")} aria-label="Plan tab">
    <Icon
      icon="streamline-freehand:calendar-date"
      class="w-6 h-6 hover:scale-110 transition-transform"
    />
  </Button>

  <Button variant={active === "remind" ? "default" : "outline"} size="icon" onclick={() => select("remind")} aria-label="Remind tab">
    <Icon
      icon="streamline-freehand:alert-alarm-bell"
      class="w-6 h-6 hover:scale-110 transition-transform"
    />
  </Button>
</nav>
