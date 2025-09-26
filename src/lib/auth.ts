import { error } from '@sveltejs/kit';

export async function verifyApiKey(token: string, kv: KVNamespace, masterSecret: string): Promise<string> {
	const parts = token.split('.');
	if (parts.length !== 2) {
		throw error(401, 'Invalid token format');
	}

	const [keyId, tokenSecret] = parts;

	const keyName = `api_key:${keyId}`;
	const value = await kv.get(keyName);

	if (!value) {
		throw error(401, 'Invalid API key');
	}

	const record = JSON.parse(value);
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
	await kv.put(keyName, JSON.stringify(record));

	return keyId;
}