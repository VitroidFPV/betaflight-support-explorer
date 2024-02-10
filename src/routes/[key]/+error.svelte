<script lang="ts">
	import { page } from "$app/stores";
	import { fly } from "svelte/transition";
</script>

<!-- <h1>{$page.status}: {$page.error?.message}</h1> -->
<div
	class="flex flex-col h-full w-full md:p-16 p-6 pb-6 2xl:px-80 gap-6"
	in:fly={{ x: 500, duration: 400 }}
>
	<h1 class="text-4xl font-bold text-error-500">Error {$page.status}:</h1>
	<h2 class="text-2xl">{$page.error?.message}</h2>
</div>
