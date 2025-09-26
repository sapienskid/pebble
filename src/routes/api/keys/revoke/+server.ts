import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ platform, request }) => {
	if (!platform) {
		throw error(500, 'Platform not available');
	}

	const kv = platform.env.PEBBLE_SYNC_KV;

	if (!kv) {
		throw error(500, 'KV not configured');
	}

	try {
		const body: { keyId: string } = await request.json();

		if (!body.keyId) {
			throw error(400, 'keyId is required');
		}

		const keyId = body.keyId;

		// Get existing keys
		const existingKeys = await kv.get('api_keys');
		const keysMap = existingKeys ? JSON.parse(existingKeys) : {};

		if (!keysMap[keyId]) {
			throw error(404, 'API key not found');
		}

		keysMap[keyId].revoked = true;

		await kv.put('api_keys', JSON.stringify(keysMap));

		return json({ success: true });
	} catch (err) {
		console.error('Error revoking API key:', err);
		throw error(500, 'Failed to revoke API key');
	}
};