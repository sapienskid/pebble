# Pebble

Pebble is an offline-first PWA for capturing atomic notes on mobile or desktop. Notes are saved locally first, then optionally synced to Cloudflare KV and imported into Obsidian with the companion plugin.

## Live Demo

Production URL: <https://pebble.savinpokharel.workers.dev>

## Features

- Offline-first note capture with IndexedDB
- Installable PWA
- Optional cloud sync via Cloudflare Workers + KV
- Obsidian plugin integration for importing synced notes
- Light, dark, and device theme support

## One-Click Deploy

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/sapienskid/pebble)

After clicking the button, Cloudflare creates a Worker project from this repo and automatically provisions the required `PEBBLE_SYNC_KV` binding for sync. Keep the default build/deploy settings unless you have custom requirements.

Set `API_KEY` in the deploy form (for example, generated with `openssl rand -hex 32`). This same key is used by both Pebble and the Obsidian plugin.

## Post-Deploy Setup (Required for Sync)

The app itself works without cloud sync. To enable sync between Pebble and Obsidian, configure these once:

1. Set `API_KEY` secret:
   - Preferred: set it in the Cloudflare Deploy form during deployment
   - Fallback: add it after deploy in Worker settings
   - Cloudflare Dashboard -> Workers & Pages -> your worker -> Settings -> Variables and Secrets -> Add secret
   - Key: `API_KEY`
   - Value: any long random string
2. In Pebble app Settings:
   - Enable background sync
   - Paste the same API key into the `API Key` field
3. In the Obsidian plugin settings:
   - Set `API URL` to your deployed Worker URL
   - Set `API Key` to the same `API_KEY`

## How Note Creation Works

1. User creates a note in the Pebble UI.
2. Note is written to local IndexedDB immediately.
3. If sync is enabled, unsynced notes are POSTed to `/api/sync/push`.
4. Worker validates the API key and stores sync items in KV with TTL (7 days default; selectable 7/15/30 days in app settings).

This keeps capture fast and offline-safe even when network is unavailable.

## How Obsidian Sync Works

1. Obsidian plugin calls `/api/sync/fetch` with `X-API-Key`.
2. Worker validates API key and returns sync items from KV.
3. Plugin writes notes into your configured Obsidian folder/template flow.

Sync direction is one-way: Pebble -> Cloudflare KV -> Obsidian.

## Local Development

```bash
npm install
npm run dev
```

For full-stack local development with Cloudflare runtime:

```bash
npm run wrangler:dev
```

Set local secrets in `.dev.vars` when testing sync endpoints (see `.dev.vars.example`):

```bash
API_KEY=your-local-api-key
```

## Tech Stack

- SvelteKit + TypeScript
- Tailwind CSS + shadcn-svelte
- Dexie + IndexedDB
- Cloudflare Workers + KV

## License

MIT. See [LICENSE](LICENSE).
