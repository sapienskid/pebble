import { json, type Handle } from '@sveltejs/kit';

// Define the origins that are explicitly allowed to make requests.
const allowedOrigins = [
    'app://obsidian.md',
];

/**
 * A centralized function to generate the correct CORS headers.
 * Updated for Cloudflare Access compatibility.
 */
const getCorsHeaders = (origin: string | null) => {
    const headers = new Headers();
    
    // Always allow obsidian app requests
    if (origin && origin.startsWith('app://obsidian.md')) {
        headers.set('Access-Control-Allow-Origin', origin);
    } else {
        // For preflight requests without origin, allow obsidian
        headers.set('Access-Control-Allow-Origin', 'app://obsidian.md');
    }
    
    // Critical: Set the Vary header correctly for Cloudflare Access
    headers.set('Vary', 'Origin, CF-Access-Client-Id, CF-Access-Client-Secret');
    
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, X-API-Key, Authorization, Origin, Accept');
    headers.set('Access-Control-Allow-Credentials', 'false');
    headers.set('Access-Control-Max-Age', '3600'); // Reduce cache time for debugging
    
    return headers;
};

export const handle: Handle = async ({ event, resolve }) => {
    const origin = event.request.headers.get('Origin');
    
    // --- STEP 1: Handle the CORS Preflight (The Front Door) ---
    // This is critical for Cloudflare Access + CORS compatibility
    if (event.request.method === 'OPTIONS') {
        console.log('Handling OPTIONS preflight request', { origin, url: event.url.pathname });
        return new Response(null, {
            status: 200, // Changed from 204 to 200 for better compatibility
            headers: getCorsHeaders(origin),
        });
    }

    // --- STEP 2: Handle the Actual Request ---
    // For API routes, let Cloudflare Access handle authentication at the edge
    // We don't need to check CF-Access headers here since CF Access validates them
    if (event.url.pathname.startsWith('/api/')) {
        console.log('Processing API request', { 
            method: event.request.method, 
            path: event.url.pathname,
            origin: origin,
            hasClientId: !!event.request.headers.get('CF-Access-Client-Id')
        });
    }

    // Process the request
    const response = await resolve(event);

    // Add CORS headers to all responses
    const corsHeaders = getCorsHeaders(origin);
    for (const [key, value] of corsHeaders.entries()) {
        response.headers.set(key, value);
    }

    return response;
};
