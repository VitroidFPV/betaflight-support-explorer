<script lang="ts">
	import "../app.css"
	import Nav from "$components/Nav.svelte"
	import { Tooltip } from "bits-ui"

	interface Props {
		children?: import("svelte").Snippet
	}

	let { children }: Props = $props()
</script>

<svelte:head>
	<title>Betaflight Support Explorer</title>

	<meta property="og:title" content="Betaflight Support Explorer" />
	<meta property="og:url" content="https://betaflight-support-explorer.netlify.app/" />
	<meta property="og:type" content="website" />
	<meta name="theme-color" content="#ffbb00" />
</svelte:head>

<div class="grid grid-rows-[auto_1fr_auto] max-w-screen overflow-x-hidden">
	<Nav />

	<Tooltip.Provider delayDuration={300}>{@render children?.()}</Tooltip.Provider>
</div>
