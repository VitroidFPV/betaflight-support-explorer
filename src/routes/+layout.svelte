<script lang="ts">
	import "../app.css"
	import Nav from "$components/Nav.svelte"
	// Highlight JS
	import hljs from "highlight.js/lib/core"
	import "highlight.js/styles/github-dark.css"
	import xml from "highlight.js/lib/languages/xml" // for HTML
	import css from "highlight.js/lib/languages/css"
	import javascript from "highlight.js/lib/languages/javascript"
	import typescript from "highlight.js/lib/languages/typescript"
	import nim from "highlight.js/lib/languages/nim"

	hljs.registerLanguage("xml", xml) // for HTML
	hljs.registerLanguage("css", css)
	hljs.registerLanguage("javascript", javascript)
	hljs.registerLanguage("typescript", typescript)
	hljs.registerLanguage("nim", nim)
	// storeHighlightJs.set(hljs);

	// Floating UI for Popups
	// import { computePosition, autoUpdate, flip, shift, offset, arrow } from "@floating-ui/dom"

	interface Props {
		children?: import("svelte").Snippet
	}

	let { children }: Props = $props()
	// storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });
</script>

<div class="grid grid-rows-[auto_1fr_auto]">
	<Nav />

	{@render children?.()}
</div>
