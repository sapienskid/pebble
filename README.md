# Pebble

An offline-first Progressive Web App for capturing atomic notes, managing tasks, and setting reminders. Pebble Sync provides one-way synchronization of Pebble data into Obsidian daily notes.

## 🚀 Live Demo

**Production URL**: https://pebble.savinpokharel.workers.dev

## 📋 Quick Start

1. **Clone and Install**:
   ```bash
   git clone https://github.com/sapienskid/pebble.git
   cd pebble
   npm install
   ```

2. **Deploy to Cloudflare**:
   ```bash
   wrangler login
   wrangler secret put API_KEY  # Enter your API key when prompted
   npm run build && wrangler deploy
   ```

3. **Configure Cloudflare Access** (see [Deployment Guide](#deployment-guide))

4. **Use with Obsidian** (see [Obsidian Integration](#obsidian-integration))

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
- **Cloudflare account** with:
  - Cloudflare Workers enabled
  - Cloudflare Zero Trust (for Access protection)
  - Custom domain (optional but recommended)

## Installation & Local Development

1. **Clone the repository**:
```bash
git clone https://github.com/sapienskid/pebble.git
cd pebble
```

2. **Install dependencies**:
```bash
npm install
```

3. **Start development server**:
```bash
npm run dev
```
The app will be available at `http://localhost:5173`

**Note**: API endpoints require Cloudflare Workers environment. For full functionality:
```bash
npm run wrangler:dev  # Runs at http://localhost:8787
```

## Deployment Guide

### Step 1: Prepare Cloudflare Environment

1. **Login to Wrangler**:
```bash
wrangler login
```

2. **Create KV Namespace**:
```bash
wrangler kv:namespace create "PEBBLE_SYNC_KV"
```
Copy the namespace ID and update `wrangler.toml`:
```toml
[[kv_namespaces]]
binding = "PEBBLE_SYNC_KV"
id = "your-kv-namespace-id-here"
```

3. **Set API Key Secret**:
```bash
wrangler secret put API_KEY
```
Enter a secure API key when prompted. This will be used to protect your API endpoints.

### Step 2: Deploy Application

```bash
npm run build && wrangler deploy
```

Your app will be deployed to: `https://pebble.YOUR_SUBDOMAIN.workers.dev`

### Step 3: Configure Cloudflare Access

**Why Cloudflare Access?**
- Protects your web interface with authentication
- Leaves API endpoints open for Obsidian plugin access
- Provides secure, hassle-free login

#### 3.1 Set up Zero Trust

1. Go to **Cloudflare Dashboard** → **Zero Trust**
2. If first time, complete Zero Trust setup
3. Choose a **team domain** (e.g., `yourname.cloudflareaccess.com`)

#### 3.2 Create Access Application

1. Go to **Zero Trust** → **Access** → **Applications**
2. Click **Add an Application** → **Self-hosted**
3. **Configure Application**:
   ```
   Application name: Pebble Web Interface
   Subdomain: pebble
   Domain: YOUR_SUBDOMAIN.workers.dev
   Path: (leave empty to protect entire site)
   ```
4. **Session Duration**: Choose appropriate duration (e.g., 24 hours)

#### 3.3 Create Web Interface Policy

1. **Add Policy**:
   ```
   Policy name: Web Access Policy
   Action: Allow
   ```

2. **Configure Rules** (choose one):
   - **Email**: `your-email@domain.com` (simple)
   - **Email domain**: `@yourdomain.com` (team access)
   - **GitHub/Google**: Use OAuth providers
   - **One-time PIN**: Email-based PIN access

3. **Save** the policy

#### 3.4 Create API Bypass Policy

**Important**: API endpoints need to bypass Access for Obsidian plugin.

1. **Add another Application**:
   ```
   Application name: Pebble API Bypass
   Subdomain: pebble
   Domain: YOUR_SUBDOMAIN.workers.dev
   Path: /api/*
   ```

2. **Add Policy**:
   ```
   Policy name: API Bypass Policy
   Action: Bypass
   Configure rules: Everyone
   ```

3. **Save** the application

**Important**: Make sure the bypass application appears **first** in your application list.

### Step 4: Test Deployment

1. **Test Web Interface**:
   - Visit `https://pebble.YOUR_SUBDOMAIN.workers.dev`
   - Should redirect to Cloudflare Access login
   - After authentication, should show Pebble interface

2. **Test API Access**:
   ```bash
   curl -I "https://pebble.YOUR_SUBDOMAIN.workers.dev/api/sync/fetch" \
     -H "X-API-Key: YOUR_API_KEY"
   ```
   - Should return `HTTP/2 401` (API key required) not `HTTP/2 302` (redirect)

### Step 5: Configure Domain (Optional)

For a custom domain instead of `.workers.dev`:

1. **Add Custom Domain** in Cloudflare Workers
2. **Update DNS** to point to your worker
3. **Update Cloudflare Access** application domains
4. **Update wrangler.toml** routes if needed

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

### Sync API
- `POST /api/sync/push` - Push notes/tasks for sync (from PWA)
- `GET /api/sync/fetch` - Fetch sync data (for Obsidian plugin)

**Authentication**: All API endpoints require `X-API-Key` header with your secret API key.

**CORS**: Configured for `app://obsidian.md` origin to work with Obsidian plugin.

### Example Usage
```bash
# Push a note
curl -X POST "https://your-pebble.workers.dev/api/sync/push" \
  -H "X-API-Key: your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "note",
    "markdown": "This is a test note",
    "tags": ["test"]
  }'

# Fetch sync data  
curl "https://your-pebble.workers.dev/api/sync/fetch" \
  -H "X-API-Key: your-secret-key"
```

## Obsidian Integration

### Install Obsidian Plugin

1. **Download** the plugin files (`main.js`, `manifest.json`, `styles.css`)
2. **Create folder**: `.obsidian/plugins/pebble-sync/` in your vault
3. **Copy files** to the plugin folder
4. **Enable plugin** in Obsidian Settings → Community Plugins

### Configure Plugin

1. **Open** Obsidian Settings → Pebble Sync
2. **Set API URL**: `https://pebble.YOUR_SUBDOMAIN.workers.dev`
3. **Set API Key**: The same key you set with `wrangler secret put API_KEY`
4. **Configure sync options** (folder, templates, etc.)

### Usage

- **Manual sync**: Click the Pebble icon in the left ribbon
- **Command**: `Ctrl/Cmd + P` → "Pebble Sync: Import new notes"
- **Auto sync**: Enable in plugin settings

**Notes will be imported as**:
- Individual markdown files in your specified folder
- Linked to daily notes (if enabled)
- Tagged with `#pebble` and original tags

## Configuration

### Environment Variables (for ntfy notifications)
```bash
# Optional: For push notifications
VITE_NTFY_SERVER=your-ntfy-server
VITE_NTFY_TOPIC=your-topic  
VITE_NTFY_USERNAME=your-username
VITE_NTFY_PASSWORD=your-password
```

### Cloudflare Secrets
```bash
# Required: API authentication
wrangler secret put API_KEY
```

### Wrangler Configuration

**File**: `wrangler.toml`
```toml
# Production-only configuration
name = "pebble"
main = ".svelte-kit/cloudflare/_worker.js"
compatibility_date = "2025-09-24"

[assets]
directory = ".svelte-kit/cloudflare/assets"
binding = "ASSETS"

[[kv_namespaces]]
binding = "PEBBLE_SYNC_KV"
id = "your-kv-namespace-id"  # Replace with your KV namespace ID

[observability.logs]
enabled = true
```

### Required Cloudflare Services

1. **Cloudflare Workers** (Free tier sufficient)
2. **Cloudflare KV** (Free tier: 100,000 reads/day, 1,000 writes/day)
3. **Cloudflare Zero Trust** (Free tier: 50 users)

**Monthly Cost**: $0 for personal use with free tiers

## Troubleshooting

### Common Issues

**1. API returns 401 "API key required"**
- Check that you set the API key: `wrangler secret put API_KEY`
- Verify the key matches in Obsidian plugin settings
- Ensure you're sending `X-API-Key` header

**2. Obsidian plugin shows CORS errors**
- Verify API bypass policy is configured in Cloudflare Access
- Check that `/api/*` paths are not protected by Access
- Ensure the bypass application is first in the Access applications list

**3. Web interface redirects to Access but won't authenticate**
- Check your Access application domain matches your worker domain
- Verify your email is in the Allow policy
- Try a different authentication method (GitHub, Google, etc.)

**4. KV namespace errors during deployment**
- Create KV namespace: `wrangler kv:namespace create "PEBBLE_SYNC_KV"`
- Update the ID in `wrangler.toml`
- Redeploy: `wrangler deploy`

**5. Worker fails to start**
- Check logs: `wrangler tail`
- Verify all secrets are set: `wrangler secret list`
- Ensure Node.js version is 18+

### Getting Help

- **Issues**: [GitHub Issues](https://github.com/sapienskid/pebble/issues)
- **Discussions**: [GitHub Discussions](https://github.com/sapienskid/pebble/discussions)
- **Cloudflare Docs**: [Workers Documentation](https://developers.cloudflare.com/workers/)

## Development Workflow

### Local Development
1. `npm run dev` - Vite dev server (frontend only)
2. `npm run wrangler:dev` - Full stack with Workers locally

### Deployment
1. `npm run build` - Build for production
2. `wrangler deploy` - Deploy to Cloudflare

### Updating
1. Pull latest changes: `git pull origin main`
2. Install new dependencies: `npm install`  
3. Rebuild and deploy: `npm run build && wrangler deploy`

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Pebble PWA    │    │ Cloudflare      │    │ Obsidian Plugin │
│                 │    │ Workers + KV    │    │                 │
│ • Capture notes │◄──►│                 │◄──►│ • Sync notes    │
│ • Plan tasks    │    │ • API endpoints │    │ • Create files  │
│ • Set reminders │    │ • CORS handling │    │ • Link to daily │
│ • Offline mode  │    │ • Authentication│    │   notes         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐               │
         │              │ Cloudflare      │               │
         └──────────────►│ Access          │◄──────────────┘
                         │                 │
                         │ • Web UI auth   │
                         │ • API bypass    │
                         │ • Team domains  │
                         └─────────────────┘
```

**Security Model**:
- **Web Interface**: Protected by Cloudflare Access (human authentication)
- **API Endpoints**: Protected by API keys (machine authentication)  
- **Data Storage**: Encrypted in Cloudflare KV with TTL
- **CORS**: Restricted to Obsidian app origin

## Contributing

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/pebble.git`
3. **Create branch**: `git checkout -b feature/your-feature`
4. **Make changes** and test with `npm run wrangler:dev`
5. **Run checks**: `npm run check`
6. **Test deployment**: Create a test worker and deploy
7. **Commit**: `git commit -am 'Add some feature'`
8. **Push**: `git push origin feature/your-feature`
9. **Submit** a pull request

### Development Guidelines
- **Test locally** with `npm run wrangler:dev`
- **Check TypeScript**: `npm run check`
- **Test Obsidian integration** with your changes
- **Update documentation** if needed
- **Follow existing code style**

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Related Projects

- **Obsidian Plugin**: Included in `/plugin-main.js` (ready to use)
- **Cloudflare Workers**: Backend API (this repository)
- **SvelteKit PWA**: Frontend interface (this repository)

---

**Made with ❤️ for note-takers who want seamless capture and organization.**
