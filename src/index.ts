export interface Env {
    PEBBLE_SYNC_KV: KVNamespace;
    API_KEY?: string;
}

interface NotePayload {
    type: string;
    markdown: string;
    id?: string;
    createdAt?: string;
    tags?: string[];
    ttlDays?: number;
}

function getCorsHeaders(request: Request): Headers {
    const origin = request.headers.get('Origin');
    const headers = new Headers();
    if (origin && (origin.startsWith('app://obsidian.md') || origin.startsWith('http://localhost') || origin.startsWith('https://localhost'))) {
        headers.set('Access-Control-Allow-Origin', origin);
    } else {
        headers.set('Access-Control-Allow-Origin', '*');
    }
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, X-API-Key, Authorization, Origin, Accept');
    headers.set('Access-Control-Allow-Credentials', 'false');
    headers.set('Access-Control-Max-Age', '3600');
    headers.set('Vary', 'Origin, CF-Access-Client-Id, CF-Access-Client-Secret');
    return headers;
}

function jsonResponse(data: unknown, status = 200, corsHeaders?: Headers): Response {
    const headers = corsHeaders ? new Headers(corsHeaders) : new Headers();
    headers.set('Content-Type', 'application/json');
    return new Response(JSON.stringify(data), { status, headers });
}

function validateAuth(request: Request, env: Env): boolean {
    const expectedKey = env.API_KEY;
    if (!expectedKey) return false;
    const provided = request.headers.get('X-API-Key') || request.headers.get('Authorization')?.replace('Bearer ', '');
    return provided === expectedKey;
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const cors = getCorsHeaders(request);

        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 200, headers: cors });
        }

        const url = new URL(request.url);
        const path = url.pathname.replace(/\/+$/, '') || '/';

        if (path === '' || path === '/' || path === '/health') {
            return jsonResponse({
                status: 'ok',
                service: 'pebble-sync-backend',
                timestamp: new Date().toISOString()
            }, 200, cors);
        }

        if (path === '/api/sync/push' && request.method === 'POST') {
            if (!validateAuth(request, env)) {
                return jsonResponse({ message: 'Unauthorized: valid API key required' }, 401, cors);
            }
            if (!env.PEBBLE_SYNC_KV) {
                return jsonResponse({ message: 'KV store not configured' }, 500, cors);
            }

            try {
                const body = await request.json() as NotePayload;
                if (!body.type || !body.markdown) {
                    return jsonResponse({ message: 'type and markdown are required' }, 400, cors);
                }

                const syncId = crypto.randomUUID();
                const timestamp = new Date().toISOString();
                const allowedDays = new Set([7, 15, 30]);
                const requestedDays = body.ttlDays;
                const ttlDays = requestedDays && allowedDays.has(requestedDays) ? requestedDays : 7;
                const ttl = ttlDays * 24 * 60 * 60;
                const syncKey = `sync:${body.type}:${timestamp}:${syncId}`;

                const syncData = {
                    type: body.type,
                    markdown: body.markdown,
                    id: body.id || null,
                    createdAt: body.createdAt || timestamp,
                    syncedAt: timestamp,
                    tags: Array.isArray(body.tags) ? body.tags : []
                };

                await env.PEBBLE_SYNC_KV.put(syncKey, JSON.stringify(syncData), { expirationTtl: ttl });
                return jsonResponse({ success: true, syncId }, 200, cors);
            } catch (err) {
                console.error('Push error:', err);
                return jsonResponse({ message: 'Failed to push sync item' }, 500, cors);
            }
        }

        if (path === '/api/sync/fetch' && request.method === 'GET') {
            if (!validateAuth(request, env)) {
                return jsonResponse({ message: 'Unauthorized: valid API key required' }, 401, cors);
            }
            if (!env.PEBBLE_SYNC_KV) {
                return jsonResponse({ message: 'KV store not configured' }, 500, cors);
            }

            try {
                const list = await env.PEBBLE_SYNC_KV.list({ prefix: 'sync:' });
                const syncItems: any[] = [];

                for (const key of list.keys) {
                    const value = await env.PEBBLE_SYNC_KV.get(key.name);
                    if (value) {
                        try {
                            syncItems.push(JSON.parse(value));
                        } catch {
                            console.warn(`Corrupted KV entry: ${key.name}`);
                        }
                    }
                }

                syncItems.sort((a, b) => new Date(b.syncedAt).getTime() - new Date(a.syncedAt).getTime());
                const normalized = syncItems.map(item => ({
                    ...item,
                    tags: Array.isArray(item.tags) ? item.tags : []
                }));

                return jsonResponse({ items: normalized }, 200, cors);
            } catch (err) {
                console.error('Fetch error:', err);
                return jsonResponse({ message: 'Failed to fetch sync items' }, 500, cors);
            }
        }

        return jsonResponse({ message: 'Not Found' }, 404, cors);
    }
};
