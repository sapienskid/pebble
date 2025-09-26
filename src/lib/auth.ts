import { error } from '@sveltejs/kit';

export async function verifyApiKey(token: string, kv: KVNamespace, masterSecret: string): Promise<string> {
	const parts = token.split('.');
	if (parts.length !== 2) {
		throw error(401, 'Invalid token format');
	}

	const [keyId, tokenSecret] = parts;

	// Get all keys
	const value = await kv.get('api_keys');
	const keysMap = value ? JSON.parse(value) : {};

	const record = keysMap[keyId];
	if (!record) {
		throw error(401, 'Invalid API key');
	}

	if (record.revoked) {
		throw error(401, 'API key revoked');
	}

	// Verify HMAC
	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		'raw',
		encoder.encode(masterSecret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(tokenSecret));
	const computedHash = Array.from(new Uint8Array(signature))
		.map(b => b.toString(16).padStart(2, '0'))
		.join('');

	if (computedHash !== record.keyHash) {
		throw error(401, 'Invalid API key');
	}

	// Update lastUsedAt
	record.lastUsedAt = new Date().toISOString();
	await kv.put('api_keys', JSON.stringify(keysMap));

	return keyId;
}