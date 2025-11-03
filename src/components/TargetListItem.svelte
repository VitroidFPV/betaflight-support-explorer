<script lang="ts">
	import { Icon } from "@steeze-ui/svelte-icon"
	import { Github } from "@steeze-ui/lucide-icons"

	interface Props {
		letter: string
		targets: string[]
	}

	let { letter, targets }: Props = $props()
</script>

<div class="flex flex-col lg:gap-4 gap-2">
	<h3 class="text-primary-500 h3 font-bold">{letter}</h3>
	<div class="grid lg:grid-cols-3 xl:grid-cols-4 grid-cols-1 gap-2 lg:gap-4">
		{#each targets as target, i (i)}
			<div class="card preset-tonal-secondary lg:p-4 p-3 flex gap-4 justify-between items-center">
				<a href={`/targets/${target}`} class="fancy-link w-fit h-fit">{target}</a>
				<div class="flex">
					<a
						href={`https://github.com/betaflight/config/blob/master/configs/${target}/config.h`}
						class="hover:text-primary-500 w-fit h-fit bg-transparent hover:bg-primary-500/10 aspect-square p-1 rounded-lg"
					>
						<Icon src={Github} size="1.5rem" />
					</a>
				</div>
			</div>
		{/each}
	</div>
</div>
