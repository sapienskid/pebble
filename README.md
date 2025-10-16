# Pebble

An offline-first Progressive Web App for capturing atomic notes, managing tasks, and setting reminders. Pebble Sync provides one-way synchronization of Pebble data into Obsidian daily notes.

## 🚀 Live Demo

**Production URL**: https://pebble.savinpokharel.workers.dev

## ✨ Key Features

- **Offline-first**: Works seamlessly without an internet connection.
- **PWA**: Installable on your mobile device or desktop.
- **Obsidian Sync**: One-way sync to your Obsidian daily notes.
- **Capture**: Atomic notes, tasks, and reminders.
- **Themeable**: Light, dark, and device theme support.
- **Private**: Your data is stored on your device and your own Cloudflare account.

## 🛠️ Tech Stack

- **Framework**: SvelteKit
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI**: shadcn-svelte
- **Database**: IndexedDB with Dexie.js
- **Backend**: Cloudflare Workers
- **Deployment**: Wrangler

## 🚀 Quick Start

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/sapienskid/pebble.git
    cd pebble
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run the development server**:
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:5173`.

    For full-stack local development with Cloudflare Workers:
    ```bash
    npm run wrangler:dev
    ```

## ⚫ Obsidian Integration

The sync to Obsidian is handled by a companion plugin. The API is ready, and the plugin is in development.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.