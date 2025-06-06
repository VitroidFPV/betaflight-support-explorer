<script lang="ts">
	import { Icon } from "@steeze-ui/svelte-icon";
	import { ClipboardPaste, ArrowRightCircle, Loader2, ExternalLink, ArrowUpRight } from "@steeze-ui/lucide-icons";
	import { goto, invalidate } from "$app/navigation";
	import { extractSupportId } from "$lib/extractSupportId";

	import { onMount } from "svelte";

	let newSupportKey = "";
	let error = "";
	let isPasting = false;
	let isLoading = false;

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

	async function searchNewSupport() {
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
		isLoading = true;
		try {
			await invalidate('all');
			await goto("/" + supportId);
		} finally {
			isLoading = false;
			newSupportKey = "";
		}
	}
</script>

<nav class="flex justify-between items-center h-fit lg:h-16 shadow-[0_-0.5rem_0.5rem_1rem] shadow-surface-900" data-sveltekit-preload-data="hover">
<!-- home, about, support me, <search>, <settings> -->
<!-- center <search> -->

	<div class="grid grid-cols-2 lg:grid-cols-[2fr_3fr_2fr] w-full px-8 gap-y-3 py-2">
		<div class="flex justify-start gap-8 items-center order-1">
			<a href="/" class="h-fit fancy-link">home</a>
			<a href="https://ko-fi.com/vitroid" class="h-fit fancy-link whitespace-nowrap flex gap-1" target="_blank" rel="noopener noreferrer">
				support me
				<span>
					<Icon src={ArrowUpRight} size="0.75rem" />
				</span>
			</a>
		</div>
		<div class="flex justify-center col-span-2 lg:col-span-1 order-3 lg:order-2">
			<!-- <input type="search" placeholder="Search..." class="input input-sm" /> -->
			<form
				class="input-group input-group-divider grid-cols-[auto_1fr_auto] w-full"
				on:submit|preventDefault={searchNewSupport}
			>
				<button class="variant-filled-tetriary" on:click={paste} disabled={isPasting}>
					<Icon src={ClipboardPaste} size="1.5rem" />
				</button>
				<input 
					type="search" 
					placeholder="Paste Support ID..." 
					class="w-full" 
					bind:value={newSupportKey}
					on:keydown={(e) => e.key === 'Enter' && searchNewSupport()} 
				/>
				<button class={"variant-filled-secondary disabled:cursor-not-allowed disabled:opacity-50" + (isLoading ? " cursor-none" : "")} disabled={!hasValidId}>
					<!-- <Icon src={ArrowRightCircle} size="1.5rem" /> -->
					<!-- if isLoading, show a spinner -->
					{#if isLoading}
						<Icon src={Loader2} size="1.5rem" class="animate-spin" />
					{:else}
						<Icon src={ArrowRightCircle} size="1.5rem" />
					{/if}
				</button>
			</form>
		</div>
		<div class="flex justify-end items-center order-2 lg:order-3">
			<!-- <button class="btn btn-sm">settings</button> -->
			<a href="/settings" class="h-fit fancy-link">settings</a>
		</div>
	</div>

</nav>