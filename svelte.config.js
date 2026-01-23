import adapterAuto from "@sveltejs/adapter-auto"
import adapterNode from "@sveltejs/adapter-node"
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte"

// Use adapter-node for Docker/local Node, adapter-auto for Netlify/Cloudflare/Vercel
const adapter = process.env.ADAPTER === "node" ? adapterNode() : adapterAuto()

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: [".svelte"],
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: [vitePreprocess()],

	vitePlugin: {
		inspector: false
	},
	kit: {
		adapter,
		alias: {
			$components: "./src/components"
		}
	}
}
export default config
