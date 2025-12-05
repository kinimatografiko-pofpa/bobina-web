import { defineConfig } from 'astro/config';

import { astroImageTools } from 'astro-imagetools';

import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
	integrations: [tailwind(), astroImageTools],
	redirects: {
		// Redirects will be generated dynamically from WordPress URLs
		// The [...redirect].astro page handles the actual redirect logic
	},
});
