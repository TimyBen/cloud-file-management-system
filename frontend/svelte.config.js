import adapter from "@sveltejs/adapter-node";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import path from "path";

const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		alias: {
			$lib: path.resolve("./src/lib"),
			$components: path.resolve("./src/components"),
			$assets: path.resolve("./src/assets")
		}
	}
};

export default config;
