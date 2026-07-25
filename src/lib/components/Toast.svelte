<script lang="ts">
  import { toasts, removeToast, type ToastType } from '$lib/stores/toast';
  import { CheckCircle, XCircle, Info, X } from '@lucide/svelte';

  const iconMap: Record<ToastType, typeof CheckCircle> = {
    success: CheckCircle,
    error: XCircle,
    info: Info,
  };

  const borderMap: Record<ToastType, string> = {
    success: 'border-green-500/50',
    error: 'border-red-500/50',
    info: 'border-blue-500/50',
  };

  const iconColorMap: Record<ToastType, string> = {
    success: 'text-green-500',
    error: 'text-red-500',
    info: 'text-blue-500',
  };
</script>

{#if $toasts.length > 0}
  <div class="fixed bottom-24 left-1/2 z-50 w-[calc(100%-1.5rem)] max-w-sm -translate-x-1/2 flex flex-col gap-2 pointer-events-none">
    {#each $toasts as toast (toast.id)}
      {@const Icon = iconMap[toast.type]}
      <div
        class="pointer-events-auto flex items-start gap-3 rounded-lg border bg-background/95 px-4 py-3 shadow-lg backdrop-blur transition-all {borderMap[toast.type]}"
        role="alert"
      >
        <Icon class="w-5 h-5 mt-0.5 shrink-0 {iconColorMap[toast.type]}" />
        <p class="flex-1 text-sm text-foreground">{toast.message}</p>
        {#if toast.action}
          <button
            type="button"
            class="text-sm font-semibold text-primary hover:text-primary/80 shrink-0"
            onclick={() => { toast.action!.onClick(); removeToast(toast.id); }}
          >
            {toast.action.label}
          </button>
        {/if}
        <button
          type="button"
          class="shrink-0 p-0.5 rounded hover:bg-muted transition-colors"
          onclick={() => removeToast(toast.id)}
          aria-label="Dismiss"
        >
          <X class="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    {/each}
  </div>
{/if}
