import type { Handle } from '@sveltejs/kit';

const corsHeaders = (origin: string | null) => {
    // Allow specific origins including Obsidian
    const allowedOrigins = [
        'app://obsidian.md',
        'capacitor://localhost',
        'http://localhost:3000',
        'https://capture.savinpokharel0.workers.dev' // Add your actual domain
    ];

    const corsOrigin = origin && allowedOrigins.includes(origin) ? origin : '*';

    return {
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, CF-Access-Client-Id, CF-Access-Client-Secret, Origin, X-Requested-With',
        'Access-Control-Allow-Origin': corsOrigin,
        'Access-Control-Allow-Credentials': 'false', // Important: set to false when using service auth
        'Access-Control-Max-Age': '86400',
        'Vary': 'Origin'
    };
};

export const handle: Handle = async ({ event, resolve }) => {
    const origin = event.request.headers.get('Origin');
    const method = event.request.method;

    console.log(`${method} ${event.url.pathname} - Origin: ${origin}`);

    // Handle preflight (OPTIONS) requests immediately
    if (method === 'OPTIONS') {
        console.log('Handling OPTIONS preflight request');
        return new Response(null, {
            status: 204,
            headers: corsHeaders(origin)
        });
    }

    // For API routes, check Cloudflare Access headers
    if (event.url.pathname.startsWith('/api/')) {
        const clientId = event.request.headers.get('CF-Access-Client-Id');
        const clientSecret = event.request.headers.get('CF-Access-Client-Secret');
        
        if (!clientId || !clientSecret) {
            console.log('Missing Cloudflare Access headers');
            return new Response('Missing authentication headers', {
                status: 401,
                headers: corsHeaders(origin)
            });
        }
        
        // Here you would validate the service token against Cloudflare
        // For now, we'll just log it
        console.log('Service auth headers present:', { clientId: clientId.substring(0, 8) + '...' });
    }

    // Handle the actual request
    let response;
    try {
        response = await resolve(event);
    } catch (error) {
        console.error('Error in resolve:', error);
        return new Response('Internal Server Error', {
            status: 500,
            headers: corsHeaders(origin)
        });
    }

    // Add CORS headers to all responses
    const headers = corsHeaders(origin);
    for (const [key, value] of Object.entries(headers)) {
        response.headers.set(key, value);
    }

    return response;
};