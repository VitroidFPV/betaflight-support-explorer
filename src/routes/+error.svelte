<script lang="ts">
	import { page } from "$app/state"
	import { Icon } from "@steeze-ui/svelte-icon"
	import { CloudAlert, House } from "@steeze-ui/lucide-icons"
	import { fly } from "svelte/transition"
	import { extractSupportId } from "$lib/extractSupportId"

	const id = extractSupportId(page.params.key ?? "")
	const status = page.status
	const message = page.error?.message
</script>

<div
	class="flex flex-col h-full w-full md:p-16 p-6 pb-6 2xl:px-80 gap-6"
	in:fly={{ x: 500, duration: 400 }}
>
	<h1 class="text-4xl font-bold text-error-500">Error {status}:</h1>
	<h2 class="text-2xl">{message}</h2>
	<div class="flex gap-4">
		<a href="/" class="btn preset-filled-secondary-500 btn-lg">
			<span><Icon src={House} size="1.5rem" /></span>
			Back to Home
		</a>
		{#if id || status === 400}
			<a
				href={`https://build.betaflight.com/api/support/${id}`}
				target="_blank"
				rel="noopener noreferrer"
				class="btn preset-filled-error-500 btn-lg"
			>
				<span><Icon src={CloudAlert} size="1.5rem" /></span>
				Open Fallback
			</a>
		{/if}
	</div>
</div>
