<script lang="ts">
	import { fly } from "svelte/transition";
	import { Switch } from "@skeletonlabs/skeleton-svelte";
	import { settings } from "$lib/stores/settings";
</script>

<svelte:head>
	<title>{"Betaflight Support Explorer" + " - " + "Settings"}</title>

	<meta property="og:url" content="https://betaflight-support-explorer.netlify.app/settings" />
	<meta property="og:type" content="website" />
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
						{#each $settings.idPreviewCardSettings as setting}
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

		<div class="flex flex-col w-full gap-6"></div>
	</div>
</div>
