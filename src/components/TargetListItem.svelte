<script lang="ts">
	import { Icon } from "@steeze-ui/svelte-icon"
	import { Github, Check } from "@steeze-ui/lucide-icons"
	import { Dialog, Tooltip } from "bits-ui"
	import type { CBTarget } from "$lib/cloudBuildTypes"

	interface Props {
		target: CBTarget
	}

	let { target }: Props = $props()
</script>

<div
	class="card preset-tonal-secondary lg:p-4 p-3 flex gap-4 justify-between items-center overflow-hidden"
>
	<div class="gap-2 flex items-center min-w-0">
		<a href={`/targets/${target.target}`} class="fancy-link w-fit h-fit truncate shrink"
			>{target.target}</a
		>
		<Tooltip.Root>
			<Tooltip.Trigger>
				<span class="text-xs! badge preset-tonal-tertiary shrink-0">{target.manufacturerId}</span>
			</Tooltip.Trigger>
			<Tooltip.Content sideOffset={12}>
				<span class="p-2 rounded-xl border-2 border-surface-500 preset-filled-surface-400-600"
					>{target.manufacturer}</span
				>
			</Tooltip.Content>
		</Tooltip.Root>
		{#if target.group === "supported"}
			<Tooltip.Root>
				<Tooltip.Trigger class="flex h-fit shrink-0">
					<span class="text-xs! badge-icon preset-filled-success-500 p-1.5">
						<Icon src={Check} size="2rem" stroke-width={3} />
					</span>
				</Tooltip.Trigger>
				<Tooltip.Content sideOffset={12}>
					<span class="p-2 rounded-xl border-2 border-surface-500 preset-filled-surface-400-600"
						>Officially Supported</span
					>
				</Tooltip.Content>
			</Tooltip.Root>
		{/if}
	</div>
	<div class="flex shrink-0">
		<a
			href={`https://github.com/betaflight/config/blob/master/configs/${target.target}/config.h`}
			target="_blank"
			rel="noopener noreferrer"
			class="hover:text-primary-500 w-fit h-fit bg-transparent hover:bg-primary-500/10 aspect-square p-1 rounded-lg"
		>
			<Icon src={Github} size="1.5rem" />
		</a>
	</div>
</div>
