import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'info';

export type ToastAction = {
  label: string;
  onClick: () => void;
};

export type Toast = {
  id: string;
  type: ToastType;
  message: string;
  action?: ToastAction;
  duration?: number;
};

export const toasts = writable<Toast[]>([]);

let counter = 0;

export function addToast(toast: Omit<Toast, 'id'>) {
  const id = `toast-${++counter}`;
  const duration = toast.duration ?? 4000;
  const t: Toast = { ...toast, id };
  toasts.update((list) => [...list, t]);
  setTimeout(() => removeToast(id), duration);
}

export function removeToast(id: string) {
  toasts.update((list) => list.filter((t) => t.id !== id));
}
