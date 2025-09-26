import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ platform, request }) => {
	if (!platform) {
		throw error(500, 'Platform not available');
	}

	const kv = platform.env.PEBBLE_SYNC_KV;
	const masterSecret = platform.env.MASTER_HMAC_SECRET;

	if (!kv || !masterSecret) {
		throw error(500, 'KV or master secret not configured');
	}

	try {
		// Parse request body
		const body: { type: string; markdown: string; id?: string; createdAt?: string } = await request.json();

		if (!body.type || !body.markdown) {
			throw error(400, 'type and markdown are required');
		}

		if (!['note', 'task'].includes(body.type)) {
			throw error(400, 'type must be note or task');
		}

		// Generate sync ID
		const syncId = crypto.randomUUID();
		const timestamp = new Date().toISOString();

		// Store in KV with TTL (default 7 days)
		const ttl = 7 * 24 * 60 * 60; // 7 days in seconds
		const syncKey = `sync:${body.type}:${timestamp}:${syncId}`;

		const syncData = {
			type: body.type,
			markdown: body.markdown,
			id: body.id || null,
			createdAt: body.createdAt || timestamp,
			syncedAt: timestamp
		};

		await kv.put(syncKey, JSON.stringify(syncData), { expirationTtl: ttl });

		// Create history entry
		const historyKey = `history:${timestamp}:${syncId}`;
		const historyData = {
			eventId: syncId,
			itemId: syncId,
			eventType: 'sync-success',
			timestamp,
			type: body.type,
			markdown: body.markdown.slice(0, 100) + (body.markdown.length > 100 ? '...' : '') // truncated for history
		};

		await kv.put(historyKey, JSON.stringify(historyData), { expirationTtl: ttl });

		return json({ success: true, syncId });
	} catch (err) {
		console.error('Error pushing sync item:', err);
		throw error(500, 'Failed to push sync item');
	}
};