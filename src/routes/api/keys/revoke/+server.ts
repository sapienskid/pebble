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

		const keyName = `api_key:${keyId}`;
		const value = await kv.get(keyName);

		if (!value) {
			throw error(404, 'API key not found');
		}

		const record = JSON.parse(value);
		record.revoked = true;

		await kv.put(keyName, JSON.stringify(record));

		return json({ success: true });
	} catch (err) {
		console.error('Error revoking API key:', err);
		throw error(500, 'Failed to revoke API key');
	}
};