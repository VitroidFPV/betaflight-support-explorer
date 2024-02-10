<script lang="ts">
	// import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import { Icon } from "@steeze-ui/svelte-icon";
	import { ClipboardPaste, ArrowRightCircle } from "@steeze-ui/lucide-icons";
	import { goto } from "$app/navigation";
	import { ProgressBar } from "@skeletonlabs/skeleton";

	import { tweened } from "svelte/motion";
	import { cubicOut } from "svelte/easing";
	import { fly, slide } from "svelte/transition";

	let key = "";

	function paste() {
		navigator.clipboard.readText().then((text) => {
			key = text;
		});
	}

	function search() {
		console.log(key);
		loadingValue.set(100);
		goto("/" + key);
	}

	const loadingValue = tweened(0, {
		duration: 500
		// easing: cubicOut,
	});
</script>

<div class="flex h-full w-full flex-col items-center">
	<container class="flex justify-center items-center h-full flex-col w-96">
		<form
			class="input-group input-group-divider grid-cols-[auto_1fr_auto] w-fit mb-6"
			on:submit|preventDefault={search}
		>
			<button class="variant-filled-tetriary" on:click={paste}>
				<Icon src={ClipboardPaste} size="1.5rem" />
			</button>
			<input type="search" placeholder="Paste Support key..." class="w-96" bind:value={key} />
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
