import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ platform }) => {
	if (!platform) {
		throw error(500, 'Platform not available');
	}

	const kv = platform.env.PEBBLE_SYNC_KV;

	if (!kv) {
		throw error(500, 'KV not configured');
	}

	try {
		const keys: any[] = [];
		const list = await kv.list({ prefix: 'api_key:' });

		for (const key of list.keys) {
			const value = await kv.get(key.name);
			if (value) {
				const record = JSON.parse(value);
				keys.push({
					keyId: key.name.replace('api_key:', ''),
					name: record.name,
					createdAt: record.createdAt,
					lastUsedAt: record.lastUsedAt,
					revoked: record.revoked
				});
			}
		}

		return json({ keys });
	} catch (err) {
		console.error('Error listing API keys:', err);
		throw error(500, 'Failed to list API keys');
	}
};