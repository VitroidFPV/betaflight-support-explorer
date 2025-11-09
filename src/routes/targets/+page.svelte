<script lang="ts">
	import { page } from "$app/state"
	import { fly } from "svelte/transition"
	import { Icon } from "@steeze-ui/svelte-icon"
	import { RefreshCw } from "@steeze-ui/lucide-icons"
	import { clearCache } from "$lib/stores/targetsCache"
	import { invalidateAll } from "$app/navigation"
	import TargetListItem from "$components/TargetListItem.svelte"
	import type { CBTarget } from "$lib/cloudBuildTypes"

	// Group targets by first character
	let groupedTargets = $derived(
		page.data.targets.reduce((acc: { [key: string]: CBTarget[] }, target: CBTarget) => {
			const firstChar = target.target.charAt(0).toUpperCase()
			const key = /[A-Z]/.test(firstChar) ? firstChar : "#"
			if (!acc[key]) {
				acc[key] = []
			}
			acc[key].push(target)
			return acc
		}, {})
	) as { [key: string]: CBTarget[] }

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
	let filteredTargetGroups = $derived(() => {
		if (!search.trim()) {
			return Object.entries(groupedTargets).map(([key, targets]) => ({
				letter: key,
				targets
			}))
		}
		const searchLower = search.toLowerCase()
		return Object.entries(groupedTargets)
			.map(([key, targets]) => ({
				letter: key,
				targets: targets.filter((target) => target.target.toLowerCase().includes(searchLower))
			}))
			.filter((group) => group.targets.length > 0)
	})

	const allTargets = $derived(page.data.targets)

	const allFilteredTargets = $derived(() => {
		if (!search.trim()) {
			return allTargets
		}
		const searchLower = search.toLowerCase()
		return allTargets.filter((target: CBTarget) =>
			target.target.toLowerCase().includes(searchLower)
		)
	})

	const title = $derived("Targets - Betaflight Support Explorer")
	const description = $derived(
		`Browse, search, and view all targets supported by Betaflight! Currently ${allTargets.length} total`
	)
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />

	<meta property="og:title" content={title} />
	<meta property="og:url" content="https://betaflight-support-explorer.netlify.app/" />
	<meta property="og:type" content="website" />
	<meta property="og:description" content={description} />
	<meta name="theme-color" content="#ffbb00" />
</svelte:head>

<div
	class="flex flex-col h-full max-w-screen md:p-16 md:pt-8 lg:p-4 p-2 pb-6 2xl:px-40 gap-6 relative"
	in:fly={{ x: 500, duration: 400 }}
>
	<div class="flex items-center gap-4 mt-10 flex-wrap justify-between">
		<div class="flex items-center gap-4 lg:w-fit w-full">
			<header class="text-primary-500 h3 font-bold h-fit">Targets</header>
			<input
				type="text"
				class="input h-12 lg:w-fit w-full"
				placeholder="Search"
				bind:value={search}
			/>
			<div class="text-sm text-surface-400">
				<span>{allFilteredTargets().length}</span>/<span>{allTargets.length}</span>
			</div>
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
	{#if allFilteredTargets().length > 0}
		{#each filteredTargetGroups() as targetGroup, index (index)}
			<div class="flex flex-col lg:gap-4 gap-2">
				<h3 class="text-primary-500 h3 font-bold">{targetGroup.letter}</h3>
				<div class="grid lg:grid-cols-3 xl:grid-cols-4 grid-cols-1 gap-2 lg:gap-4">
					{#each targetGroup.targets as target (target.target)}
						<TargetListItem {target} />
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
