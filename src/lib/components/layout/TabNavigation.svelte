<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Pen, Calendar, Bell } from "@lucide/svelte";
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
    <Pen
      class="w-6 h-6 hover:scale-110 transition-transform"
    />
  </Button>

  <Button variant={active === "plan" ? "default" : "outline"} size="icon" onclick={() => select("plan")} aria-label="Plan tab">
    <Calendar
      class="w-6 h-6 hover:scale-110 transition-transform"
    />
  </Button>

  <Button variant={active === "remind" ? "default" : "outline"} size="icon" onclick={() => select("remind")} aria-label="Remind tab">
    <Bell
      class="w-6 h-6 hover:scale-110 transition-transform"
    />
  </Button>
</nav>
