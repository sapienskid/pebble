// Disables access to DOM typings like `HTMLElement` which are not available
// inside a service worker and instantiates the correct globals
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

// Ensures that the `$service-worker` import has proper type definitions
/// <reference types="@sveltejs/kit" />

import { build, files, version } from '$service-worker';
import { db } from '$lib/db';

// This gives `self` the correct types
const self = globalThis.self;

// Create a unique cache name for this deployment
const CACHE = `pebble-${version}`;

const ASSETS = [
	...build, // the app itself
	...files  // everything in `static`
];

self.addEventListener('install', (event) => {
	// Create a new cache and add all files to it
	async function addFilesToCache() {
		const cache = await caches.open(CACHE);
		await cache.addAll(ASSETS);
	}

	event.waitUntil(addFilesToCache());
});

self.addEventListener('activate', (event) => {
	// Remove previous cached data from disk
	async function deleteOldCaches() {
		for (const key of await caches.keys()) {
			if (key !== CACHE) await caches.delete(key);
		}
	}

	event.waitUntil(deleteOldCaches());
});

self.addEventListener('fetch', (event) => {
	// ignore POST requests etc
	if (event.request.method !== 'GET') return;

	async function respond() {
		const url = new URL(event.request.url);
		const cache = await caches.open(CACHE);

		// `build`/`files` can always be served from the cache
		if (ASSETS.includes(url.pathname)) {
			const response = await cache.match(url.pathname);

			if (response) {
				return response;
			}
		}

		// for everything else, try the network first, but
		// fall back to the cache if we're offline
		try {
			const fetchOptions = url.origin === self.location.origin ? { credentials: 'include' } : {};
			const response = await fetch(event.request, fetchOptions);
			// if we're offline, fetch can return a value that is not a Response
			// instead of throwing - and we can't pass this non-Response to respondWith
			if (!(response instanceof Response)) {
				throw new Error('invalid response from fetch');
			}

			if (response.status === 200) {
				cache.put(event.request, response.clone());
			}

			return response;
		} catch (err) {
			const response = await cache.match(event.request);

			if (response) {
				return response;
			}

			// if there's no cache, then just error out
			// as there is nothing we can do to respond to this request
			throw err;
		}
	}

	event.respondWith(respond());
});

// Background sync for unsynced data
self.addEventListener('sync', (event) => {
	if (event.tag === 'background-sync') {
		event.waitUntil(syncUnsyncedData());
	}
});

async function syncUnsyncedData() {
	// Query IndexedDB for unsynced items
	const unsyncedNotes = await db.notes.where('synced').equals(false).toArray();
	const unsyncedTasks = await db.tasks.where('synced').equals(false).toArray();

	// Get settings
	const settings = await db.settings.get('settings');
	if (!settings || !settings.syncEnabled || !settings.syncToken) {
		return;
	}

	const token = settings.syncToken;

	const items = [
		...unsyncedNotes.map((note) => ({ type: 'note', data: note, markdown: note.content })),
		...unsyncedTasks.map((task) => ({ type: 'task', data: task, markdown: formatTaskAsMarkdown(task) }))
	];

	for (const item of items) {
		try {
			const response = await fetch('/api/sync/push', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					type: item.type,
					markdown: item.markdown,
					id: item.data.id,
					createdAt: item.data.timestamp
				})
			});

			if (response.ok) {
				// Mark as synced
				if (item.type === 'note') {
					await db.notes.update(item.data.id, { synced: true });
				} else {
					await db.tasks.update(item.data.id, { synced: true });
				}
			} else {
				console.error(`Failed to sync ${item.type}:`, response.statusText);
			}
		} catch (error) {
			console.error(`Error syncing ${item.type}:`, error);
		}
	}

	console.log(`Synced ${unsyncedNotes.length} notes, ${unsyncedTasks.length} tasks`);
}

function formatTaskAsMarkdown(task) {
	const date = new Date(task.date).toLocaleDateString();
	const timeSlot = task.timeSlot;
	const scheduledTime = task.scheduledTime ? ` at ${task.scheduledTime}` : '';
	const status = task.completed ? '✅ Completed' : '⏳ Pending';

	let markdown = `- [${task.title}](${status}) - ${date} ${timeSlot}${scheduledTime}\n`;

	if (task.description) {
		markdown += `  ${task.description}\n`;
	}

	return markdown;
}