// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		interface Platform extends Record<string, any> {
			env: {
				PEBBLE_SYNC_KV: KVNamespace;
				MASTER_HMAC_SECRET: string;
			};
		}
	}

	interface Note {
		id: string;
		content: string;
		tags: string[];
		timestamp: string;
	}
}

export {};
