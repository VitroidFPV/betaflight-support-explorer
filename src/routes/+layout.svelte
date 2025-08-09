<script lang="ts">
	import "../app.css"
	import Nav from "$components/Nav.svelte"

	interface Props {
		children?: import("svelte").Snippet
	}

	let { children }: Props = $props()
</script>

<div class="grid grid-rows-[auto_1fr_auto]">
	<Nav />

	{@render children?.()}
</div>
