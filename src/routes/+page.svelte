<script lang="ts">
	// import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import { Icon } from "@steeze-ui/svelte-icon";
	import { ClipboardPaste, ArrowRightCircle } from "@steeze-ui/lucide-icons";
	import { goto } from "$app/navigation";
	import { ProgressBar } from "@skeletonlabs/skeleton";
	import { extractSupportId } from "$lib/extractSupportId";

	import { tweened } from "svelte/motion";
	import { cubicOut } from "svelte/easing";
	import { fly, slide } from "svelte/transition";
	import { onMount } from "svelte";

	let key = "";
	let error = "";
	let isPasting = false;

	$: hasValidId = key && extractSupportId(key) !== null;

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
					key = supportId;
					search();
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

	function search() {
		if (!key) {
			error = "Please enter a support ID";
			return;
		}
		const supportId = extractSupportId(key);
		if (!supportId) {
			error = "Invalid support ID format";
			return;
		}
		console.log("Searching for:", supportId);
		loadingValue.set(100);
		goto("/" + supportId);
	}

	const loadingValue = tweened(0, {
		duration: 500
	});

	const description = "Easily explore all the data from support data submissions! Just paste the support key and get started.";
</script>

<svelte:head>
	<title>Betaflight Support Explorer</title>
	<meta name="description" content={description} />

	<meta property="og:title" content="Betaflight Support Explorer" />
	<meta property="og:url" content="https://betaflight-support-explorer.netlify.app/" />
	<meta property="og:type" content="website" />
	<meta property="og:description" content={description} />
	<meta name="theme-color" content="#ffbb00" />
</svelte:head>

<div class="flex h-full w-full flex-col items-center">
	<container class="flex justify-center items-center h-full flex-col md:w-96 w-full p-4">
		<div class="h-8 this-is-padding"></div>
		<form
			class="input-group input-group-divider grid-cols-[auto_1fr_auto] md:w-fit w-full mb-6"
			on:submit|preventDefault={search}
		>
			<button class="variant-filled-tetriary" on:click={paste} disabled={isPasting}>
				<Icon src={ClipboardPaste} size="1.5rem" />
			</button>
			<input type="search" placeholder="Paste Support key..." class="md:w-96 w-full" bind:value={key} />
			<button class="variant-filled-secondary disabled:cursor-not-allowed disabled:opacity-50" disabled={!hasValidId}>
				<Icon src={ArrowRightCircle} size="1.5rem" />
			</button>
		</form>
		<p class="h-8">
			{#if error}
				<span class="text-error-500 mb-4" transition:fly={{ y: 20, duration: 300 }}>{error}</span>
			{/if}
		</p>
		<ProgressBar
			meter="bg-primary-500"
			class={$loadingValue === 0 ? "invisible " : ""}
			value={$loadingValue}
			max={100}
		/>
	</container>
</div>
