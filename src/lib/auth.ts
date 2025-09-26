import { error } from '@sveltejs/kit';

export async function verifyApiKey(token: string, kv: KVNamespace, masterSecret: string): Promise<string> {
	if (token !== masterSecret) {
		throw error(401, 'Invalid API key');
	}

	return 'master';
}