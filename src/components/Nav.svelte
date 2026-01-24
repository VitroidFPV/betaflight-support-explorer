<script lang="ts">
	import { preventDefault } from "svelte/legacy"
	import { page } from "$app/state"

	import { Icon } from "@steeze-ui/svelte-icon"
	import {
		ClipboardPaste,
		CircleArrowRight,
		LoaderCircle,
		ArrowUpRight,
		Github,
		Coffee
	} from "@steeze-ui/lucide-icons"
	import { goto, invalidate } from "$app/navigation"
	import { extractSupportId } from "$lib/extractSupportId"

	let newSupportKey = $state("")
	let error = ""
	let isPasting = $state(false)
	let isLoading = $state(false)

	let hasValidId = $derived(newSupportKey && extractSupportId(newSupportKey) !== null)

	async function paste(e: Event) {
		e.preventDefault()
		try {
			isPasting = true
			error = ""
			const result = await navigator.permissions.query({ name: "clipboard-read" as PermissionName })
			if (result.state === "granted" || result.state === "prompt") {
				const text = await navigator.clipboard.readText()
				const supportId = extractSupportId(text)
				if (supportId) {
					newSupportKey = supportId
					searchNewSupport()
				} else {
					error = "Invalid support ID format. Please check and try again."
					console.error(error)
				}
			} else {
				error = "Clipboard read permission denied"
				console.error(error)
			}
		} catch (err) {
			error = "Failed to access clipboard"
			console.error(err)
		} finally {
			isPasting = false
		}
	}

	async function searchNewSupport() {
		if (!newSupportKey) {
			error = "Please enter a support ID"
			return
		}
		const supportId = extractSupportId(newSupportKey)
		if (!supportId) {
			error = "Invalid support ID format"
			return
		}
		console.log("Searching for:", supportId)
		isLoading = true
		try {
			await invalidate("all")
			await goto("/" + supportId)
		} finally {
			isLoading = false
			newSupportKey = ""
		}
	}
</script>

<nav
	class="flex fixed bg-surface-950 top-0 left-0 right-0 z-10 justify-between items-center h-fit lg:h-16 shadow-[0_-0.5rem_0.5rem_1rem] shadow-surface-950"
	data-sveltekit-preload-data="hover"
>
	<div class="grid grid-cols-2 lg:grid-cols-[2fr_2fr_2fr] w-full lg:px-8 px-4 gap-3 py-2">
		<div class="flex justify-start xl:gap-8 lg:gap-4 gap-2 items-center order-1">
			<a href="/" class="h-fit fancy-link" data-active={page.url.pathname === "/"}>home</a>
			<a
				href="/targets"
				class="h-fit fancy-link"
				data-active={page.url.pathname.startsWith("/targets")}>targets</a
			>
		</div>
		<div class="flex justify-center col-span-2 lg:col-span-1 order-3 lg:order-2 min-w-[28rem]">
			<!-- <input type="search" placeholder="Search..." class="input input-sm" /> -->
			<form
				class="input-group grid-cols-[auto_1fr_auto] w-full rounded-full focus-within:ring-[3px] focus-within:ring-primary-500"
				onsubmit={preventDefault(searchNewSupport)}
			>
				<button class="ig-btn preset-tonal-secondary pr-2" onclick={paste} disabled={isPasting}>
					<Icon src={ClipboardPaste} size="1.5rem" />
				</button>
				<input
					type="search"
					placeholder="Paste Support ID..."
					class="w-full ig-input h-12 preset-tonal-secondary focus:ring-0 !border-none"
					bind:value={newSupportKey}
					onkeydown={(e) => e.key === "Enter" && searchNewSupport()}
				/>
				<button
					class={"preset-tonal-secondary disabled:cursor-not-allowed ig-btn !border-none pl-2" +
						(isLoading ? " cursor-none" : "")}
					disabled={!hasValidId}
				>
					<!-- <Icon src={ArrowRightCircle} size="1.5rem" /> -->
					<!-- if isLoading, show a spinner -->
					{#if isLoading}
						<Icon src={LoaderCircle} size="1.5rem" class="animate-spin" />
					{:else}
						<Icon src={CircleArrowRight} size="1.5rem" />
					{/if}
				</button>
			</form>
		</div>
		<div class="flex justify-end items-center order-2 lg:order-3 xl:gap-8 lg:gap-4 gap-2">
			<a
				href="https://ko-fi.com/vitroid"
				class="h-fit fancy-link flex gap-1 items-center whitespace-nowrap"
				target="_blank"
				rel="noopener noreferrer"
			>
				<Icon src={Coffee} size="1.25rem" />
				<span class="hidden xl:block">support the app</span>
				<span class="self-start">
					<Icon src={ArrowUpRight} size="0.75rem" />
				</span>
			</a>
			<!-- <button class="btn btn-sm">settings</button> -->
			<a
				href="https://github.com/betaflight/betaflight-support-explorer"
				class="h-fit fancy-link flex gap-1 items-center"
				target="_blank"
				rel="noopener noreferrer"
			>
				<Icon src={Github} size="1.25rem" />
				<span class="hidden xl:block">source</span>
				<span class="self-start">
					<Icon src={ArrowUpRight} size="0.75rem" />
				</span>
			</a>
			<span class="border-surface-500 vr"></span>
			<a href="/settings" class="h-fit fancy-link" data-active={page.url.pathname === "/settings"}
				>settings</a
			>
		</div>
	</div>
</nav>
