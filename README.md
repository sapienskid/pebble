# Pebble

Pebble is a headless Cloudflare Worker sync backend for Cairn (Android native app) and Obsidian (companion plugin). Notes captured on mobile are synced to Cloudflare KV and can be imported into Obsidian.

## Live Worker

Production URL: <https://pebble.savinpokharel.workers.dev>

## Features

- Headless sync backend powered by Cloudflare Workers and Workers KV
- `POST /api/sync/push`: Authenticated endpoint to push notes from Cairn
- `GET /api/sync/fetch`: Authenticated endpoint to fetch synced notes for Obsidian
- `GET /health`: Health check and status endpoint
- Configurable TTL retention (7, 15, or 30 days)

## One-Click Deploy

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/sapienskid/pebble)

After clicking the button, Cloudflare creates a Worker project from this repo and automatically provisions the required `PEBBLE_SYNC_KV` binding for sync.

Set `API_KEY` in the deploy form (for example, generated with `openssl rand -hex 32`). This same key is used by both Cairn and the Obsidian plugin.

## Post-Deploy Setup (Required for Sync)

1. Set `API_KEY` secret:
   - Preferred: set it in the Cloudflare Deploy form during deployment
   - Fallback: add it after deploy in Worker settings
   - Cloudflare Dashboard -> Workers & Pages -> your worker -> Settings -> Variables and Secrets -> Add secret
   - Key: `API_KEY`
   - Value: any long random string
2. In Cairn app Settings:
   - Enter your Worker URL and the same `API_KEY`
3. In the Obsidian plugin settings:
   - Set `API URL` to your deployed Worker URL
   - Set `API Key` to the same `API_KEY`

## How Note Sync Works

1. Note is captured in Cairn and stored locally.
2. When syncing, Cairn POSTs to `/api/sync/push` with `X-API-Key`.
3. Worker validates the API key and stores sync items in KV with TTL.
4. Obsidian plugin calls `/api/sync/fetch` with `X-API-Key` to pull notes into the vault.

## Local Development

Use `pnpm` for package management and Wrangler for local Worker development:

```bash
pnpm install
pnpm run dev      # Starts local Wrangler development server
pnpm run build    # Type-checks and validates Worker bundle with Wrangler
pnpm run test     # Runs Vitest unit tests
pnpm run deploy   # Deploys Worker to Cloudflare
```

Set local secrets in `.dev.vars` when testing sync endpoints (see `.dev.vars.example`):

```bash
API_KEY=your-local-api-key
```

## Tech Stack

- Cloudflare Workers + Workers KV
- Wrangler v4
- TypeScript
- Vitest

## License

MIT. See [LICENSE](LICENSE).
