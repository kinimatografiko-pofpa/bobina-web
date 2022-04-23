import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import astroImagePlugin from 'astro-imagetools/plugin';

import turbolinks from "@astrojs/turbolinks";

// https://astro.build/config
export default defineConfig({
  integrations: [preact(), turbolinks()],
  vite: {
    plugins: [astroImagePlugin]
  }
});