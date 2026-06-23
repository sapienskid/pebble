import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';
import Icons from 'unplugin-icons/vite';

export default defineConfig({
	plugins: [
		sveltekit(),
		SvelteKitPWA({
			manifest: {
				name: 'Pebble',
				short_name: 'Pebble',
				description: 'Atomic note taking and task management',
				start_url: '/',
				display: 'standalone',
				theme_color: '#000000',
				background_color: '#ffffff',
				icons: [
					{ src: '/favicon.svg', type: 'image/svg+xml', sizes: 'any' },
					{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
					{ src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
				],
				scope: '/',
				share_target: {
					action: '/share-target',
					method: 'GET',
					params: {
						title: 'title',
						text: 'text',
						url: 'url'
					}
				}
			}
		}),
		Icons({
			compiler: 'svelte'
		})
	]
});
