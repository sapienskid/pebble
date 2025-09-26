import { error } from '@sveltejs/kit';

export async function verifyApiKey(token: string, kv: KVNamespace, masterSecret: string): Promise<void> {
	if (token !== masterSecret) {
		throw error(401, 'Invalid API key');
	}
}