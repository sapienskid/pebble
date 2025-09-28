import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// CORS is now handled globally in hooks.server.ts

export const POST: RequestHandler = async ({ platform, request }) => {
	if (!platform) {
		throw error(500, 'Platform not available');
	}

	const { PEBBLE_SYNC_KV: kv } = platform.env;
	const apiKey = (platform.env as any).API_KEY;

	if (!kv) {
		throw error(500, 'KV not configured');
	}

	// Check API key authentication
	const providedKey = request.headers.get('X-API-Key') || request.headers.get('Authorization')?.replace('Bearer ', '');
	
	if (!providedKey) {
		throw error(401, 'API key required');
	}
	
	if (providedKey !== apiKey) {
		throw error(401, 'Invalid API key');
	}

	try {
		// Parse request body
		const body: { type: string; markdown: string; id?: string; createdAt?: string; tags?: string[] } = await request.json();

		if (!body.type || !body.markdown) {
			throw error(400, 'type and markdown are required');
		}

		if (!['note', 'task'].includes(body.type)) {
			throw error(400, 'type must be note or task');
		}

		// Generate sync ID
		const syncId = crypto.randomUUID();
		const timestamp = new Date().toISOString();

    // Store in KV with TTL (default 7 days); allow client to request 7/15/30
    const allowedDays = new Set([7, 15, 30]);
    const requestedDays = (body as any).ttlDays;
    const ttlDays = allowedDays.has(requestedDays) ? requestedDays : 7;
    const ttl = ttlDays * 24 * 60 * 60; // seconds
    const syncKey = `sync:${body.type}:${timestamp}:${syncId}`;

		const syncData = {
			type: body.type,
			markdown: body.markdown,
			id: body.id || null,
			createdAt: body.createdAt || timestamp,
			syncedAt: timestamp,
			// Ensure tags is always an array for notes; tasks can ignore
			tags: body.type === 'note' ? (Array.isArray(body.tags) ? body.tags : []) : undefined
		};

		await kv.put(syncKey, JSON.stringify(syncData), { expirationTtl: ttl });

	// CORS headers are handled in hooks.server.ts
	return json({ success: true, syncId });
	} catch (err) {
	console.error('Error pushing sync item:', err);
	// CORS headers are handled in hooks.server.ts
	return json({ message: 'Failed to push sync item' }, { status: 500 });
	}
};