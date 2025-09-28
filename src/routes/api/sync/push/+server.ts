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

		return json({ success: true, syncId }, { headers: CORS_HEADERS });
	} catch (err) {
		console.error('Error pushing sync item:', err);
		throw error(500, 'Failed to push sync item');
	}
};
