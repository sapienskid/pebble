
**Pebble**: An offline-first Progressive Web App for capturing atomic notes, managing tasks, and setting reminders. **Pebble Sync**: An Obsidian plugin for one-way synchronization of Pebble data into daily notes.

### Current Implementation Status

- **Project Setup**: SvelteKit app with TypeScript, Tailwind CSS v4, and adapter-cloudflare configured.
- **UI Framework**: bits-ui and shadcn-svelte components implemented, including button, calendar, card, checkbox, dialog, input, label, popover, select, separator, switch, textarea, and time-picker.
- **Component Architecture**: Three-tab interface (Capture, Plan, Remind) with corresponding dialogs for notes, tasks, reminders, and settings. Layout components (Header, TabNavigation) in place.
- **State Management**: Svelte stores for notes, tasks, reminders, settings, and theme using writable stores with mock data.
- **Dependencies**: All listed dependencies installed, including Dexie (not yet used for IndexedDB).
- **PWA Configuration**: Vite PWA plugin configured but basic; no manifest file created; service worker registration disabled.
- **Offline Features**: Not implemented - no IndexedDB, no background sync, no service worker logic.
- **Backend**: Cloudflare Workers with basic hello world; no API endpoints, KV bindings, or integrations implemented.
- **Development**: Dev server runs successfully; basic UI structure functional with mock data.

### Core Requirements

- Single-user application (protected by Cloudflare Access)
- Offline-first functionality with background sync
- Atomic notes (max 500 characters)
- Three-tab interface: Capture (notes), Plan (tasks), Remind (reminders)
- One-way sync to Obsidian daily notes
- Theme support (light/dark/device)
- Settings persistence

---

## 1. Pebble App (SvelteKit PWA)

### 1.1 Architecture

**Frontend Stack:**

- SvelteKit with adapter-cloudflare
- Svelte 5.0.0 for type safety and modern syntax
- TypeScript for type safety
- Tailwind CSS v4 for styling with custom design system
- bits-ui for accessible UI components
- shadcn-svelte for component library
- @lucide/svelte and @iconify/svelte for icons
- date-fns for date manipulation
- clsx, tailwind-merge, tailwind-variants for utility functions
- unplugin-icons for icon compilation

**Offline Strategy:**

- Cache-first approach using Service Workers
- IndexedDB for local data persistence
- Background sync for uploading when online
- Conflict resolution: local changes always win

**Key Dependencies:**

```json
{
  "@sveltejs/adapter-cloudflare": "^7.2.3",
  "@sveltejs/kit": "^2.22.0",
  "@vite-pwa/sveltekit": "^1.0.0",
  "svelte": "^5.0.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^4.1.13",
  "@tailwindcss/postcss": "^4.1.13",
  "bits-ui": "^2.11.4",
  "shadcn-svelte": "^1.0.7",
  "@lucide/svelte": "^0.544.0",
  "@iconify/svelte": "^5.0.2",
  "@iconify-json/streamline-freehand": "^1.2.1",
  "@iconify-json/lucide": "^1.2.68",
  "date-fns": "^4.1.0",
  "dexie": "^4.2.0",
  "uuid": "^13.0.0",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.3.1",
  "tailwind-variants": "^3.1.1",
  "unplugin-icons": "^22.3.0"
}
```

**Development Scripts:**

```json
{
  "dev": "vite dev",
  "build": "vite build",
  "preview": "vite preview",
  "prepare": "svelte-kit sync || echo ''",
  "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
  "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch"
}
```

**Tailwind CSS v4 Setup:**

- Uses `@import "tailwindcss"` in app.css
- PostCSS config with `@tailwindcss/postcss` plugin
- Custom CSS variables for theming with light/dark modes
- `@theme inline` for custom theme variables

### 1.2 Data Models

```typescript
// Base interface (currently only used in reminders)
interface BaseItem {
  id: string;
  timestamp: string; // ISO 8601
  synced: boolean;
  createdAt: string;
  updatedAt: string;
}

// Notes (Capture tab) - currently missing BaseItem fields
interface Note {
  id: string;
  content: string; // max 2 sentences
  timestamp: string;
  tags: string[];
}

// Tasks (Plan tab) - missing BaseItem fields except type
interface Task {
  id: string;
  type: 'task';
  title: string;
  description?: string;
  timeSlot: 'morning' | 'afternoon' | 'evening';
  scheduledTime?: string; // "9:30 AM"
  completed: boolean;
  googleTaskId?: string; // from Google Tasks API
}

// Reminders (Remind tab)
interface Reminder extends BaseItem {
  type: 'reminder';
  title: string;
  description?: string;
  scheduledFor: string; // ISO 8601
  reminderType: 'one-time' | 'recurring';
  recurring?: 'daily' | 'weekly' | 'monthly';
  completed: boolean;
  notified: boolean;
}
```

### 1.3 IndexedDB Schema (using Dexie)

```typescript
import Dexie, { Table } from 'dexie';

class PebbleDB extends Dexie {
  notes!: Table<Note>;
  tasks!: Table<Task>;
  reminders!: Table<Reminder>;

  constructor() {
    super('PebbleDB');
    this.version(1).stores({
      notes: 'id, timestamp, synced, type, tags',
      tasks: 'id, timestamp, synced, type, timeSlot, completed',
      reminders: 'id, timestamp, synced, type, scheduledFor, reminderType'
    });
  }
}
```

**Note:** IndexedDB implementation is not yet implemented. The stores currently use Svelte writable stores with mock data.

### 1.3.1 Stores

The application uses Svelte stores for state management:

```typescript
// Theme store with localStorage persistence
type Theme = 'light' | 'dark' | 'device';

// Settings store
interface Settings {
  syncEnabled: boolean;
  apiKey: string;
  autoSyncOnStart: boolean;
}
```

### 1.4 Service Worker Strategy

**Note:** Service worker is currently disabled in svelte.config.js (register: false). Enable it once implementation is ready.

**Cache Strategy:**

- App shell: Cache first
- API calls: Network first with fallback
- Static assets: Stale while revalidate

**Background Sync:**

- Register sync events for unsynced data
- Retry mechanism with exponential backoff
- Batch sync operations

```typescript
// service-worker.ts
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncPendingData());
  }
});
```

### 1.5 Component Architecture

```
src/
├── lib/
│   ├── components/
│   │   ├── tabs/
│   │   │   ├── CaptureTab.svelte
│   │   │   ├── PlanTab.svelte
│   │   │   └── RemindTab.svelte
│   │   ├── dialogs/
│   │   │   ├── NoteDialog.svelte
│   │   │   ├── ReminderDialog.svelte
│   │   │   ├── SettingsDialog.svelte
│   │   │   └── TaskDialog.svelte
│   │   ├── layout/
│   │   │   ├── Header.svelte
│   │   │   └── TabNavigation.svelte
│   │   └── ui/
│   │       ├── button/
│   │       ├── calendar/
│   │       ├── card/
│   │       ├── checkbox/
│   │       ├── dialog/
│   │       ├── input/
│   │       ├── label/
│   │       ├── popover/
│   │       ├── select/
│   │       ├── separator/
│   │       ├── switch/
│   │       ├── textarea/
│   │       └── time-picker/
│   ├── stores/
│   │   ├── notes.ts
│   │   ├── tasks.ts
│   │   ├── reminders.ts
│   │   ├── settings.ts
│   │   └── theme.ts
│   ├── utils.ts
│   └── assets/
├── routes/
│   └── +layout.svelte
│   └── +page.svelte
└── app.html
```

**UI Components:** Built using bits-ui and shadcn-svelte with tailwind-variants for styling variants.

**Utility Functions:**
- `cn()`: Combines clsx and tailwind-merge for conditional classes
- `getTagIcon()`: Returns icon for note tags
- `getTimeSlot()`: Determines time slot from time string
- `formatTime12Hour()`: Converts time to 12-hour format
- `getRelativeTime()`: Formats relative time display

### 1.6 PWA Configuration

**Note:** Manifest file (app.webmanifest) is not yet created. Vite PWA is configured but basic.

**Manifest (app.webmanifest):**

```json
{
  "name": "Pebble",
  "short_name": "Pebble",
  "description": "Atomic note taking and task management",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

**Vite PWA Config:**

```typescript
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';
import Icons from 'unplugin-icons/vite';

export default defineConfig({
  plugins: [
    sveltekit(),
    SvelteKitPWA(),
    Icons({
      compiler: 'svelte'
    })
  ]
});
```

---

## 2. Cloudflare Workers Backend

### 2.1 Architecture

**Note:** Cloudflare Workers backend is currently a basic hello world implementation. API endpoints, KV bindings, and integrations are not yet implemented.

**Worker Structure:**

```
/workers/
├── src/
│   ├── index.ts          # Main request handler (basic hello world)
│   ├── routes/           # Empty - API routes to be implemented
│   ├── services/         # Empty - Services to be implemented
│   └── types/            # Empty - Type definitions to be implemented
├── wrangler.jsonc        # Basic config, no KV bindings yet
└── package.json          # Basic setup with wrangler
```

### 2.2 KV Storage Strategy

**Key Structure:**

```
notes:YYYY-MM-DD:HHMMSS:uuid
tasks:YYYY-MM-DD:HHMMSS:uuid
reminders:YYYY-MM-DD:HHMMSS:uuid
```

**KV Operations:**

```typescript
// Store data with timestamp-based keys
async function storeItem(env: Env, item: Note | Task | Reminder) {
  const date = new Date(item.timestamp);
  const key = `${item.type}:${date.toISOString().split('T')[0]}:${date.toISOString().split('T')[1].replace(/[:.]/g, '')}:${item.id}`;
  await env.PEBBLE_KV.put(key, JSON.stringify(item));
}

// Fetch items by date range
async function getItemsByDate(env: Env, type: string, date: string) {
  const prefix = `${type}:${date}:`;
  const list = await env.PEBBLE_KV.list({ prefix });
  // Fetch all items...
}
```

### 2.3 API Endpoints

**POST /api/sync**

- Accept batch of items from PWA
- Store in KV with appropriate keys
- Return sync confirmation

**GET /api/sync/:date**

- Return all items for specific date
- Used by Obsidian plugin

**POST /api/tasks/google**

- Sync tasks with Google Tasks API
- Handle OAuth with service account

**POST /api/reminders/ntfy**

- Send notifications via ntfy
- Schedule recurring reminders

### 2.4 Google Tasks Integration

```typescript
import { JWT } from 'google-auth-library';

class GoogleTasksService {
  private jwt: JWT;

  constructor(credentials: any) {
    this.jwt = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/tasks']
    });
  }

  async createTask(task: Task) {
    await this.jwt.authorize();
    // Create task in Google Tasks
  }
}
```

### 2.5 Environment Variables

**Environment Variables**

```jsonc
// wrangler.jsonc - current basic config
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "throbbing-art-03c8",
  "main": "src/index.ts",
  "compatibility_date": "2025-09-24",
  "compatibility_flags": ["global_fetch_strictly_public"],
  "assets": {
    "directory": "./public"
  },
  "observability": {
    "enabled": true
  }
}
```
