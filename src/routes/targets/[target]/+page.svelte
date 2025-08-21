<script lang="ts">
	import { page } from "$app/state"

	// console.log(page.params.target)
	const target = page.params.target
</script>

<div class="flex flex-col gap-4">
	<h1 class="text-2xl font-bold">{target}</h1>
</div>
