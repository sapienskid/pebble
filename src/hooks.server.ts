import type { Handle } from '@sveltejs/kit';

const allowedOrigins = [
	'app://obsidian.md',
	'http://localhost:5173', // SvelteKit dev server
	'http://localhost:4173'  // SvelteKit preview server
];

const corsHeaders = {
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, CF-Access-Client-Id, CF-Access-Client-Secret, Authorization',
	'Access-Control-Allow-Credentials': 'true',
	'Access-Control-Max-Age': '86400'
};

export const handle: Handle = async ({ event, resolve }) => {
	const origin = event.request.headers.get('origin');
	
	// Handle preflight OPTIONS requests first
	if (event.request.method === 'OPTIONS') {
		if (origin && allowedOrigins.includes(origin)) {
			return new Response(null, {
				status: 204,
				headers: {
					'Access-Control-Allow-Origin': origin,
					...corsHeaders
				}
			});
		} else {
			// Return 204 even for non-allowed origins to avoid errors
			return new Response(null, { status: 204 });
		}
	}

	// Handle the actual request
	const response = await resolve(event, {
		// This ensures we handle all responses consistently
		transformPageChunk: ({ html }) => html
	});

	// Add CORS headers to all responses if origin is allowed
	if (origin && allowedOrigins.includes(origin)) {
		response.headers.set('Access-Control-Allow-Origin', origin);
		response.headers.set('Access-Control-Allow-Credentials', 'true');
		
		// For Cloudflare Workers, ensure headers are properly set
		response.headers.set('Access-Control-Allow-Methods', corsHeaders['Access-Control-Allow-Methods']);
		response.headers.set('Access-Control-Allow-Headers', corsHeaders['Access-Control-Allow-Headers']);
	}

	return response;
};