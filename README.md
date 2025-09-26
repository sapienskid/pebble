# Pebble

An offline-first Progressive Web App for capturing atomic notes, managing tasks, and setting reminders. Pebble Sync provides one-way synchronization of Pebble data into Obsidian daily notes.

## Current Implementation Status

- **Frontend**: SvelteKit app with TypeScript, Tailwind CSS v4, and adapter-cloudflare configured.
- **UI Framework**: bits-ui and shadcn-svelte components implemented, including button, calendar, card, checkbox, dialog, input, label, popover, select, separator, switch, textarea, and time-picker.
- **Component Architecture**: Three-tab interface (Capture, Plan, Remind) with corresponding dialogs for notes, tasks, reminders, and settings. Layout components (Header, TabNavigation) in place.
- **State Management**: Svelte stores for notes, tasks, reminders, settings, and theme using writable stores with mock data.
- **Dependencies**: All listed dependencies installed, including Dexie (not yet used for IndexedDB).
- **PWA Configuration**: Vite PWA plugin configured but basic; no manifest file created; service worker registration disabled.
- **Offline Features**: Not implemented - no IndexedDB, no background sync, no service worker logic.
- **Backend**: Cloudflare Workers with basic hello world; no API endpoints, KV bindings, or integrations implemented.
- **Development**: Dev server runs successfully; basic UI structure functional with mock data.

## Features

### Implemented
- Three-tab interface: Capture (notes), Plan (tasks), Remind (reminders)
- UI components using bits-ui and shadcn-svelte
- Svelte stores for state management with mock data
- Theme support (light/dark/device)
- Settings persistence (basic)

### Planned
- Offline-first functionality with IndexedDB
- Background sync for uploading when online
- One-way sync to Obsidian daily notes
- Notification support via ntfy
- Service worker with cache-first strategy
- Conflict resolution (local changes win)

## Tech Stack

### Frontend
- **Framework**: SvelteKit with adapter-cloudflare
- **Language**: Svelte 5.0.0 with TypeScript
- **Styling**: Tailwind CSS v4 with custom design system
- **UI Components**: bits-ui and shadcn-svelte
- **Icons**: @lucide/svelte and @iconify/svelte
- **Date Handling**: date-fns
- **Utilities**: clsx, tailwind-merge, tailwind-variants, unplugin-icons

### Backend
- **Runtime**: Cloudflare Workers (basic hello world implementation)
- **Storage**: Cloudflare KV (not yet configured)
- **Language**: TypeScript

## Prerequisites

- Node.js 18+
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pebble
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd workers
npm install
```

## Development

### Frontend Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Backend Development

Start the Workers development server:
```bash
cd workers
npm run start
```

The API will be available at `http://localhost:8787` (basic hello world response)

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
│   │   │   └── ui/
│   │   │       ├── button/
│   │   │       ├── calendar/
│   │   │       ├── card/
│   │   │       ├── checkbox/
│   │   │       ├── dialog/
│   │   │       ├── input/
│   │   │       ├── label/
│   │   │       ├── popover/
│   │   │       ├── select/
│   │   │       ├── separator/
│   │   │       ├── switch/
│   │   │       ├── textarea/
│   │   │       └── time-picker/
│   │   ├── stores/
│   │   │   ├── notes.ts
│   │   │   ├── tasks.ts
│   │   │   ├── reminders.ts
│   │   │   ├── settings.ts
│   │   │   └── theme.ts
│   │   ├── utils.ts
│   │   └── assets/
│   ├── routes/
│   │   ├── +layout.svelte
│   │   └── +page.svelte
│   ├── app.css
│   ├── app.d.ts
│   └── app.html
├── workers/
│   ├── src/
│   │   ├── index.ts          # Main request handler (basic hello world)
│   │   ├── routes/           # Empty - API routes to be implemented
│   │   ├── services/         # Empty - Services to be implemented
│   │   └── types/            # Empty - Type definitions to be implemented
│   ├── wrangler.jsonc        # Basic config, no KV bindings yet
│   ├── package.json
│   ├── tsconfig.json
│   └── vitest.config.mts
├── static/
│   └── robots.txt
├── components.json
├── package.json
├── postcss.config.js
├── README.md
├── svelte.config.js
├── tsconfig.json
└── vite.config.ts
```

## Data Models

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

## Deployment

### Frontend Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy to Cloudflare Pages (not yet configured)

### Backend Deployment

Backend deployment is not yet implemented. Future steps:

1. Configure KV namespaces in `workers/wrangler.jsonc`
2. Implement API endpoints
3. Set up environment variables for integrations
4. Deploy with `wrangler deploy`

## Configuration

### Planned Integrations (Not Yet Implemented)

#### ntfy Notifications
- Set up ntfy instance
- Create notification topics
- Configure environment variables

#### Obsidian Sync
- Develop Pebble Sync plugin
- Configure API endpoints for data retrieval

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and add tests
4. Run the linter: `npm run lint`
5. Commit your changes: `git commit -am 'Add some feature'`
6. Push to the branch: `git push origin feature/your-feature`
7. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Related Projects

- [Pebble Sync](https://github.com/your-org/pebble-sync) - Obsidian plugin for syncing Pebble data (planned)
