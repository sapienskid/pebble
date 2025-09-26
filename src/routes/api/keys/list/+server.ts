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
		let value = await kv.get('api_keys');
		let keysMap = value ? JSON.parse(value) : {};

		// Migration: if no keys in new format, check old format
		if (Object.keys(keysMap).length === 0) {
			const list = await kv.list({ prefix: 'api_key:' });
			for (const key of list.keys) {
				const oldValue = await kv.get(key.name);
				if (oldValue) {
					const record = JSON.parse(oldValue);
					keysMap[key.name.replace('api_key:', '')] = record;
				}
			}
			// Save in new format and clean up old keys
			if (Object.keys(keysMap).length > 0) {
				await kv.put('api_keys', JSON.stringify(keysMap));
				// Clean up old keys
				for (const key of list.keys) {
					await kv.delete(key.name);
				}
			}
		}

		const keys = Object.entries(keysMap).map(([keyId, record]: [string, any]) => ({
			keyId,
			name: record.name,
			createdAt: record.createdAt,
			lastUsedAt: record.lastUsedAt,
			revoked: record.revoked
		}));

		return json({ keys });
	} catch (err) {
		console.error('Error listing API keys:', err);
		throw error(500, 'Failed to list API keys');
	}
};