<script lang="ts">
	import { page } from "$app/stores";
	import { fly } from "svelte/transition";
	import { Icon } from "@steeze-ui/svelte-icon";
	import { Plus, ClipboardPaste, ArrowRightCircle, Loader2 } from "@steeze-ui/lucide-icons";
	import { goto } from "$app/navigation";
	import { extractSupportId } from "$lib/extractSupportId";
	import { invalidate } from "$app/navigation";

	let showNewSupportForm = false;
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
		}
	}
</script>

<!-- <h1>{$page.status}: {$page.error?.message}</h1> -->
<div
	class="flex flex-col h-full w-full md:p-16 p-6 pb-6 2xl:px-80 gap-6"
	in:fly={{ x: 500, duration: 400 }}
>
	<h1 class="text-4xl font-bold text-error-500">Error {$page.status}:</h1>
	<h2 class="text-2xl">{$page.error?.message}</h2>
</div>
