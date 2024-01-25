<script lang="ts">
    import type { PageData } from './$types';
	import { Icon } from "@steeze-ui/svelte-icon";
	import { Download, BookOpen } from "@steeze-ui/lucide-icons";
	import { fly } from 'svelte/transition';
    
    export let data: PageData;

	// const build = data.build;
	// const status = data.status;
	// const problem = data.problem;
	const { build, status, problem } = data;
	const { Config: config, Request: request } = build;

	const ArmingDisableFlags = (status?.["Arming disable flags"] as string)?.split(" ") ?? [];

	console.log(data)

	function formatTime(time: string) {
		return time.slice(8, 10) + '.' + time.slice(5, 7) + '.' + time.slice(0, 4) + ' ' + time.slice(11, 23);
	}
</script>

<div class="flex h-full w-full p-16 2xl:px-80 gap-6" in:fly={{x: 500, duration: 400}}>
	<div class="flex flex-col w-1/2 gap-6">

		<div class="card">
			<header class="card-header text-primary-500 h3 font-bold">Firmware</header>

			<section class="p-4 text-lg">
				<div class="flex flex-col">
					<div class="flex justify-between">
						<div>
							<span class="text-neutral-400 mr-1 text-base">{config.Manufacturer}/</span>{config.Target}
						</div>
						<a href="/" target="_blank" class="btn variant-filled-primary btn-sm">
							<span><Icon src={BookOpen} size="1rem" /></span>
							<span>Wiki</span>
						</a>
					</div>
					<!-- <div class="flex flex-row">
						<span class="text-neutral-400 mr-1 text-base">MCU:</span>
						<span class="text-base">{config.MCU}</span>
					</div> -->
					<hr>
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

						<a href="https://github.com/betaflight/betaflight/releases/tag/{request.Release}" target="_blank" class="btn variant-filled-secondary btn-sm">
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
					<a href="https://build.betaflight.com/api/builds/{build.Identifier}/hex" target="_blank" class="btn variant-filled-primary btn-sm">
						<span><Icon src={Download} size="1rem" /></span>
						<span>Download .hex</span>
					</a>
				</div>

				<hr>

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

		{#if status}

			<div class="card">
				<!-- problem description -->
				<header class="card-header text-primary-500 h3 font-bold">Problem Description</header>

				<section class="p-4 text-lg">
					<blockquote class="blockquote text-base">{problem}</blockquote>
				</section>
			</div>

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

	</div>

	<div class="flex flex-col w-1/2 gap-6">

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

					<div class="flex flex-row">
						<div class="flex flex-row">
							<span class="text-neutral-400 mr-1 text-base">Gyro:</span>
							<span class="text-base">{status.GYRO}</span>
						</div>
						<span class="divider-vertical ml-4 mr-4"></span>
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
						{#each Object.keys(status).filter(key => key.includes("Clock")) as key}
							<span class="text-base">{status[key]}</span>
						{/each}
					</div>

				</section>
			</div>
		{/if}

	</div>
</div>