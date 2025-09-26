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
		const body = await request.json().catch(() => ({})) as { keyId?: string; tokenSecret?: string };
		let keyId: string;
		let tokenSecret: string;

		if (body.keyId && body.tokenSecret) {
			// Syncing pre-generated key
			keyId = body.keyId;
			tokenSecret = body.tokenSecret;
		} else {
			// Generate new key
			keyId = crypto.randomUUID();
			tokenSecret = crypto.randomUUID();
		}

		// Compute HMAC hash using Web Crypto API
		const encoder = new TextEncoder();
		const key = await crypto.subtle.importKey(
			'raw',
			encoder.encode(masterSecret),
			{ name: 'HMAC', hash: 'SHA-256' },
			false,
			['sign']
		);
		const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(tokenSecret));
		const keyHash = Array.from(new Uint8Array(signature))
			.map(b => b.toString(16).padStart(2, '0'))
			.join('');

		// Check if key already exists (only for new keys)
		if (!body.keyId) {
			const existingKeys = await kv.get('api_keys');
			const keysMap = existingKeys ? JSON.parse(existingKeys) : {};
			if (keysMap[keyId]) {
				throw error(409, 'Key already exists');
			}
		}

		// Get existing keys
		const existingKeys = await kv.get('api_keys');
		const keysMap = existingKeys ? JSON.parse(existingKeys) : {};

		// Store in keys map
		keysMap[keyId] = {
			keyHash,
			createdAt: new Date().toISOString(),
			revoked: false,
			name: `Key ${keyId.slice(0, 8)}`,
			lastUsedAt: null
		};

		await kv.put('api_keys', JSON.stringify(keysMap));

		// Return the token (shown only once)
		const token = `${keyId}.${tokenSecret}`;

		return json({
			token,
			keyId,
			name: `Key ${keyId.slice(0, 8)}`
		});
	} catch (err) {
		console.error('Error creating API key:', err);
		throw error(500, 'Failed to create API key');
	}
};