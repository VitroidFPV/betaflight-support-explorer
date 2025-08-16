<script lang="ts">
	// import { run } from "svelte/legacy"

	import type { PageData } from "./$types"
	import { Icon } from "@steeze-ui/svelte-icon"
	import { Download, BookOpen, FileScan } from "@steeze-ui/lucide-icons"
	import { Accordion } from "@skeletonlabs/skeleton-svelte"
	import { fly } from "svelte/transition"
	import Ports from "$components/Ports.svelte"
	import Modes from "$components/Modes.svelte"
	import ProblemDetector from "$components/ProblemDetector.svelte"
	import { page } from "$app/stores"
	// import { previousIds } from "$lib/stores/previousIds"
	import CodeBlock from "$components/CodeBlock/CodeBlock.svelte"

	interface Props {
		data: PageData
	}

	let { data }: Props = $props()

	type CommonSettings = {
		[section: string]: {
			[setting: string]: {
				name: string
				value: string
			}
		}
	}

	let { build, status, problem, dump, dma, timer, serial, modes, detectedProblems, description } =
		$derived(data)
	let commonSettings = $derived(data.commonSettings as CommonSettings)
	let { Config: config, Request: request } = $derived(build)

	// Calculate PID Rate from gyro rate and pidDenom
	let pidRate = $derived(
		(() => {
			if (!status || !commonSettings?.["Denominations"]?.["pidDenom"]?.value) return null
			const gyroRate = parseFloat(status["GYRO rate"] as string)
			const pidDenom = parseFloat(commonSettings["Denominations"]["pidDenom"].value)
			if (isNaN(gyroRate) || isNaN(pidDenom) || pidDenom === 0) return null
			return Math.round(gyroRate / pidDenom)
		})()
	)

	let ArmingDisableFlags = $derived((status?.["Arming disable flags"] as string)?.split(" ") ?? [])

	let timerKeys = $derived(timer ? Object.keys(timer) : [])
	let timerHalf = $derived(Math.ceil(timerKeys.length / 2))
	let splitTimer = $derived([
		timerKeys.slice(0, timerHalf),
		timerKeys.slice(timerHalf, timerKeys.length)
	])

	function formatTime(time: string) {
		return (
			time.slice(8, 10) + "." + time.slice(5, 7) + "." + time.slice(0, 4) + " " + time.slice(11, 23)
		)
	}

	// run(() => {
	// 	console.log($previousIds)
	// })
</script>

<svelte:head>
	<title>{"Betaflight Support Explorer" + " - " + $page.params.key}</title>
	<meta name="description" content={description} />

	<meta
		property="og:title"
		content={config?.Target ? `Support Data for ${config.Target}` : "Betaflight Support Explorer"}
	/>
	<meta property="og:url" content="https://betaflight-support-explorer.netlify.app/" />
	<meta property="og:type" content="website" />
	<meta property="og:description" content={description} />
	<meta name="theme-color" content="#ffbb00" />
</svelte:head>

<div
	class="flex flex-col h-full max-w-screen md:p-16 md:pt-8 lg:p-4 p-2 pb-6 2xl:px-40 gap-6 relative"
	in:fly={{ x: 500, duration: 400 }}
>
	{#if detectedProblems}
		<ProblemDetector problems={detectedProblems} />
	{/if}

	<div class="grid md:grid-cols-2 grid-cols-1 gap-6">
		<div class="flex flex-col w-full gap-6">
			<div class="card preset-tonal-secondary p-4 flex flex-col gap-4">
				<header class="card-header text-primary-500 h3 font-bold">Firmware</header>
				<section class="text-lg">
					<div class="flex flex-col">
						<div class="flex justify-between">
							<div>
								<span class="text-neutral-400 mr-1 text-base">{config.Manufacturer}/</span
								>{config.Target}
							</div>
							<div class="flex gap-2">
								<a
									href={`https://github.com/betaflight/config/blob/master/configs/${config.Target}/config.h`}
									target="_blank"
									class="btn preset-filled-primary-500 btn-sm"
								>
									<span><Icon src={FileScan} size="1rem" /></span>
									<span>Target</span>
								</a>
								<!-- <a href="/" target="_blank" class="btn variant-filled-primary btn-sm">
									<span><Icon src={BookOpen} size="1rem" /></span>
									<span>Wiki</span>
								</a> -->
							</div>
						</div>
						<hr class="hr border-surface-500 my-4 border-t-2" />
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
								class="btn preset-filled-secondary-500 btn-sm"
							>
								<span><Icon src={BookOpen} size="1rem" /></span>
								<span>Changelog</span>
							</a>
						</div>
					</div>
				</section>
			</div>

			<div class="card preset-tonal-secondary p-4 flex flex-col gap-4">
				<header class="card-header text-primary-500 h3 font-bold">Build</header>
				<section class="text-lg">
					<div class="flex flex-row items-center w-full justify-between">
						<div class="flex">
							<span class="text-neutral-400 mr-1 text-base">Status:</span>
							<span class="badge preset-filled-success-500">{build.Status}</span>
						</div>
						<div class="flex gap-2">
							<a
								href="https://build.betaflight.com/api/builds/{build.Identifier}/log"
								target="_blank"
								class="btn preset-filled-secondary-500 btn-sm"
							>
								<span><Icon src={BookOpen} size="1rem" /></span>
								<span>View Log</span>
							</a>
							<a
								href="https://build.betaflight.com/api/builds/{build.Identifier}/hex"
								target="_blank"
								class="btn preset-filled-primary-500 btn-sm"
							>
								<span><Icon src={Download} size="1rem" /></span>
								<span>Download .hex</span>
							</a>
						</div>
					</div>
					<hr class="hr border-surface-500 my-4 border-t-2" />
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
				<div class="card preset-tonal-secondary p-4 flex flex-col gap-4">
					<!-- problem description -->
					<header class="card-header text-primary-500 h3 font-bold">Problem Description</header>
					<section class="text-lg">
						<blockquote class="blockquote text-base">{problem}</blockquote>
					</section>
				</div>
			{/if}

			{#if ArmingDisableFlags.length > 0}
				<div class="card preset-tonal-secondary p-4 flex flex-col gap-4">
					<!-- arming disable flags -->
					<header class="card-header text-primary-500 h3 font-bold">Arming Disable Flags</header>
					<section class="text-lg">
						<div class="flex flex-row flex-wrap gap-2">
							<!-- <div class="badge variant-ghost-error">RXLOSS</div>
							<div class="badge variant-ghost-error">CLI</div>
							<div class="badge variant-ghost-error">MSP</div> -->
							{#each ArmingDisableFlags as flag, i (i)}
								<div class="badge preset-tonal-error border border-error-500">{flag}</div>
							{/each}
						</div>
					</section>
				</div>
			{/if}

			{#if dma && Object.keys(dma).length > 0}
				<div class="card preset-tonal-secondary p-4 flex flex-col gap-4">
					<header class="card-header text-primary-500 h3 font-bold">DMA</header>

					<section class="text-lg">
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							{#if dma}
								{#each Object.keys(dma) as dmaKey, i (i)}
									<div class="flex flex-col gap-2">
										<div class="text-primary-500 font-bold">{dmaKey}:</div>
										{#each Object.keys(dma[dmaKey]) as channelKey, j (j)}
											<div class="flex flex-row">
												<span class="text-neutral-400 mr-1 text-base">{dmaKey} {channelKey}:</span>
												{#if dma[dmaKey][channelKey] === "FREE"}
													<span class="badge preset-tonal-tertiary border border-tertiary-500"
														>{dma[dmaKey][channelKey]}</span
													>
												{:else}
													<span class="badge preset-tonal-success border border-success-500"
														>{dma[dmaKey][channelKey]}</span
													>
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
			<div class="card preset-tonal-secondary p-4 flex flex-col gap-4">
				<header class="card-header text-primary-500 h3 font-bold">Options</header>
				<section class="text-lg">
					<div class="flex gap-2 flex-row flex-wrap">
						{#each request.Options as option, i (i)}
							<div class="badge preset-tonal-primary">{option}</div>
						{/each}
					</div>
				</section>
			</div>

			{#if status}
				<div class="card preset-tonal-secondary p-4 flex flex-col gap-4">
					<header class="card-header text-primary-500 h3 font-bold">Hardware</header>
					<section class="text-lg">
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
				<div class="card preset-tonal-secondary p-4 flex flex-col gap-4">
					<header class="card-header text-primary-500 h3 font-bold">Status</header>
					<section class="text-lg">
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
							{#if pidRate !== null}
								<div class="flex flex-row">
									<span class="text-neutral-400 mr-1 text-base">PID Rate:</span>
									<span class="text-base">{pidRate}Hz</span>
								</div>
							{/if}
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
							{#each Object.keys(status).filter((key) => key.includes("Clock")) as key, i (i)}
								<span class="text-base">{status[key]}</span>
							{/each}
						</div>
					</section>
				</div>
			{/if}

			{#if timer}
				<div class="card preset-tonal-secondary p-4 flex flex-col gap-4">
					<header class="card-header text-primary-500 h3 font-bold">Timers</header>
					<section class="text-lg">
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							{#if timer}
								{#each splitTimer as timerHalf, i (i)}
									<div class="flex flex-col w-full">
										{#each timerHalf as timerKey, j (j)}
											<div class="flex flex-col">
												<header class="font-medium flex items-center">
													<span>{timerKey}:</span>
													{#if typeof timer[timerKey] === "string" && timer[timerKey] === "FREE"}
														<span
															class="badge preset-tonal-tertiary border border-tertiary-500 ml-2"
															>{timer[timerKey]}</span
														>
													{/if}
												</header>
												{#if typeof timer[timerKey] !== "string"}
													{#each Object.keys(timer[timerKey]) as channelKey, k (k)}
														<div class="flex flex-row">
															<span class="text-neutral-400 mr-1 text-base pl-3">{channelKey}:</span
															>
															<span class="badge preset-tonal-success border border-success-500"
																>{timer[timerKey][channelKey]}</span
															>
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
		<Accordion collapsible>
			<Accordion.Item
				classes="card preset-tonal-secondary"
				controlHover="hover:bg-primary-500/20"
				value="commonSettings"
			>
				{#snippet control()}
					<header class="h2 font-bold mb-4 mt-3">Common Settings</header>
				{/snippet}

				{#snippet panel()}
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
						{#each Object.keys(commonSettings) as section, i (i)}
							<div class="flex flex-col gap-2">
								<header class="text-primary-500 h5 font-semibold font-mono">{section}</header>
								{#each Object.keys(commonSettings[section]) as setting, j (j)}
									<div class="flex flex-row">
										<span class="mr-1 text-base">{commonSettings[section][setting].name}:</span>
										<span class="badge preset-tonal-primary"
											>{commonSettings[section][setting].value}</span
										>
									</div>
								{/each}
							</div>
						{/each}
					</div>
				{/snippet}
			</Accordion.Item>
		</Accordion>
	{/if}

	{#if dump}
		<Accordion collapsible>
			<Accordion.Item
				classes="card preset-tonal-secondary"
				controlHover="hover:bg-primary-500/20"
				value="dump"
			>
				{#snippet control()}
					<header class="h2 font-bold mb-4 mt-3 text-primary-500">Dump</header>
				{/snippet}

				{#snippet panel()}
					<CodeBlock
						classes="card max-h-[88vh] overflow-scroll"
						lang="nim"
						code={dump}
						preClasses="[&>pre]:!bg-transparent"
					/>
				{/snippet}
			</Accordion.Item>
		</Accordion>
	{/if}
</div>
