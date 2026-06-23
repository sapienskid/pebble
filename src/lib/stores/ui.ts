import { writable } from 'svelte/store';

export const noteDialogOpen = writable<boolean>(false);
export const sharedText = writable<string>('');
