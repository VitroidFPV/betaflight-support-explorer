<script lang="ts">
	import { page } from "$app/state"
	import { fly } from "svelte/transition"
	import CodeBlock from "$components/CodeBlock/CodeBlock.svelte"

	// console.log(page.params.target)
	const targetName = page.params.target

	const { data } = $props()

	let target = $derived(data.config)
</script>

<div
	class="flex flex-col h-full max-w-screen md:p-16 md:pt-8 lg:p-4 p-2 pb-6 2xl:px-40 gap-6 relative"
	in:fly={{ x: 500, duration: 400 }}
>
	<div class="flex items-center gap-4 mt-10">
		<header class="text-primary-500 h3 font-bold">{targetName}</header>
	</div>
	<CodeBlock
		code={target.content}
		lang="c"
		classes="card preset-tonal-secondary overflow-scroll"
		preClasses="[&>pre]:!bg-transparent"
	/>
</div>
