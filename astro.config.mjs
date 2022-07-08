import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import astroImagePlugin from 'astro-imagetools/plugin';

import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
	integrations: [preact(), tailwind()],
	vite: {
		plugins: [astroImagePlugin],
	},
});
