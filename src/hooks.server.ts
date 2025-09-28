import type { Handle } from '@sveltejs/kit';

const corsHeaders = {
    'Access-Control-Allow-Origin': 'app://obsidian.md',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-API-Key, Authorization, Origin, Accept',
    'Access-Control-Allow-Credentials': 'false',
    'Access-Control-Max-Age': '3600',
    'Vary': 'Origin, CF-Access-Client-Id, CF-Access-Client-Secret'
};

export const handle: Handle = async ({ event, resolve }) => {
    // Handle preflight requests for all routes
    if (event.request.method === 'OPTIONS') {
        return new Response(null, {
            status: 200, // Using 200 for better compatibility
            headers: corsHeaders
        });
    }

    // For other requests, resolve them and add CORS headers to the response
    const response = await resolve(event);
    
    for (const [key, value] of Object.entries(corsHeaders)) {
        response.headers.set(key, value);
    }

    return response;
};
