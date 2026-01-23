import adapterAuto from "@sveltejs/adapter-auto"
import adapterCloudflare from "@sveltejs/adapter-cloudflare"
import adapterNode from "@sveltejs/adapter-node"
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte"

// Select adapter based on ADAPTER env var:
// - "node" → Docker/local Node
// - "cloudflare" → Cloudflare Pages/Workers
// - default → adapter-auto (Netlify, Vercel, etc.)
function getAdapter() {
	switch (process.env.ADAPTER) {
		case "node":
			return adapterNode()
		case "cloudflare":
			return adapterCloudflare()
		default:
			return adapterAuto()
	}
}

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
		adapter: getAdapter(),
		alias: {
			$components: "./src/components"
		}
	}
}
export default config
