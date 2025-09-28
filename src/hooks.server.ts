import type { Handle } from '@sveltejs/kit';

// List of origins that are allowed to access your API
const allowedOrigins = [
  'app://obsidian.md',
  'http://localhost:5173', // SvelteKit dev server
  'http://localhost:4173'  // SvelteKit preview server
];

export const handle: Handle = async ({ event, resolve }) => {
  const origin = event.request.headers.get('origin');

  // --- Handle Preflight (OPTIONS) requests ---
  // This is the crucial part that fixes the preflight error.
  if (event.request.method === 'OPTIONS' && origin && allowedOrigins.includes(origin)) {
    // Respond with the necessary CORS headers and an empty body.
    return new Response(null, {
      status: 204, // 204 No Content
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, CF-Access-Client-Id, CF-Access-Client-Secret',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400' // Cache preflight for 1 day
      }
    });
  }

  // --- Handle Actual (GET, POST, etc.) requests ---
  const response = await resolve(event);

  // Add CORS headers to the actual response for the allowed origin
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return response;
};