import { describe, it, expect, vi } from 'vitest';
import worker, { type Env } from './index';

describe('Pebble Cloudflare Worker Backend', () => {
    const mockKv = {
        store: new Map<string, string>(),
        async put(key: string, value: string) {
            this.store.set(key, value);
        },
        async get(key: string) {
            return this.store.get(key) ?? null;
        },
        async list({ prefix }: { prefix: string }) {
            const keys = Array.from(this.store.keys())
                .filter(k => k.startsWith(prefix))
                .map(name => ({ name }));
            return { keys, list_complete: true, cursor: '' };
        }
    } as unknown as KVNamespace;

    const mockEnv: Env = {
        PEBBLE_SYNC_KV: mockKv,
        API_KEY: 'test-secret-api-key'
    };

    const ctx = {
        waitUntil: vi.fn(),
        passThroughOnException: vi.fn()
    } as unknown as ExecutionContext;

    it('responds to OPTIONS preflight with CORS headers', async () => {
        const req = new Request('https://pebble.example/api/sync/fetch', {
            method: 'OPTIONS',
            headers: { Origin: 'app://obsidian.md' }
        });
        const res = await worker.fetch(req, mockEnv, ctx);
        expect(res.status).toBe(200);
        expect(res.headers.get('Access-Control-Allow-Origin')).toBe('app://obsidian.md');
        expect(res.headers.get('Access-Control-Allow-Methods')).toContain('GET, POST, OPTIONS');
    });

    it('returns health check status', async () => {
        const req = new Request('https://pebble.example/health');
        const res = await worker.fetch(req, mockEnv, ctx);
        expect(res.status).toBe(200);
        const data = await res.json() as { status: string; service: string };
        expect(data.status).toBe('ok');
        expect(data.service).toBe('pebble-sync-backend');
    });

    it('rejects unauthenticated push request', async () => {
        const req = new Request('https://pebble.example/api/sync/push', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'note', markdown: 'hello' })
        });
        const res = await worker.fetch(req, mockEnv, ctx);
        expect(res.status).toBe(401);
    });

    it('accepts authenticated push request and stores in KV', async () => {
        const req = new Request('https://pebble.example/api/sync/push', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': 'test-secret-api-key'
            },
            body: JSON.stringify({
                type: 'note',
                id: 'note-123',
                markdown: 'Deep work on architecture',
                tags: ['ideas', 'focus']
            })
        });
        const res = await worker.fetch(req, mockEnv, ctx);
        expect(res.status).toBe(200);
        const data = await res.json() as { success: boolean; syncId: string };
        expect(data.success).toBe(true);
        expect(data.syncId).toBeDefined();
    });

    it('fetches stored notes with authentication', async () => {
        const req = new Request('https://pebble.example/api/sync/fetch', {
            method: 'GET',
            headers: { 'X-API-Key': 'test-secret-api-key' }
        });
        const res = await worker.fetch(req, mockEnv, ctx);
        expect(res.status).toBe(200);
        const data = await res.json() as { items: Array<{ id: string; markdown: string; tags: string[] }> };
        expect(data.items.length).toBeGreaterThan(0);
        expect(data.items[0].id).toBe('note-123');
        expect(data.items[0].markdown).toBe('Deep work on architecture');
        expect(data.items[0].tags).toEqual(['ideas', 'focus']);
    });
});
