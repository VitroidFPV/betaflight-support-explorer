<script lang="ts">
	import { fly } from "svelte/transition"
	import { Switch } from "@skeletonlabs/skeleton-svelte"
	import { settings } from "$lib/stores/settings"
	import { problemDefinitions } from "$lib/problems/definitions"

	// get problem ids and titles
	const problems = $derived(problemDefinitions.map((p) => ({ id: p.id, title: p.title })))

	function toggleHiddenCheck(id: string) {
		if ($settings.hiddenProblems.includes(id)) {
			$settings.hiddenProblems = $settings.hiddenProblems.filter((i) => i !== id)
		} else {
			$settings.hiddenProblems = [...$settings.hiddenProblems, id]
		}
		console.log("hiddenChecks", $settings.hiddenProblems)
	}
</script>

<svelte:head>
	<title>Settings - Betaflight Support Explorer</title>
	<meta name="description" content="Configure the settings for the Betaflight Support Explorer" />

	<meta property="og:title" content="Settings - Betaflight Support Explorer" />
	<meta property="og:url" content="https://betaflight-support-explorer.netlify.app/settings" />
	<meta property="og:type" content="website" />
	<meta
		property="og:description"
		content="Configure the settings for the Betaflight Support Explorer"
	/>
	<meta name="theme-color" content="#ffbb00" />
</svelte:head>

<div
	class="flex flex-col h-full w-full md:p-16 md:pt-8 p-4 pb-6 2xl:px-40 gap-6 relative"
	in:fly={{ x: 500, duration: 400 }}
>
	<h1 class="text-primary-500 font-bold h1 lg:pt-24">Settings</h1>

	<div class="grid md:grid-cols-2 grid-cols-1 gap-6">
		<div class="flex flex-col w-full gap-6">
			<div class="card preset-tonal-secondary p-4 flex flex-col gap-4">
				<header class="h3 font-bold">ID Preview Card</header>
				<section class="text-lg flex flex-col gap-2">
					<div class="flex gap-2 flex-row flex-wrap">
						<div class="text-neutral-400 mr-1 text-base">
							Data to display in the ID Preview Card
						</div>
					</div>
					<div class="flex flex-col gap-2">
						{#each $settings.idPreviewCardSettings as setting, i (i)}
							<div class="flex flex-row justify-between">
								<div class="mr-1 text-base">{setting.title}:</div>
								<Switch
									checked={setting.value}
									name={setting.name}
									onCheckedChange={() => (setting.value = !setting.value)}
									thumbInactive="bg-surface-300"
									controlInactive="bg-surface-500"
								/>
							</div>
						{/each}
					</div>
				</section>
			</div>
		</div>

		<div class="flex flex-col w-full gap-6">
			<div class="card preset-tonal-secondary p-4 flex flex-col gap-4">
				<header class="h3 font-bold">Problem Detection</header>

				<section class="text-lg flex flex-col gap-2">
					<div class="flex flex-row justify-between">
						<div class="mr-1 text-base">Show warning when hiding problems</div>
						<Switch
							checked={$settings.showHideWarning}
							onCheckedChange={() => ($settings.showHideWarning = !$settings.showHideWarning)}
							thumbInactive="bg-surface-300"
							controlInactive="bg-surface-500"
						/>
					</div>
				</section>

				<hr class="border-surface-500" />

				<section class="text-lg flex flex-col gap-4">
					<div class="flex gap-2 flex-row flex-wrap justify-between items-center">
						<div class="text-neutral-400 mr-1 text-base">Show/hide problems in data analysis</div>
						<button
							class="btn btn-sm preset-filled-primary-500"
							onclick={() => {
								$settings.hiddenProblems = []
							}}
						>
							Show All
						</button>
					</div>
					<div class="flex flex-col gap-2">
						<!-- show switches for each problem. the title should use the title, the switch should use the id -->
						{#each problems as problem, i (i)}
							<div class="flex flex-row justify-between">
								<div class="mr-1 text-base">{problem.title}:</div>
								<!-- {#key $settings.hiddenChecks} -->
								<Switch
									checked={!$settings.hiddenProblems?.includes(problem.id)}
									onCheckedChange={() => toggleHiddenCheck(problem.id)}
									thumbInactive="bg-surface-300"
									controlInactive="bg-surface-500"
								/>
								<!-- {/key} -->
							</div>
						{/each}
					</div>
				</section>
			</div>
		</div>
	</div>
</div>
