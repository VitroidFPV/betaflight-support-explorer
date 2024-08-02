<script lang="ts">
	// import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import { Icon } from "@steeze-ui/svelte-icon";
	import { ClipboardPaste, ArrowRightCircle } from "@steeze-ui/lucide-icons";
	import { goto } from "$app/navigation";
	import { ProgressBar } from "@skeletonlabs/skeleton";

	import { tweened } from "svelte/motion";
	import { cubicOut } from "svelte/easing";
	import { fly, slide } from "svelte/transition";
	import { onMount } from "svelte";

	let key = "";

	function paste(e: Event) {
		e.preventDefault();
		navigator.permissions.query({ name: "clipboard-read" as PermissionName }).then((result) => {
			if (result.state === "granted" || result.state === "prompt") {
				console.log("Clipboard read permission granted");
				navigator.clipboard.readText().then((text) => {
					let isBuildKey: boolean = false;
					isBuildKey = text.length === 32;

					if (!isBuildKey && !/^[\da-f]{8}-([\da-f]{4}-){3}[\da-f]{12}$/i.test(text)) {
						console.log("Invalid key format! Check the key and try again.");
						throw new Error("Invalid key format! Check the key and try again.");
					} else {
						key = text;
						search();
					}
				});
			} else {
				console.log("Clipboard read permission denied");
				throw new Error("Clipboard read permission denied");
			}
		})
	}

	function search() {
		console.log(key);
		loadingValue.set(100);
		goto("/" + key);
	}

	const loadingValue = tweened(0, {
		duration: 500
		// yeahhhhhhhhh
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
		<form
			class="input-group input-group-divider grid-cols-[auto_1fr_auto] md:w-fit w-full mb-6"
			on:submit|preventDefault={search}
		>
			<button class="variant-filled-tetriary" on:click={paste}>
				<Icon src={ClipboardPaste} size="1.5rem" />
			</button>
			<input type="search" placeholder="Paste Support key..." class="md:w-96 w-full" bind:value={key} />
			<button class="variant-filled-secondary">
				<Icon src={ArrowRightCircle} size="1.5rem" />
			</button>
		</form>
		<ProgressBar
			meter="bg-primary-500"
			class={$loadingValue === 0 ? "invisible " : ""}
			value={$loadingValue}
			max={100}
		/>
	</container>
</div>
