import type { Handle } from '@sveltejs/kit';

const allowedOrigins = [
	'app://obsidian.md',
	'http://localhost:5173', // SvelteKit dev server
	'http://localhost:4173' // SvelteKit preview server
];

export const handle: Handle = async ({ event, resolve }) => {
	const origin = event.request.headers.get('origin');

	// Handle preflight OPTIONS requests for CORS
	if (event.request.method === 'OPTIONS' && origin && allowedOrigins.includes(origin)) {
		return new Response(null, {
			status: 204,
			headers: {
				'Access-Control-Allow-Origin': origin,
				'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type, CF-Access-Client-Id, CF-Access-Client-Secret',
				'Access-Control-Allow-Credentials': 'true',
				'Access-Control-Max-Age': '86400'
			}
		});
	}

	// Resolve the request and get the response
	const response = await resolve(event);

	// Add CORS headers to the actual response
	if (origin && allowedOrigins.includes(origin)) {
		response.headers.set('Access-Control-Allow-Origin', origin);
		response.headers.set('Access-Control-Allow-Credentials', 'true');
	}

	return response;
};