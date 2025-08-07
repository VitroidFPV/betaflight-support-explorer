<!-- @component Code Block based on: https://shiki.style/ -->

<script module>
	import { createHighlighterCoreSync } from "shiki/core"
	import { createJavaScriptRegexEngine } from "shiki/engine/javascript"
	// Themes
	// https://shiki.style/themes
	import oneDarkPro from "shiki/themes/one-dark-pro.mjs"
	// Languages
	// https://shiki.style/languages
	import console from "shiki/langs/console.mjs"
	import html from "shiki/langs/html.mjs"
	import css from "shiki/langs/css.mjs"
	import js from "shiki/langs/javascript.mjs"
	import nim from "shiki/langs/nim.mjs"

	// https://shiki.style/guide/sync-usage
	const shiki = createHighlighterCoreSync({
		engine: createJavaScriptRegexEngine(),
		// Implement your import theme.
		themes: [oneDarkPro],
		// Implement your imported and supported languages.
		langs: [console, html, css, js, nim]
	})
</script>

<script lang="ts">
	import type { CodeBlockProps } from "./types"

	let {
		code = "",
		lang = "console",
		theme = "one-dark-pro",
		// Base Style Props
		base = " overflow-hidden",
		rounded = "rounded-container",
		shadow = "",
		classes = "",
		// Pre Style Props
		preBase = "",
		prePadding = "[&>pre]:p-4",
		preClasses = ""
	}: CodeBlockProps = $props()

	// Shiki convert to HTML
	const generatedHtml = shiki.codeToHtml(code, { lang, theme })
</script>

<div class="{base} {rounded} {shadow} {classes} {preBase} {prePadding} {preClasses}">
	<!-- Output Shiki's Generated HTML -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html generatedHtml}
</div>
