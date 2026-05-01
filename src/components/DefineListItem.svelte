<script lang="ts">
	import { Icon } from "@steeze-ui/svelte-icon"
	import type { IconSource } from "@steeze-ui/svelte-icon"
	interface Props {
		icon: IconSource
		name: string
		value: string | string[] | null
	}

	let { icon, name, value }: Props = $props()

	const values = $derived(value ? (Array.isArray(value) ? value : [value]) : [])
</script>

<div class="flex flex-col gap-2">
	<div class="flex items-center gap-2">
		<Icon src={icon} size="1.5rem" />
		<span class="font-semibold font-mono text-xl">{name}</span>
	</div>
	{#if value}
		<div class="flex gap-2 flex-wrap">
			{#each values as item (item)}
				<span class="badge preset-tonal-primary w-fit">
					{item}
				</span>
			{/each}
		</div>
	{/if}
</div>
