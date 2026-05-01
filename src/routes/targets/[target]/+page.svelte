<script lang="ts">
	import { page } from "$app/state"
	import { fly } from "svelte/transition"
	import CodeBlock from "$components/CodeBlock/CodeBlock.svelte"
	import { Icon } from "@steeze-ui/svelte-icon"
	import { Github, Microchip, Rotate3d, Thermometer, Compass } from "@steeze-ui/lucide-icons"
	import TargetReleases from "$components/TargetReleases.svelte"
	import { Accordion } from "@skeletonlabs/skeleton-svelte"
	import DefineListItem from "$components/DefineListItem.svelte"
	// console.log(page.params.target)
	const targetName = page.params.target

	const { data } = $props()

	let target = $derived(data.config)
	let manufacturer = $derived(data.manufacturer)
	let cloudBuildTarget = $derived(data.cloudBuildTarget)
	let definesAccordionValue = $state(["defines"])

	const formattedDefines = $derived(data.formattedDefines)

	const title = $derived(`${targetName} - Betaflight Support Explorer`)
	const description = $derived(`Target config for ${targetName} (${manufacturer.name})`)
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
	<div class="flex items-center justify-between gap-4 mt-10">
		<div class="flex flex-col gap-2">
			<div class="flex items-center gap-4">
				<header class="text-primary-500 h3 font-bold">{targetName}</header>
				{#if cloudBuildTarget.group === "supported"}
					<span class="badge preset-filled-success-500 font-semibold">Officially Supported</span>
				{/if}
			</div>
			{#if manufacturer.url}
				<a
					href={manufacturer.url}
					target="_blank"
					rel="noopener noreferrer"
					class="fancy-link w-fit text-surface-300 -ml-1">{manufacturer.name}</a
				>
			{:else}
				<span class="w-fit text-surface-300 -ml-1">{manufacturer.name}</span>
			{/if}
		</div>
		<a
			href={`https://github.com/betaflight/config/blob/master/configs/${targetName}/config.h`}
			class="btn preset-filled-primary-500"
		>
			Open in GitHub
			<Icon src={Github} size="1.5rem" />
		</a>
	</div>
	<TargetReleases releases={cloudBuildTarget.releases} />
	<Accordion
		collapsible
		value={definesAccordionValue}
		onValueChange={(details) => (definesAccordionValue = details.value)}
	>
		<Accordion.Item
			classes="card preset-tonal-secondary"
			controlHover="hover:bg-primary-500/20"
			value="defines"
		>
			{#snippet control()}
				<header class="h2 font-bold mb-4 mt-3">Defines</header>
			{/snippet}
			{#snippet panel()}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
					<DefineListItem icon={Microchip} name="MCU" value={formattedDefines.MCU} />
					<DefineListItem icon={Rotate3d} name="IMU" value={formattedDefines.IMU} />
					<DefineListItem icon={Thermometer} name="BARO" value={formattedDefines.BARO} />
					<DefineListItem icon={Compass} name="MAG" value={formattedDefines.MAG} />
				</div>
			{/snippet}
		</Accordion.Item>
	</Accordion>
	<CodeBlock
		code={target.content}
		lang="c"
		classes="card preset-tonal-secondary overflow-scroll"
		preClasses="[&>pre]:!bg-transparent"
	/>
</div>
