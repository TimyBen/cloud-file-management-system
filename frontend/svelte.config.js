import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    // Project-level aliases for $components, $lib, $assets, etc.
    alias: {
      $components: path.resolve('./src/components'),
      $lib: path.resolve('./src/lib'),
      $assets: path.resolve('./src/assets'),
      $routes: path.resolve('./src/routes')
    }
  }
};

export default config;
