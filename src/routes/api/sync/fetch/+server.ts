import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'app://obsidian.md',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, CF-Access-Client-Id, CF-Access-Client-Secret',
};

export const OPTIONS: RequestHandler = async () => {
  return new Response(null, {
    headers: CORS_HEADERS
  });
};

export const GET: RequestHandler = async ({ platform, request, url }) => {
	if (!platform) {
		throw error(500, 'Platform not available');
	}

	const kv = platform.env.PEBBLE_SYNC_KV;
	const masterSecret = platform.env.MASTER_HMAC_SECRET;

	if (!kv || !masterSecret) {
		throw error(500, 'KV or master secret not configured');
	}

	try {
		// Fetch all sync items
		const list = await kv.list({ prefix: 'sync:' });
		const syncItems: any[] = [];

		for (const key of list.keys) {
			const value = await kv.get(key.name);
			if (value) {
				syncItems.push(JSON.parse(value));
			}
		}

		// Sort by syncedAt descending
		syncItems.sort((a, b) => new Date(b.syncedAt).getTime() - new Date(a.syncedAt).getTime());

		// Normalize note payloads to always include tags array
		const normalized = syncItems.map((item) => {
			if (item && item.type === 'note') {
				return { ...item, tags: Array.isArray(item.tags) ? item.tags : [] };
			}
			return item;
		});

		return json({ items: normalized }, { headers: CORS_HEADERS });
	} catch (err) {
		console.error('Error fetching sync items:', err);
		return json({ message: (err as any).message || 'Failed to fetch sync items' }, { status: 500, headers: CORS_HEADERS });
	}
};
