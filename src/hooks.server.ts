import type { Handle } from '@sveltejs/kit';

const corsHeaders = {
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type, CF-Access-Client-Id, CF-Access-Client-Secret',
  'Access-Control-Max-Age': '86400',
};

export const handle: Handle = async ({ event, resolve }) => {
  // Handle preflight OPTIONS requests
  if (event.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Add CORS headers to all other responses
  const response = await resolve(event);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
};
