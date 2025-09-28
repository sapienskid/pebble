import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Handle CORS preflight specifically for Cloudflare Access + browser compatibility
export const OPTIONS: RequestHandler = async ({ request }) => {
    const origin = request.headers.get('Origin');
    const headers = new Headers();
    
    // Allow Obsidian app specifically
    if (origin && origin.startsWith('app://obsidian.md')) {
        headers.set('Access-Control-Allow-Origin', origin);
    } else {
        headers.set('Access-Control-Allow-Origin', 'app://obsidian.md');
    }
    
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, X-API-Key, Authorization, Origin, Accept');
    headers.set('Access-Control-Allow-Credentials', 'false');
    headers.set('Access-Control-Max-Age', '300'); // Short cache for testing
    headers.set('Vary', 'Origin');
    
    console.log('API OPTIONS preflight handled locally', { origin });
    
    return new Response(null, {
        status: 200,
        headers
    });
};

// Main API logic

export const GET: RequestHandler = async ({ platform, request }) => {
    // 1. Validate environment configuration
    if (!platform?.env) {
        console.error('Platform environment is not available.');
        return json({ message: 'Server environment not available' }, { status: 500 });
    }

    const { PEBBLE_SYNC_KV: kv } = platform.env;
    const apiKey = (platform.env as any).API_KEY;

    if (!kv) {
        console.error('KV store is not configured in the environment.');
        return json({ message: 'Backend not configured' }, { status: 500 });
    }

    // 2. Check API key authentication
    const providedKey = request.headers.get('X-API-Key') || request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!providedKey) {
        console.error('No API key provided');
        return json({ message: 'API key required' }, { status: 401 });
    }
    
    if (providedKey !== apiKey) {
        console.error('Invalid API key provided');
        return json({ message: 'Invalid API key' }, { status: 401 });
    }

    // 3. Execute business logic
    try {
        const list = await kv.list({ prefix: 'sync:' });
        const syncItems: any[] = [];

        for (const key of list.keys) {
            const value = await kv.get(key.name);
            if (value) {
                try {
                    syncItems.push(JSON.parse(value));
                } catch (e) {
                    console.warn(`Skipping corrupted KV entry: ${key.name}`);
                }
            }
        }

        // Sort by most recent first
        syncItems.sort((a, b) => new Date(b.syncedAt).getTime() - new Date(a.syncedAt).getTime());

        // Normalize data to ensure client-side consistency
        const normalizedItems = syncItems.map(item => {
            if (item?.type === 'note') {
                return { ...item, tags: Array.isArray(item.tags) ? item.tags : [] };
            }
            return item;
        });

        // CORS headers are handled in hooks.server.ts
        return json({ items: normalizedItems });

    } catch (err) {
        console.error('A critical error occurred while fetching sync items:', err);
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        
        // CORS headers are handled in hooks.server.ts
        return json({ message: `Failed to fetch sync items: ${errorMessage}` }, { status: 500 });
    }
};