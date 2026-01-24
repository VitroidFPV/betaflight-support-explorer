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

<!-- Padding top for the fixed navbar -->
<div class="max-w-screen overflow-x-hidden pt-32 lg:pt-16">
	<Nav />

	<Tooltip.Provider delayDuration={300}>{@render children?.()}</Tooltip.Provider>
</div>
