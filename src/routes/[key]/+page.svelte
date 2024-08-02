<script lang="ts">
	import type { PageData } from "./$types";
	import { Icon } from "@steeze-ui/svelte-icon";
	import { Download, BookOpen, Code } from "@steeze-ui/lucide-icons";
	import { CodeBlock, Accordion, AccordionItem } from "@skeletonlabs/skeleton";
	import { fly } from "svelte/transition";
	import Ports from "$components/Ports.svelte";
	import Modes from "$components/Modes.svelte";

	export let data: PageData;

	// const build = data.build;
	// const status = data.status;
	// const problem = data.problem;
	const { support, build, status, problem, dump, dma, timer, serial, modes } = data;
	const { Config: config, Request: request } = build;

	const ArmingDisableFlags = (status?.["Arming disable flags"] as string)?.split(" ") ?? [];

	const timerKeys = timer ? Object.keys(timer) : [];
	const timerHalf = Math.ceil(timerKeys.length / 2);
	// const timer1 = timerKeys.slice(0, timerHalf);
	// const timer2 = timerKeys.slice(timerHalf, timerKeys.length);
	const splitTimer = [timerKeys.slice(0, timerHalf), timerKeys.slice(timerHalf, timerKeys.length)];

	// console.log(data.build);

	function formatTime(time: string) {
		return (
			time.slice(8, 10) + "." + time.slice(5, 7) + "." + time.slice(0, 4) + " " + time.slice(11, 23)
		);
	}

	let description = "";
	if (config) {
		description = `Firmware: ${config.Manufacturer}/${config.Target} \n Release: ${request.Release} \n Tag: ${request.Tag} \n Status: ${build.Status} \n Submitted: ${formatTime(build.Submitted)} \n Elapsed: ${build.Elapsed}ms \n \n Options: ${request.Options.join(", ")}`
	}
</script>

<svelte:head>
	<title>Betaflight Support Explorer</title>
	<meta name="description" content={description} />

	<meta property="og:title" content={`Support Data for ${config.Target}`} />
	<meta property="og:url" content="https://betaflight-support-explorer.netlify.app/" />
	<meta property="og:type" content="website" />
	<meta property="og:description" content={description} />
	<meta name="theme-color" content="#ffbb00" />
</svelte:head>

<div
	class="flex flex-col h-full w-full md:p-16 p-4 pb-6 2xl:px-40 gap-6"
	in:fly={{ x: 500, duration: 400 }}
>
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

	{#if dump}
		<hr />
		<header class="text-primary-500 h2 font-bold">Dump</header>

		<div class="flex flex-col">
			<CodeBlock class="card max-h-[88vh] overflow-y-scroll" language="nim" code={dump} />
		</div>
	{/if}
</div>
