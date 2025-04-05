<script lang="ts">
	import { Icon } from "@steeze-ui/svelte-icon";
	import { settings } from "$lib/stores/settings";
	import { previousIds } from "$lib/stores/previousIds";
	import { fly, slide } from "svelte/transition";
	import { Trash } from "@steeze-ui/lucide-icons";
	import { writable } from "svelte/store";

	const description = "Easily explore all the data from support data submissions! Just paste the support key and get started.";
	
	type DeletedItem = typeof $previousIds[number] & { originalIndex: number };
	// Store for tracking deleted items for undo functionality
	const deletedItems = writable<DeletedItem[]>([]);

	function formatDate(timestamp: number) {
		return new Date(timestamp).toLocaleDateString('en-GB', { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' });
	}

	function getSetting(name: string) {
		return $settings.idPreviewCardSettings.find(s => s.name === name)?.value ?? false;
	}

	function deleteId(id: string) {
		const itemToDelete = $previousIds.find(item => item.id === id);
		if (itemToDelete) {
			// Store the deleted item with its original index for potential undo
			const originalIndex = $previousIds.findIndex(item => item.id === id);
			deletedItems.update(items => [...items, { ...itemToDelete, originalIndex }]);
			// Remove from previousIds
			previousIds.update(items => items.filter(item => item.id !== id));
		}
	}

	function undoDelete() {
		deletedItems.update(items => {
			if (items.length > 0) {
				const lastDeleted = items[items.length - 1];
				const { originalIndex, ...itemToRestore } = lastDeleted;
				previousIds.update(current => {
					const newItems = [...current];
					newItems.splice(originalIndex, 0, itemToRestore);
					return newItems;
				});
				return items.slice(0, -1);
			}
			return items;
		});
	}

	function handleKeyDown(event: KeyboardEvent) {
		if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
			event.preventDefault();
			undoDelete();
		}
	}

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

<svelte:document on:keydown={handleKeyDown} />

<div class="flex flex-col h-full w-full md:p-16 md:pt-8 p-4 pb-6 2xl:px-40 gap-6 relative"
	in:fly={{ x: 500, duration: 400 }}
>
	<h1 class="text-primary-500 font-bold h1 lg:pt-24">Previous IDs</h1>
	<div class="text-neutral-400 text-sm h-fit">
		Pick data to show in <a href="/settings" class="fancy-link font-bold text-primary-500">/settings</a>. IDs can be restored by pressing <span class="font-bold">Ctrl+Z</span>.
	</div>
	<div class="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
		{#each $previousIds as id (id.createdAt)}
			<div class="card group relative">
				<div class="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 top-0 right-0 translate-x-1/2 -translate-y-1/2">
					<button class="btn btn-icon variant-ghost-error btn-sm aspect-square" on:click={() => deleteId(id.id)}>
						<Icon src={Trash} size="1rem" />
					</button>
				</div>
				<section class="card-header flex justify-between">
					{#if getSetting('manufacturer') || getSetting('target')}
						<div class="flex gap-1 items-end">
							{#if getSetting('manufacturer')}
								<span class="text-neutral-400 text-base h-fit">{id.manufacturer}{getSetting('target') ? '/' : ''}</span>
							{/if}
							{#if getSetting('target')}
								<a href={"/" + id.id} class="text-primary-500 text-lg font-bold h-fit relative top-0.5 hover:underline" data-sveltekit-preload-data="hover">{id.target}</a>
							{/if}
						</div>
					{/if}
					{#if getSetting('version')}
						<div>
							<span class="text-neutral-400 text-base h-fit">{id.version}</span>
						</div>
					{/if}
				</section>
				<section class="p-4 flex flex-col gap-4">
					{#if getSetting('problemDescription')}
						<blockquote class="blockquote">{id.problemDescription || 'No problem description provided'}</blockquote>
					{/if}
					{#if getSetting('armDisableFlags')}
						<div class="flex gap-2 flex-row flex-wrap max-h-16 overflow-y-auto">
							{#each id.armDisableFlags as flag}
								<div class="badge variant-ghost-error">{flag}</div>
							{/each}
						</div>
					{/if}
					{#if getSetting('options')}
						<div class="flex gap-2 flex-row flex-wrap max-h-48 lg:max-h-24 overflow-y-auto">
							{#each id.options as option}
								<div class="badge variant-soft-primary">{option}</div>
							{/each}
						</div>
					{/if}
				</section>
				<section class="card-footer">
					{#if getSetting('createdAt')}
						<div class="flex gap-2">
							<div class="text-neutral-400 text-sm h-fit">{formatDate(id.createdAt)}</div>
						</div>
					{/if}
				</section>
			</div>
		{/each}
	</div>
</div>
