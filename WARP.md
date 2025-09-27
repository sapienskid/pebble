# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Pebble** is an offline-first Progressive Web App (PWA) for capturing atomic notes, built with SvelteKit and deployed on Cloudflare Workers. It features one-way synchronization to Obsidian daily notes via **Pebble Sync**.

**Live Production**: https://pebble.savinpokharel.workers.dev

## Development Commands

### Core Development
- `npm run dev` - Start Vite development server (frontend-only, no API endpoints)
- `npm run wrangler:dev` - Start full-stack development with Cloudflare Workers locally
- `npm run build` - Build production bundle for Cloudflare Workers
- `npm run preview` - Preview production build locally

### Deployment
- `npm run deploy` - Deploy to Cloudflare Workers (includes build step)

### Type Checking & Linting  
- `npm run check` - Run SvelteKit sync and type checking
- `npm run check:watch` - Run type checking in watch mode

### Testing Single Components
To test individual components during development:
```bash
# Use wrangler:dev for full API functionality
npm run wrangler:dev

# Access at http://localhost:8787 (not 5173) for complete functionality
```

## Architecture Overview

### Frontend Architecture (SvelteKit PWA)
- **Framework**: SvelteKit 2.x with Svelte 5, TypeScript
- **Styling**: Tailwind CSS v4 with shadcn-svelte components  
- **State**: Svelte stores with IndexedDB persistence via Dexie
- **PWA**: Service worker, offline-first with background sync
- **Deployment**: Cloudflare Workers with static asset serving

### Backend Architecture (SvelteKit API Routes)
- **Runtime**: Cloudflare Workers (SvelteKit routes as serverless functions)
- **Storage**: Cloudflare KV for temporary sync data (TTL-based, self-cleaning)
- **Authentication**: Bearer token (for Obsidian plugin), no auth for PWA (protected by Cloudflare Access)

### Data Flow Architecture
```
Pebble PWA → IndexedDB (immediate) → Background Sync → KV (temporary) → Obsidian Plugin
    ↑              ↑                        ↑              ↑
  No Auth      Local Storage        No Auth Required   Bearer Token
```

### Key Data Models
- **Notes**: Atomic notes (max 500 chars) with tags, sync status
- **Settings**: Sync configuration, tokens, preferences  
- **Theme**: Light/dark/device mode persistence

## Core Components

### Storage Layer (`src/lib/db.ts`)
- **IndexedDB Schema**: Notes, settings, theme tables via Dexie
- **Mock Support**: Fallback for non-browser environments (SSR, tests)
- **Versioning**: Database migrations for schema updates

### State Management (`src/lib/stores/`)
- **Reactive Stores**: Auto-sync to IndexedDB on changes
- **Background Sync**: Automatic upload of unsynced items when online
- **Offline-First**: All data persists locally before sync

### API Layer (`src/routes/api/sync/`)
- **Push Endpoint**: `/api/sync/push` (no auth) - PWA uploads notes
- **Fetch Endpoint**: `/api/sync/fetch` (auth required) - Obsidian plugin retrieval  
- **KV Storage**: Temporary data with TTL (7/15/45 days)

### Service Architecture
- **Background Sync** (`src/lib/services/sync.ts`): Handles unsynced item uploads
- **PWA Features**: Service worker with cache-first strategy, offline detection

## Development Patterns

### Environment Handling
- **Browser Detection**: `typeof window !== 'undefined'` for client-side code
- **Service Worker Support**: IndexedDB available in both main thread and service worker
- **SSR Safety**: Mock implementations for server-side rendering

### State Persistence Pattern
```typescript
// Store subscribes to IndexedDB changes
store.subscribe(async (data) => {
  await db.table.clear();
  await db.table.bulkAdd(data);
});
```

### Sync Pattern
```typescript
// Background sync on data changes
if (navigator.onLine) {
  import('$lib/services/sync').then(({ syncUnsyncedItems }) => syncUnsyncedItems());
}
```

## Important Context

### Removed Features
The following features were previously implemented but have been removed:
- **Tasks (Plan tab)**: Task management with scheduling
- **Reminders (Remind tab)**: Notification system with recurring reminders
- **Tab Navigation**: Three-tab interface reduced to single note capture
- **Related components**: `PlanTab.svelte`, `RemindTab.svelte`, `TaskDialog.svelte`, `ReminderDialog.svelte`

### Authentication Model
- **PWA Access**: Protected by Cloudflare Access, no application-level auth
- **Obsidian Plugin**: Requires Bearer token with master secret
- **KV Operations**: Push requires no auth, fetch requires authentication

### Deployment Configuration
- **Cloudflare Workers**: Main runtime environment  
- **KV Namespace**: `PEBBLE_SYNC_KV` for temporary sync storage
- **Secrets**: `MASTER_HMAC_SECRET` for API authentication
- **Assets**: Static files served via Cloudflare Assets binding

## Working with the Codebase

### Local Development Best Practices
- Use `npm run wrangler:dev` for full-stack development
- API endpoints require Cloudflare Workers environment
- KV bindings work locally with production namespace  
- Set secrets for local testing: `wrangler secret put MASTER_HMAC_SECRET`

### Testing Components
- Service worker registration enabled in production builds
- PWA features require HTTPS (use Cloudflare Workers URL for testing)
- IndexedDB operations are async - use proper error handling

### Data Constraints
- **Notes**: Maximum 500 characters for atomic note principle
- **KV Storage**: 1GB per namespace, eventually consistent
- **TTL Management**: Sync data auto-expires, no permanent storage

### Working with Stores
- All stores auto-persist to IndexedDB
- Changes trigger background sync if online
- Use reactive patterns for UI updates
- Handle offline/online state transitions