<script lang="ts">
	import type { PageData } from "./$types";
	import { Icon } from "@steeze-ui/svelte-icon";
	import { Download, BookOpen, Code, Plus, ClipboardPaste, ArrowRightCircle, Loader2 } from "@steeze-ui/lucide-icons";
	import { CodeBlock, Accordion, AccordionItem } from "@skeletonlabs/skeleton";
	import { fly } from "svelte/transition";
	import Ports from "$components/Ports.svelte";
	import Modes from "$components/Modes.svelte";
	import { goto } from "$app/navigation";
	import { invalidate } from "$app/navigation";
	import { extractSupportId } from "$lib/extractSupportId";
	import { page } from "$app/stores";
	import { previousIds } from "$lib/stores/previousIds";

	export let data: PageData;

	type CommonSettings = {
		[section: string]: {
			[setting: string]: {
			name: string;
			value: string;
			};
		};
	};

	$: ({ support, build, status, problem, dump, dma, timer, serial, modes } = data);
	$: commonSettings = data.commonSettings as CommonSettings;
	$: ({ Config: config, Request: request } = build);

	$: ArmingDisableFlags = (status?.["Arming disable flags"] as string)?.split(" ") ?? [];

	$: timerKeys = timer ? Object.keys(timer) : [];
	$: timerHalf = Math.ceil(timerKeys.length / 2);
	$: splitTimer = [timerKeys.slice(0, timerHalf), timerKeys.slice(timerHalf, timerKeys.length)];

	function formatTime(time: string) {
		return (
			time.slice(8, 10) + "." + time.slice(5, 7) + "." + time.slice(0, 4) + " " + time.slice(11, 23)
		);
	}

	let description = "";
	if (config) {
		description = `Firmware: ${config.Manufacturer}/${config.Target} \n Release: ${request.Release} \n Tag: ${request.Tag} \n Status: ${build.Status} \n Submitted: ${formatTime(build.Submitted)} \n Elapsed: ${build.Elapsed}ms \n \n Options: ${request.Options.join(", ")}`
	}

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

	$: console.log($previousIds);

</script>

<svelte:head>
	<title>{"Betaflight Support Explorer" + " - " + $page.params.key}</title>
	<meta name="description" content={description} />

	<meta property="og:title" content={`Support Data for ${config.Target}`} />
	<meta property="og:url" content="https://betaflight-support-explorer.netlify.app/" />
	<meta property="og:type" content="website" />
	<meta property="og:description" content={description} />
	<meta name="theme-color" content="#ffbb00" />
</svelte:head>

<div
	class="flex flex-col h-full w-full md:p-16 p-4 pb-6 2xl:px-40 gap-6 relative"
	in:fly={{ x: 500, duration: 400 }}
>
	{#if showNewSupportForm}
		<div class="fixed lg:bottom-5 lg:right-20 lg:w-96 bottom-24 right-4 w-[calc(100%-2rem)]" transition:fly={{ x: 20, duration: 300 }}>
			<form
				class="input-group input-group-divider grid-cols-[auto_1fr_auto] w-full h-12"
				on:submit|preventDefault={searchNewSupport}
			>
				<button class="variant-filled-tetriary" on:click={paste} disabled={isPasting || isLoading}>
					<Icon src={ClipboardPaste} size="1.5rem" />
				</button>
				<input type="search" placeholder="Paste Support key..." class="w-full" bind:value={newSupportKey} disabled={isLoading} />
				<button class="variant-filled-secondary disabled:cursor-not-allowed disabled:opacity-50" disabled={!hasValidId || isLoading}>
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
		disabled={isLoading}
	>
		{#if isLoading}
			<Icon src={Loader2} size="1.5rem" class="animate-spin" />
		{:else}
			<div class:rotate-45={showNewSupportForm} class="transition-transform duration-300">
				<Icon src={Plus} size="1.5rem" />
			</div>
		{/if}
	</button>

	<div class="grid md:grid-cols-2 grid-cols-1 gap-6">
		<div class="flex flex-col w-full gap-6">
			<div class="card">
				<header class="card-header text-primary-500 h3 font-bold">Firmware</header>
				<section class="p-4 text-lg">
					<div class="flex flex-col">
						<div class="flex justify-between">
							<div>
								<span class="text-neutral-400 mr-1 text-base">{config.Manufacturer}/</span
								>{config.Target}
							</div>
							<a href="/" target="_blank" class="btn variant-filled-primary btn-sm">
								<span><Icon src={BookOpen} size="1rem" /></span>
								<span>Wiki</span>
							</a>
						</div>
						<hr />
						<div class="flex justify-between items-center">
							<div>
								<div class="flex flex-row">
									<span class="text-neutral-400 mr-1 text-base">Release:</span>
									<span class="text-base">{request.Release}</span>
								</div>
								<div class="flex flex-row">
									<span class="text-neutral-400 mr-1 text-base">Tag:</span>
									<span class="text-base">{request.Tag}</span>
								</div>
							</div>
							<a
								href="https://github.com/betaflight/betaflight/releases/tag/{request.Release}"
								target="_blank"
								class="btn variant-filled-secondary btn-sm"
							>
								<span><Icon src={BookOpen} size="1rem" /></span>
								<span>Changelog</span>
							</a>
						</div>
					</div>
				</section>
			</div>

			<div class="card">
				<header class="card-header text-primary-500 h3 font-bold">Build</header>
				<section class="p-4 text-lg">
					<div class="flex flex-row items-center w-full justify-between">
						<div class="flex">
							<span class="text-neutral-400 mr-1 text-base">Status:</span>
							<span class="badge variant-filled-success">{build.Status}</span>
						</div>
						<!-- <button type="button" class="btn variant-filled-primary btn-sm">
							<span><Icon src={Download} size="1rem" /></span>
							<span>Download .hex</span>
						</button> -->
						<a
							href="https://build.betaflight.com/api/builds/{build.Identifier}/hex"
							target="_blank"
							class="btn variant-filled-primary btn-sm"
						>
							<span><Icon src={Download} size="1rem" /></span>
							<span>Download .hex</span>
						</a>
					</div>
					<hr />
					<div class="flex flex-col">
						<div class="flex flex-row">
							<span class="text-neutral-400 mr-1 text-base">Submitted:</span>
							<span class="text-base">{formatTime(build.Submitted)}</span>
						</div>
						<div class="flex flex-row">
							<span class="text-neutral-400 mr-1 text-base">Elapsed:</span>
							<span class="text-base">{build.Elapsed}</span>
							<span class="text-neutral-400 mr-1 text-base">ms</span>
						</div>
					</div>
				</section>
			</div>

			{#if problem}
				<div class="card">
					<!-- problem description -->
					<header class="card-header text-primary-500 h3 font-bold">Problem Description</header>
					<section class="p-4 text-lg">
						<blockquote class="blockquote text-base">{problem}</blockquote>
					</section>
				</div>
			{/if}

			{#if ArmingDisableFlags.length > 0}
				<div class="card">
					<!-- arming disable flags -->
					<header class="card-header text-primary-500 h3 font-bold">Arming Disable Flags</header>
					<section class="p-4 text-lg">
						<div class="flex flex-row flex-wrap gap-2">
							<!-- <div class="badge variant-ghost-error">RXLOSS</div>
							<div class="badge variant-ghost-error">CLI</div>
							<div class="badge variant-ghost-error">MSP</div> -->
							{#each ArmingDisableFlags as flag}
								<div class="badge variant-ghost-error">{flag}</div>
							{/each}
						</div>
					</section>
				</div>
			{/if}

			{#if dma && Object.keys(dma).length > 0}
				<div class="card">
					<header class="card-header text-primary-500 h3 font-bold">DMA</header>

					<section class="p-4 text-lg">
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							{#if dma}
								{#each Object.keys(dma) as dmaKey}
									<div class="flex flex-col gap-2">
										<header class="text-primary-500 h6 font-medium">{dmaKey}:</header>
										{#each Object.keys(dma[dmaKey]) as channelKey}
											<div class="flex flex-row">
												<span class="text-neutral-400 mr-1 text-base">{dmaKey} {channelKey}:</span>
												{#if dma[dmaKey][channelKey] === "FREE"}
													<span class="badge variant-ghost-tertiary">{dma[dmaKey][channelKey]}</span
													>
												{:else}
													<span class="badge variant-ghost-success">{dma[dmaKey][channelKey]}</span>
												{/if}
											</div>
										{/each}
									</div>
								{/each}
							{/if}
						</div>
					</section>
				</div>
			{/if}
		</div>

		<div class="flex flex-col w-full gap-6">
			<div class="card">
				<header class="card-header text-primary-500 h3 font-bold">Options</header>
				<section class="p-4 text-lg">
					<div class="flex gap-2 flex-row flex-wrap">
						{#each request.Options as option}
							<div class="badge variant-soft-primary">{option}</div>
						{/each}
					</div>
				</section>
			</div>

			{#if status}
				<div class="card">
					<header class="card-header text-primary-500 h3 font-bold">Hardware</header>
					<section class="p-4 text-lg">
						<div class="flex flex-row">
							<span class="text-neutral-400 mr-1 text-base">MCU:</span>
							<span class="text-base">{config.MCU}</span>
						</div>
						<div class="flex flex-col md:flex-row">
							<div class="flex flex-row">
								<span class="text-neutral-400 mr-1 text-base">Gyro:</span>
								<span class="text-base">{status.GYRO}</span>
							</div>
							<span class="hidden md:block divider-vertical ml-4 mr-4"></span>
							<div class="flex flex-row">
								<span class="text-neutral-400 mr-1 text-base">Accelerometer:</span>
								<span class="text-base">{status.ACC}</span>
							</div>
						</div>
						<div class="flex flex-row">
							<span class="text-neutral-400 mr-1 text-base">Barometer:</span>
							<span class="text-base">{status.BARO}</span>
						</div>
						<div class="flex flex-row">
							<span class="text-neutral-400 mr-1 text-base">OSD:</span>
							<span class="text-base">{status.OSD}</span>
						</div>
					</section>
				</div>
				<div class="card">
					<header class="card-header text-primary-500 h3 font-bold">Status</header>
					<section class="p-4 text-lg">
						<div class="flex flex-row">
							<span class="text-neutral-400 mr-1 text-base">CPU Load:</span>
							<span class="text-base">{status.CPU}</span>
						</div>
						<div class="flex flex-row">
							<!-- core temp -->
							<span class="text-neutral-400 mr-1 text-base">Core Tempreature:</span>
							<span class="text-base">{status["Core temp"]}</span>
						</div>
						<div class="flex flex-row">
							<div class="flex flex-row">
								<span class="text-neutral-400 mr-1 text-base">Cycle Time:</span>
								<span class="text-base">{status["cycle time"]}</span>
							</div>
							<span class="divider-vertical ml-4 mr-4"></span>
							<div class="flex flex-row">
								<span class="text-neutral-400 mr-1 text-base">System Rate:</span>
								<span class="text-base">{status["System rate"]}</span>
							</div>
						</div>
						<!-- Gyro rate -->
						<div class="flex flex-row">
							<div class="flex flex-row">
								<span class="text-neutral-400 mr-1 text-base">Gyro Rate:</span>
								<span class="text-base">{status["GYRO rate"]}Hz</span>
							</div>
							<span class="divider-vertical ml-4 mr-4"></span>
							<div class="flex flex-row">
								<span class="text-neutral-400 mr-1 text-base">RX Rate:</span>
								<span class="text-base">{status["RX rate"]}</span>
							</div>
						</div>
						<!-- mcu clock -->
						<div class="flex flex-row">
							<span class="text-neutral-400 mr-1 text-base">MCU Clock:</span>
							<!-- match for key "* clock" -->
							{#each Object.keys(status).filter((key) => key.includes("Clock")) as key}
								<span class="text-base">{status[key]}</span>
							{/each}
						</div>
					</section>
				</div>
			{/if}

			{#if timer}
				<div class="card">
					<header class="card-header text-primary-500 h3 font-bold">Timers</header>
					<section class="p-4 text-lg">
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							{#if timer}
								{#each splitTimer as timerHalf}
									<div class="flex flex-col w-full">
										{#each timerHalf as timerKey}
											<div class="flex flex-col">
												<header class="h6 font-medium flex items-center">
													<span>{timerKey}:</span>
													{#if typeof timer[timerKey] === "string" && timer[timerKey] === "FREE"}
														<span class="badge variant-ghost-tertiary ml-2">{timer[timerKey]}</span>
													{/if}
												</header>
												{#if typeof timer[timerKey] !== "string"}
													{#each Object.keys(timer[timerKey]) as channelKey}
														<div class="flex flex-row">
															<span class="text-neutral-400 mr-1 text-base pl-3">{channelKey}:</span>
															<span class="badge variant-ghost-success">{timer[timerKey][channelKey]}</span>
														</div>
													{/each}
												{/if}
											</div>
										{/each}
									</div>
								{/each}
							{/if}
						</div>
					</section>
				</div>
			{/if}
		</div>
	</div>

	{#if serial}
		<Ports {serial} />
	{/if}

	{#if modes}
		<Modes {modes} />
	{/if}

	{#if commonSettings}
		<Accordion>
			<AccordionItem class="card">
				<svelte:fragment slot="summary">
					<header class="card-header text-primary-500 h2 font-bold mb-4">Common Settings</header>
				</svelte:fragment>
				<svelte:fragment slot="content">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
						{#each Object.keys(commonSettings) as section}
							<div class="flex flex-col gap-2">
								<header class="text-primary-500 h5 font-semibold font-mono">{section}</header>
								{#each Object.keys(commonSettings[section]) as setting}
									<div class="flex flex-row">
										<span class="mr-1 text-base">{commonSettings[section][setting].name}:</span>
										<span class="badge variant-soft-primary">{commonSettings[section][setting].value}</span>
									</div>
								{/each}
							</div>
						{/each}
					</div>
				</svelte:fragment>
			</AccordionItem>
		</Accordion>
	{/if}

	{#if dump}
		<hr />
		<header class="text-primary-500 h2 font-bold">Dump</header>

		<div class="flex flex-col">
			<CodeBlock class="card max-h-[88vh] overflow-y-scroll" language="nim" code={dump} />
		</div>
	{/if}
</div>
