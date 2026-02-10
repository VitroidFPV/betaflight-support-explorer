<script lang="ts">
	import { page } from "$app/state"
	import { fly } from "svelte/transition"
	import { Icon } from "@steeze-ui/svelte-icon"
	import { RefreshCw, ArrowUp } from "@steeze-ui/lucide-icons"
	import { clearCache } from "$lib/stores/targetsCache"
	import { invalidateAll, replaceState } from "$app/navigation"
	import { browser } from "$app/environment"
	import TargetListItem from "$components/TargetListItem.svelte"
	import type { CBTarget } from "$lib/cloudBuildTypes"
	import { SvelteMap } from "svelte/reactivity"

	const groupOptions = [
		{ label: "alphabetical", value: "alphabetical" },
		{ label: "manufacturer", value: "manufacturer" },
		{ label: "support status", value: "supportStatus" },
		{ label: "MCU", value: "mcu" }
	]

	// Initialize state from URL params
	const groupParam = page.url.searchParams.get("group")
	const validatedGroup =
		groupOptions.some((opt) => opt.value === groupParam) ? groupParam! : groupOptions[0].value
	let selectedGroupOption = $state(validatedGroup)
	let sortDescending = $state(page.url.searchParams.get("sort") === "desc")
	let search = $state(page.url.searchParams.get("q") || "")

	// Sync state to URL params
	$effect(() => {
		if (!browser) return

		const url = new URL(window.location.href)

		if (selectedGroupOption !== groupOptions[0].value) {
			url.searchParams.set("group", selectedGroupOption)
		} else {
			url.searchParams.delete("group")
		}

		if (sortDescending) {
			url.searchParams.set("sort", "desc")
		} else {
			url.searchParams.delete("sort")
		}

		if (search.trim()) {
			url.searchParams.set("q", search.trim())
		} else {
			url.searchParams.delete("q")
		}

		replaceState(url, {})
	})

	const allTargets = $derived(page.data.targets as CBTarget[])

	const allFilteredTargets = $derived.by(() => {
		if (!search.trim()) {
			return allTargets
		}
		const searchLower = search.toLowerCase()
		return allTargets.filter((target: CBTarget) =>
			target.target.toLowerCase().includes(searchLower)
		)
	})

	type TargetGroup = {
		groupTitle: string
		groupTargets: CBTarget[]
	}

	// Helper function to sort targets within a group
	const sortTargets = (targets: CBTarget[]) => {
		return targets.sort((a, b) => {
			const comparison = a.target.localeCompare(b.target)
			return sortDescending ? -comparison : comparison
		})
	}

	// Helper function to sort groups
	const sortGroups = (a: string, b: string, specialLast?: string) => {
		if (specialLast) {
			if (a === specialLast) return 1
			if (b === specialLast) return -1
		}
		const comparison = a.localeCompare(b)
		return sortDescending ? -comparison : comparison
	}

	// Group targets based on selected group option
	let groupedTargets: TargetGroup[] = $derived.by(() => {
		const targets = allFilteredTargets
		const groups = new SvelteMap<string, CBTarget[]>()

		if (selectedGroupOption === "alphabetical") {
			for (const target of targets) {
				const firstChar = target.target.charAt(0).toUpperCase()
				const key = /[A-Z]/.test(firstChar) ? firstChar : "#"
				if (!groups.has(key)) groups.set(key, [])
				groups.get(key)!.push(target)
			}
			// Sort alphabetically, with # at the end
			return Array.from(groups.entries())
				.sort(([a], [b]) => sortGroups(a, b, "#"))
				.map(([key, groupTargets]) => ({
					groupTitle: key,
					groupTargets: sortTargets([...groupTargets])
				}))
		} else if (selectedGroupOption === "manufacturer") {
			for (const target of targets) {
				const key = target.manufacturer || "Unknown"
				if (!groups.has(key)) groups.set(key, [])
				groups.get(key)!.push(target)
			}
			return Array.from(groups.entries())
				.sort(([a], [b]) => sortGroups(a, b, "Unknown"))
				.map(([key, groupTargets]) => ({
					groupTitle: key,
					groupTargets: sortTargets([...groupTargets])
				}))
		} else if (selectedGroupOption === "supportStatus") {
			for (const target of targets) {
				const key =
					target.group === "supported" ? "Officially Supported" : "Manufacturer/Community Supported"
				if (!groups.has(key)) groups.set(key, [])
				groups.get(key)!.push(target)
			}
			// Sort by priority: Officially Supported always first (regardless of sort direction)
			const priority = ["Officially Supported", "Manufacturer/Community Supported"]
			return Array.from(groups.entries())
				.sort(([a], [b]) => priority.indexOf(a) - priority.indexOf(b))
				.map(([key, groupTargets]) => ({
					groupTitle: key,
					groupTargets: sortTargets([...groupTargets])
				}))
		} else if (selectedGroupOption === "mcu") {
			for (const target of targets) {
				const key = target.mcu || "Unknown"
				if (!groups.has(key)) groups.set(key, [])
				groups.get(key)!.push(target)
			}
			return Array.from(groups.entries())
				.sort(([a], [b]) => sortGroups(a, b, "Unknown"))
				.map(([key, groupTargets]) => ({
					groupTitle: key,
					groupTargets: sortTargets([...groupTargets])
				}))
		}

		return []
	})

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
		<div class="flex items-center gap-4 lg:w-fit w-full flex-wrap">
			<!-- <header class="text-primary-500 h3 font-bold h-fit">Targets</header> -->
			<input
				type="text"
				class="input h-12 lg:w-fit w-full min-w-[16rem]"
				placeholder="search"
				bind:value={search}
			/>
			<div class="text-sm text-surface-400">
				<span>{allFilteredTargets.length}</span>/<span>{allTargets.length}</span>
			</div>
			<span class="vr border-l-2 h-8"></span>
			<span class="text-sm text-surface-400 whitespace-nowrap">group by / desc/asc:</span>
			<select class="select h-12 w-fit" bind:value={selectedGroupOption}>
				{#each groupOptions as option (option.value)}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
			<button
				class="btn btn-sm preset-tonal-secondary aspect-square"
				onclick={() => (sortDescending = !sortDescending)}
			>
				<Icon
					src={ArrowUp}
					size="1.2rem"
					class={`${sortDescending ? "rotate-180" : ""} transition-transform duration-200`}
				/>
			</button>
		</div>
		<div class="flex gap-4 items-center lg:w-fit w-full justify-between">
			<button
				class="flex gap-2 items-center hover:text-primary-500 duration-200"
				onclick={refreshCache}
				disabled={isRefreshing}
				title="Refresh targets from GitHub"
			>
				<Icon src={RefreshCw} size="1.2rem" class={isRefreshing ? "animate-spin" : ""} />
				{isRefreshing ? "Refreshing..." : "Refresh"}
			</button>
			{#if page.data.fromCache}
				<div class="text-sm text-surface-400">loaded from cache</div>
			{/if}
		</div>
	</div>
	<hr class="border-surface-500" />
	{#if allFilteredTargets.length > 0}
		{#each groupedTargets as targetGroup, index (index)}
			<div class="flex flex-col lg:gap-4 gap-2">
				<h3 class="text-primary-500 h3 font-bold">{targetGroup.groupTitle}</h3>
				<div class="grid lg:grid-cols-3 xl:grid-cols-4 grid-cols-1 gap-2 lg:gap-4">
					{#each targetGroup.groupTargets as target (target.target)}
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
