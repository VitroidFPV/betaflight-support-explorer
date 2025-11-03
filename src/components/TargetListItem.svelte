<script lang="ts">
	import { Icon } from "@steeze-ui/svelte-icon"
	import { Github } from "@steeze-ui/lucide-icons"
	import type { Target } from "$lib/stores/targetsCache.js"

	interface Props {
		target: Target
	}

	let { target }: Props = $props()
</script>

<div class="card preset-tonal-secondary lg:p-4 p-3 flex gap-4 justify-between items-center">
	<a href={`/targets/${target.target}`} class="fancy-link w-fit h-fit">{target.target}</a>
	<div class="flex">
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
