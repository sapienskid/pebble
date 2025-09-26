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
		// Verify authentication
		const authHeader = request.headers.get('authorization');
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			throw error(401, 'Missing or invalid authorization header');
		}
		const token = authHeader.slice(7);
		await verifyApiKey(token, kv, masterSecret);

		// Parse query params
		const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 100);
		const cursor = url.searchParams.get('cursor');

		// List history keys
		const options: any = { prefix: 'history:', limit };
		if (cursor) {
			options.cursor = cursor;
		}

		const list = await kv.list(options);
		const history: any[] = [];

		for (const key of list.keys) {
			const value = await kv.get(key.name);
			if (value) {
				history.push(JSON.parse(value));
			}
		}

		return json({
			history,
			cursor: (list as any).cursor || null,
			hasMore: !list.list_complete
		});
	} catch (err) {
		console.error('Error getting sync history:', err);
		throw error(500, 'Failed to get sync history');
	}
};