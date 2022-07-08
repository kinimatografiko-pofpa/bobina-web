import { defineConfig } from 'astro/config';
import astroImagePlugin from 'astro-imagetools/plugin';

import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
	integrations: [tailwind()],
	vite: {
		plugins: [astroImagePlugin],
	},
});
