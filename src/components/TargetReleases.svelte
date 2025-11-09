<script lang="ts">
	import { Accordion } from "@skeletonlabs/skeleton-svelte"
	import { Icon } from "@steeze-ui/svelte-icon"
	import { ArrowUpRight } from "@steeze-ui/lucide-icons"
	import type { CBRelease } from "$lib/cloudBuildTypes"

	interface Props {
		releases: CBRelease[]
	}

	let { releases }: Props = $props()

	function releaseTypeToPreset(type: string): string {
		switch (type) {
			case "Stable":
				return "preset-tonal-success border border-success-500"
			case "Unstable":
				return "preset-tonal-error border border-error-500"
			case "ReleaseCandidate":
				return "preset-tonal-warning border border-warning-500"
			default:
				return "preset-tonal-surface border border-surface-500"
		}
	}

	function releaseTypeToColor(type: string): string {
		switch (type) {
			case "Stable":
				return "fancy-link-success"
			case "Unstable":
				return "fancy-link-error"
			case "ReleaseCandidate":
				return "fancy-link-warning"
			default:
				return "fancy-link"
		}
	}

	function releaseToUrl(release: CBRelease): string {
		if (release.label === "latest") {
			return `https://github.com/betaflight/betaflight/commits/master/`
		} else if (release.label === "special-release") {
			return `https://github.com/betaflight/betaflight/commits/master/`
		} else if (release.label === "pre-release") {
			return `https://github.com/betaflight/betaflight/commits/master/`
		} else {
			return `https://github.com/betaflight/betaflight/releases/tag/${release.release}`
		}
	}
	// in the future we may have more granular release tags, for now it's mostly master
</script>

<Accordion collapsible>
	<Accordion.Item
		classes="card preset-tonal-secondary"
		controlHover="hover:bg-primary-500/20"
		value="releases"
	>
		{#snippet control()}
			<header class="h2 font-bold mb-4 mt-3">Releases</header>
		{/snippet}
		{#snippet panel()}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
				{#each releases as release (release.release)}
					<div class="flex gap-2 card preset-tonal-secondary p-2 justify-between">
						<a
							href={releaseToUrl(release)}
							class="text-xl {releaseTypeToColor(
								release.type
							)} font-bold whitespace-nowrap fancy-link flex gap-1 items-center"
						>
							{release.release}
							<span class="self-start">
								<Icon src={ArrowUpRight} size="0.75rem" />
							</span>
						</a>
						<div class="badge {releaseTypeToPreset(release.type)}">
							{release.type}
						</div>
					</div>
				{/each}
			</div>
		{/snippet}
	</Accordion.Item>
</Accordion>
