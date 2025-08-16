<script lang="ts">
	import "../app.css"
	import Nav from "$components/Nav.svelte"
	import { Tooltip } from "bits-ui"

	interface Props {
		children?: import("svelte").Snippet
	}

	let { children }: Props = $props()
</script>

<div class="grid grid-rows-[auto_1fr_auto] max-w-screen overflow-x-hidden">
	<Nav />

	<Tooltip.Provider delayDuration={300}>{@render children?.()}</Tooltip.Provider>
</div>
