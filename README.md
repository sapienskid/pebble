# Pebble

An offline-first Progressive Web App for capturing atomic notes, managing tasks, and setting reminders. Pebble Sync provides one-way synchronization of Pebble data into Obsidian daily notes.

## 🚀 Live Demo

**Production URL**: https://pebble.savinpokharel.workers.dev

## Current Implementation Status

- **Frontend**: Complete SvelteKit PWA with TypeScript, Tailwind CSS v4, and adapter-cloudflare
- **UI Framework**: bits-ui and shadcn-svelte components fully implemented
- **Component Architecture**: Three-tab interface (Capture, Plan, Remind) with full CRUD dialogs
- **State Management**: Svelte stores with IndexedDB persistence via Dexie
- **Backend**: Cloudflare Workers with complete API endpoints and KV storage
- **Authentication**: Bearer token with master secret for secure sync
- **PWA**: Service worker, web manifest, offline functionality
- **Deployment**: Live on Cloudflare Workers with KV and secrets configured

## Features

### ✅ Implemented
- **Three-tab interface**: Capture (atomic notes), Plan (tasks), Remind (reminders)
- **Offline-first functionality**: IndexedDB storage with Dexie
- **Background sync**: Automatic upload of notes/tasks when online
- **Theme support**: Light/dark/device modes with persistence
- **Notification system**: Browser notifications + ntfy integration
- **Settings persistence**: All user preferences saved locally
- **PWA features**: Installable, offline-capable, service worker
- **Cloudflare deployment**: Live API endpoints with KV storage

### 🔄 In Progress
- **Obsidian plugin**: One-way sync to daily notes (API ready, plugin pending)

### 📋 Planned
- **Advanced sync features**: Conflict resolution, selective sync
- **Data export/import**: Backup and restore functionality
- **Enhanced notifications**: Custom scheduling, recurring reminders

## Tech Stack

### Frontend
- **Framework**: SvelteKit 2.x with Svelte 5
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with custom design system
- **UI Components**: bits-ui and shadcn-svelte
- **Icons**: @lucide/svelte and @iconify/svelte
- **Database**: IndexedDB via Dexie 4.x
- **Date Handling**: date-fns
- **Build Tool**: Vite
- **PWA**: @vite-pwa/sveltekit

### Backend
- **Runtime**: Cloudflare Workers
- **Storage**: Cloudflare KV (key-value store)
- **Authentication**: Bearer token with master secret
- **Language**: TypeScript
- **Deployment**: Wrangler 4.x

## Prerequisites

- Node.js 18+
- npm or yarn
- Cloudflare account (for deployment)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/sapienskid/pebble.git
cd pebble
```

2. Install dependencies:
```bash
npm install
```

## Development

### Local Development

Start the development server:
```bash
npm run dev
```
The app will be available at `http://localhost:5173`

**Note**: API endpoints require Cloudflare Workers environment. For full functionality, use:
```bash
npm run wrangler:dev
```
This runs the app with Cloudflare Workers locally at `http://localhost:8787`

### Building

```bash
npm run build
```

### Deployment

```bash
npm run deploy
```

The app is deployed to Cloudflare Workers with KV storage and secrets configured.

## Project Structure

```
pebble/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── tabs/
│   │   │   │   ├── CaptureTab.svelte
│   │   │   │   ├── PlanTab.svelte
│   │   │   │   └── RemindTab.svelte
│   │   │   ├── dialogs/
│   │   │   │   ├── NoteDialog.svelte
│   │   │   │   ├── ReminderDialog.svelte
│   │   │   │   ├── SettingsDialog.svelte
│   │   │   │   └── TaskDialog.svelte
│   │   │   ├── layout/
│   │   │   │   ├── Header.svelte
│   │   │   │   └── TabNavigation.svelte
│   │   │   └── ui/                    # shadcn-svelte components
│   │   ├── stores/                    # Svelte stores with persistence
│   │   │   ├── notes.ts
│   │   │   ├── tasks.ts
│   │   │   ├── reminders.ts
│   │   │   ├── settings.ts
│   │   │   └── theme.ts
│   │   ├── services/                  # Background sync & notifications
│   │   │   ├── notification.ts
│   │   │   └── sync.ts
│   │   ├── db.ts                      # IndexedDB schema with Dexie
│   │   └── utils.ts
│   ├── routes/
│   │   ├── +layout.svelte
│   │   ├── +page.svelte
│   │   └── api/                       # Cloudflare Workers API routes
│   │       └── sync/
│   │           ├── fetch/
│   │           └── push/
│   ├── app.css
│   ├── app.d.ts
│   ├── app.html
│   └── service-worker.js
├── static/
│   ├── app.webmanifest
│   └── robots.txt
├── components.json
├── package.json
├── postcss.config.js
├── svelte.config.js
├── tsconfig.json
├── vite.config.ts
├── wrangler.toml                    # Cloudflare Workers config
└── README.md
```

## Data Models

```typescript
// Notes (Capture tab) - atomic notes limited to 500 characters
interface Note {
  id: string;
  content: string; // max 500 characters
  timestamp: string;
  tags: string[];
  synced: boolean;
}

// Tasks (Plan tab)
interface Task {
  id: string;
  type: 'task';
  title: string;
  description?: string;
  date: string; // ISO date string
  timeSlot: 'morning' | 'afternoon' | 'evening';
  scheduledTime?: string; // "9:30 AM"
  completed: boolean;
  synced: boolean;
}

// Reminders (Remind tab)
interface Reminder {
  id: string;
  timestamp: string;
  synced: boolean;
  createdAt: string;
  updatedAt: string;
  type: 'reminder';
  title: string;
  description?: string;
  scheduledFor: string; // ISO 8601
  reminderType: 'one-time' | 'recurring';
  recurring?: 'daily' | 'weekly' | 'monthly';
  completed: boolean;
  notified: boolean;
}

// Settings
interface Settings {
  id: string;
  syncEnabled: boolean;
  syncToken?: string;
  autoSyncOnStart: boolean;
  notificationMethod: 'browser' | 'ntfy';
}

// Theme
interface ThemeRecord {
  id: string;
  value: 'light' | 'dark' | 'device';
}
```

## API Endpoints

### Sync
- `POST /api/sync/push` - Push notes/tasks for sync (from PWA)
- `GET /api/sync/fetch` - Fetch sync data (for Obsidian plugin, requires auth)

Sync endpoints for Obsidian plugin require Bearer token authentication with master secret.

## Configuration

### Environment Variables (for ntfy notifications)
```
VITE_NTFY_SERVER=your-ntfy-server
VITE_NTFY_TOPIC=your-topic
VITE_NTFY_USERNAME=your-username
VITE_NTFY_PASSWORD=your-password
```

### Cloudflare Setup
- **KV Namespace**: `PEBBLE_SYNC_KV` (ID: c9e4765973954b6e9a5458d1a8d531e7)
- **Secret**: `MASTER_HMAC_SECRET` (set via wrangler)
- **Compatibility Date**: 2025-09-24

### Wrangler Configuration

The `wrangler.toml` file is used to configure the Cloudflare Workers deployment. It specifies the entry point for the worker, the compatibility date, and the bindings for KV namespaces and other resources.

```toml
name = "pebble"
main = ".svelte-kit/cloudflare/_worker.js"
compatibility_date = "2025-09-24"

[[kv_namespaces]]
binding = "PEBBLE_SYNC_KV"
id = "1645f24f4fab4077b489234dc31da874"

[assets]
directory = ".svelte-kit/cloudflare/assets"
binding = "ASSETS"

# wrangler.toml (wrangler v3.88.0^)
[observability.logs]
enabled = true
```

## Deployment

The app is fully deployed on Cloudflare Workers:

1. **Build**: `npm run build` (creates Cloudflare Worker bundle)
2. **Deploy**: `npm run deploy` (uploads to Cloudflare)
3. **Live URL**: https://pebble.savinpokharel.workers.dev

### Deployment Configuration
- **Adapter**: @sveltejs/adapter-cloudflare
- **Assets**: Static files served via Cloudflare Assets binding
- **KV**: Temporary storage for sync data with TTL
- **Secrets**: Master secret for API authentication

## Development Workflow

1. **Local Development**: `npm run dev` (Vite dev server)
2. **Full Stack Testing**: `npm run wrangler:dev` (Cloudflare Workers locally)
3. **Build**: `npm run build`
4. **Deploy**: `npm run deploy`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and test with `npm run wrangler:dev`
4. Run checks: `npm run check`
5. Commit your changes: `git commit -am 'Add some feature'`
6. Push to the branch: `git push origin feature/your-feature`
7. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Related Projects

- [Pebble Sync](https://github.com/your-org/pebble-sync) - Obsidian plugin for syncing Pebble data (planned)
