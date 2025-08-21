<script lang="ts">
	import { page } from "$app/state"
	import { fly } from "svelte/transition"
	import { Icon } from "@steeze-ui/svelte-icon"
	import { Github, RefreshCw } from "@steeze-ui/lucide-icons"
	import { clearCache } from "$lib/stores/targetsCache"
	import { invalidateAll } from "$app/navigation"

	// Group targets by first letter
	let groupedTargets = $derived(() => {
		const groups: { [key: string]: string[] } = {}

		page.data.targets.forEach((target: string) => {
			const firstChar = target.charAt(0).toUpperCase()
			// Check if first character is a letter (A-Z)
			const groupKey = /^[A-Z]$/.test(firstChar) ? firstChar : "#"

			if (!groups[groupKey]) {
				groups[groupKey] = []
			}
			groups[groupKey].push(target)
		})

		// Sort the groups by letter and sort targets within each group
		const sortedGroups: { letter: string; targets: string[] }[] = []
		Object.keys(groups)
			.sort((a, b) => {
				// Put '#' (non-alphabetic) group at the start
				if (a === "#") return -1
				if (b === "#") return 1
				return a.localeCompare(b)
			})
			.forEach((letter) => {
				sortedGroups.push({
					letter,
					targets: groups[letter].sort()
				})
			})

		return sortedGroups
	})

	let search = $state("")
	let isRefreshing = $state(false)

	async function refreshCache() {
		isRefreshing = true
		try {
			clearCache()
			await invalidateAll()
		} finally {
			isRefreshing = false
		}
	}

	// Filter targets in groupedTargets based on search
	let filteredTargets = $derived(() => {
		if (!search.trim()) {
			return groupedTargets()
		}
		const searchLower = search.toLowerCase()
		return groupedTargets()
			.map((group) => ({
				...group,
				targets: group.targets.filter((target) => target.toLowerCase().includes(searchLower))
			}))
			.filter((group) => group.targets.length > 0)
	})
</script>

<div
	class="flex flex-col h-full max-w-screen md:p-16 md:pt-8 lg:p-4 p-2 pb-6 2xl:px-40 gap-6 relative"
	in:fly={{ x: 500, duration: 400 }}
>
	<div class="flex items-center gap-4 mt-10 flex-wrap">
		<div class="flex items-center gap-4 lg:w-fit w-full">
			<header class="text-primary-500 h3 font-bold h-fit">Targets</header>
			<input
				type="text"
				class="input h-12 lg:w-fit w-full"
				placeholder="Search"
				bind:value={search}
			/>
		</div>
		<div class="flex gap-4 items-center lg:w-fit w-full justify-between">
			<button
				class="flex gap-2 items-center"
				onclick={refreshCache}
				disabled={isRefreshing}
				title="Refresh targets from GitHub"
			>
				<Icon src={RefreshCw} size="1.2rem" class={isRefreshing ? "animate-spin" : ""} />
				{isRefreshing ? "Refreshing..." : "Refresh"}
			</button>
			{#if page.data.fromCache}
				<div class="text-sm text-surface-400">Loaded from cache</div>
			{/if}
		</div>
	</div>
	<hr class="border-surface-500" />

	{#if filteredTargets().length > 0}
		{#each filteredTargets() as targetGroup, i (i)}
			<div class="flex flex-col lg:gap-4 gap-2">
				<h3 class="text-primary-500 h3 font-bold">{targetGroup.letter}</h3>
				<div class="grid lg:grid-cols-3 xl:grid-cols-4 grid-cols-1 gap-2 lg:gap-4">
					{#each targetGroup.targets as target, i (i)}
						<div
							class="card preset-tonal-secondary lg:p-4 p-3 flex gap-4 justify-between items-center"
						>
							<a href={`/targets/${target}`} class="fancy-link w-fit h-fit">{target}</a>
							<div class="flex">
								<a
									href={`/targets/${target}`}
									class="hover:text-primary-500 w-fit h-fit bg-transparent hover:bg-primary-500/10 aspect-square p-1 rounded-lg"
								>
									<Icon src={Github} size="1.5rem" />
								</a>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	{:else}
		<div class="flex flex-col gap-4">
			<h3 class="text-primary-500 h3 font-bold">No targets found</h3>
		</div>
	{/if}
</div>
