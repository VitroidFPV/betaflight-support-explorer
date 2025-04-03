<script lang="ts">
	import { page } from "$app/stores";
	import { fly } from "svelte/transition";
	import { Icon } from "@steeze-ui/svelte-icon";
	import { Plus, ClipboardPaste, ArrowRightCircle } from "@steeze-ui/lucide-icons";
	import { goto } from "$app/navigation";
	import { extractSupportId } from "$lib/extractSupportId";

	let showNewSupportForm = false;
	let newSupportKey = "";
	let error = "";
	let isPasting = false;

	$: hasValidId = newSupportKey && extractSupportId(newSupportKey) !== null;

	async function paste(e: Event) {
		e.preventDefault();
		try {
			isPasting = true;
			error = "";
			const result = await navigator.permissions.query({ name: "clipboard-read" as PermissionName });
			if (result.state === "granted" || result.state === "prompt") {
				const text = await navigator.clipboard.readText();
				const supportId = extractSupportId(text);
				if (supportId) {
					newSupportKey = supportId;
					searchNewSupport();
				} else {
					error = "Invalid support ID format. Please check and try again.";
					console.error(error);
				}
			} else {
				error = "Clipboard read permission denied";
				console.error(error);
			}
		} catch (err) {
			error = "Failed to access clipboard";
			console.error(err);
		} finally {
			isPasting = false;
		}
	}

	function searchNewSupport() {
		if (!newSupportKey) {
			error = "Please enter a support ID";
			return;
		}
		const supportId = extractSupportId(newSupportKey);
		if (!supportId) {
			error = "Invalid support ID format";
			return;
		}
		console.log("Searching for:", supportId);
		goto("/" + supportId);
	}
</script>

<!-- <h1>{$page.status}: {$page.error?.message}</h1> -->
<div
	class="flex flex-col h-full w-full md:p-16 p-6 pb-6 2xl:px-80 gap-6"
	in:fly={{ x: 500, duration: 400 }}
>
	<h1 class="text-4xl font-bold text-error-500">Error {$page.status}:</h1>
	<h2 class="text-2xl">{$page.error?.message}</h2>

	{#if showNewSupportForm}
		<div class="fixed bottom-24 right-4 w-[calc(100%-2rem)] sm:bottom-6 sm:right-20 sm:w-96 transform" transition:fly={{ x: 20, duration: 300 }}>
			<form
				class="input-group input-group-divider grid-cols-[auto_1fr_auto] w-full"
				on:submit|preventDefault={searchNewSupport}
			>
				<button class="variant-filled-tetriary" on:click={paste} disabled={isPasting}>
					<Icon src={ClipboardPaste} size="1.5rem" />
				</button>
				<input type="search" placeholder="Paste Support key..." class="w-full" bind:value={newSupportKey} />
				<button class="variant-filled-secondary disabled:cursor-not-allowed disabled:opacity-50" disabled={!hasValidId}>
					<Icon src={ArrowRightCircle} size="1.5rem" />
				</button>
			</form>
			{#if error}
				<p class="text-error-500 mt-2" transition:fly={{ y: 20, duration: 300 }}>{error}</p>
			{/if}
		</div>
	{/if}

	<button
		class="fixed bottom-4 right-4 btn variant-filled-primary rounded-full w-14 h-14 flex items-center justify-center z-50"
		on:click={() => (showNewSupportForm = !showNewSupportForm)}
	>
		<Icon src={Plus} size="1.5rem" />
	</button>
</div>
