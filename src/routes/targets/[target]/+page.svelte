<script lang="ts">
	import { page } from "$app/state"
	import { fly } from "svelte/transition"
	import CodeBlock from "$components/CodeBlock/CodeBlock.svelte"
	import { Icon } from "@steeze-ui/svelte-icon"
	import { Github } from "@steeze-ui/lucide-icons"
	// console.log(page.params.target)
	const targetName = page.params.target

	const { data } = $props()

	let target = $derived(data.config)
	let manufacturer = $derived(data.manufacturer)

	const title = $derived(`${targetName} - Betaflight Support Explorer`)
	const description = $derived(`Support data for ${targetName} (${manufacturer.name})`)
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
			<header class="text-primary-500 h3 font-bold">{targetName}</header>
			<div class="text-surface-700-300">{manufacturer.name}</div>
		</div>
		<a
			href={`https://github.com/betaflight/config/blob/master/configs/${targetName}/config.h`}
			class="btn preset-filled-primary-500"
		>
			Open in GitHub
			<Icon src={Github} size="1.5rem" />
		</a>
	</div>
	<CodeBlock
		code={target.content}
		lang="c"
		classes="card preset-tonal-secondary overflow-scroll"
		preClasses="[&>pre]:!bg-transparent"
	/>
</div>
