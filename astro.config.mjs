import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import astroImagePlugin from 'astro-imagetools/plugin';

// https://astro.build/config
export default defineConfig({
	integrations: [preact()],
	vite: {
		plugins: [astroImagePlugin],
	},
});
