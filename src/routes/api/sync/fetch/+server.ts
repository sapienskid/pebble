import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyApiKey } from '$lib/auth';

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
		// Verify authentication token
		const authHeader = request.headers.get('authorization');
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return json({ message: 'Missing or invalid authorization header' }, { status: 401 });
		}
		const token = authHeader.slice(7);
		try {
			await verifyApiKey(token, kv, masterSecret);
		} catch (authErr) {
			return json({ message: 'Invalid API key' }, { status: 401 });
		}

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

		return json({ items: syncItems });
	} catch (err) {
		console.error('Error fetching sync items:', err);
		return json({ message: (err as any).message || 'Failed to fetch sync items' }, { status: 500 });
	}
};