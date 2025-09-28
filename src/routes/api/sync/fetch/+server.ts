import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Add this OPTIONS handler for CORS preflight requests
export const OPTIONS: RequestHandler = async ({ request }) => {
	const origin = request.headers.get('Origin');
	
	console.log(`OPTIONS request received from origin: ${origin}`);
	
	const corsHeaders = {
		'Access-Control-Allow-Origin': origin || '*',
		'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, CF-Access-Client-Id, CF-Access-Client-Secret, Origin',
		'Access-Control-Max-Age': '86400'
	};
	
	return new Response(null, {
		status: 204,
		headers: corsHeaders
	});
};

export const GET: RequestHandler = async ({ platform, request, url }) => {
	// Add CORS headers to GET response too
	const origin = request.headers.get('Origin');
	const corsHeaders = {
		'Access-Control-Allow-Origin': origin || '*',
		'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, CF-Access-Client-Id, CF-Access-Client-Secret'
	};

	if (!platform) {
		return json({ message: 'Platform not available' }, { 
			status: 500,
			headers: corsHeaders 
		});
	}

	const kv = platform.env.PEBBLE_SYNC_KV;
	const masterSecret = platform.env.MASTER_HMAC_SECRET;

	if (!kv || !masterSecret) {
		return json({ message: 'KV or master secret not configured' }, { 
			status: 500,
			headers: corsHeaders 
		});
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

		return json({ items: normalized }, { headers: corsHeaders });
	} catch (err) {
		console.error('Error fetching sync items:', err);
		return json({ message: (err as any).message || 'Failed to fetch sync items' }, { 
			status: 500,
			headers: corsHeaders 
		});
	}
};