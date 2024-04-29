<script lang="ts">
	import { Accordion, AccordionItem } from "@skeletonlabs/skeleton"

	export let serial: { identifier: string; function: string[]; msp: number; gps: number; telemetry: number; blackbox: number }[] | [] = [];

// object: [
//     {
//         "identifier": "USB VCP",
//         "function": [
//             "MSP"
//         ],
//         "msp": 115200,
//         "gps": 57600,
//         "telemetry": 0,
//         "blackbox": 115200
//     },
//     {
//         "identifier": "UART 1",
//         "function": [
//             "RX Serial"
//         ],
//         "msp": 115200,
//         "gps": 57600,
//         "telemetry": 0,
//         "blackbox": 115200
//     },
//     {
//         "identifier": "UART 2",
//         "function": [
//             "Telemetry FrSky Hub"
//         ],
//         "msp": 115200,
//         "gps": 57600,
//         "telemetry": 0,
//         "blackbox": 115200
//     },
//     {
//         "identifier": "UART 3",
//         "function": [
//             "ESC Sensor"
//         ],
//         "msp": 115200,
//         "gps": 57600,
//         "telemetry": 0,
//         "blackbox": 115200
//     },
//     {
//         "identifier": "UART 4",
//         "function": [
//             "GPS"
//         ],
//         "msp": 115200,
//         "gps": 57600,
//         "telemetry": 0,
//         "blackbox": 115200
//     },
//     {
//         "identifier": "UART 5",
//         "function": [
//             "VTX SmartAudio"
//         ],
//         "msp": 115200,
//         "gps": 57600,
//         "telemetry": 0,
//         "blackbox": 115200
//     },
//     {
//         "identifier": "UART 6",
//         "function": [
//             "MSP",
//             "VTX MSP"
//         ],
//         "msp": 115200,
//         "gps": 57600,
//         "telemetry": 0,
//         "blackbox": 115200
//     }
// ]

	const msp = ["MSP"]
	const rx = ["RX Serial"]
	const telemetryNames = ["FrSky Hub", "HoTT", "LTM", "SmartPort", "MAVLink", "iBus"];
	const sensorNames = ["GPS", "ESC Sensor"];
	const peripheralNames = ["Lidar TF", "Blackbox", "VTX SmartAudio", "VTX Tramp", "FrSky OSD", "VTX MSP"];
</script>

<Accordion>
	<AccordionItem class="card">
		<svelte:fragment slot="summary">
			<header class="card-header text-primary-500 h2 font-bold mb-4">Ports</header>
		</svelte:fragment>
		<svelte:fragment slot="content">
<div>
	<section class="p-4 text-lg">
		<div class="grid grid-cols-6 row-auto justify-items-center gap-y-2 text-sm md:text-base">
			<div class="font-bold col-span-2 md:col-span-1 text-xs md:text-base">Identifier</div>
			<div class="font-bold col-span-2 md:col-span-1 text-xs md:text-base">Configuration/MSP</div>
			<div class="font-bold col-span-2 md:col-span-1 text-xs md:text-base">Serial RX</div>
			<div class="font-bold col-span-2 md:col-span-1 text-xs md:text-base">Telemetry Output</div>
			<div class="font-bold col-span-2 md:col-span-1 text-xs md:text-base">Sensor Input</div>
			<div class="font-bold col-span-2 md:col-span-1 text-xs md:text-base">Peripherals</div>

			<div class="col-span-full bg-surface-500 h-0.5 w-full my-2">
			</div>

			{#each serial as port}
				<div class="col-span-2 md:col-span-1 font-bold text-primary-500">{port.identifier}</div>
				<div class="col-span-2 md:col-span-1">
					{#if msp.some((msp) => port.function.includes(msp))}
						<div class="bg-primary-500 w-14 h-6 rounded-full relative">
							<div class="bg-white w-5 aspect-square rounded-full absolute top-0.5 right-0.5"></div>
						</div>
					{:else}
						<div class="bg-surface-500 w-14 h-6 rounded-full relative">
							<div class="bg-white w-5 aspect-square rounded-full absolute top-0.5 left-0.5"></div>
						</div>
					{/if}
				</div>
				<div class="col-span-2 md:col-span-1">
					{#if rx.some((rx) => port.function.includes(rx))}
						<div class="bg-primary-500 w-14 h-6 rounded-full relative">
							<div class="bg-white w-5 aspect-square rounded-full absolute top-0.5 right-0.5"></div>
						</div>
					{:else}
						<div class="bg-surface-500 w-14 h-6 rounded-full relative">
							<div class="bg-white w-5 aspect-square rounded-full absolute top-0.5 left-0.5"></div>
						</div>
					{/if}
				</div>
				<div class="col-span-2 md:col-span-1">
					{#if telemetryNames.some((telemetry) => port.function.includes(telemetry))}
						<div>
							<!-- only shows functions included in names array -->
							{Array.isArray(port.function) ? port.function.filter((peripheral) => telemetryNames.includes(peripheral)) : []} 
							<span class="text-surface-400">
								{port.telemetry === 0 ? "Auto" : port.telemetry}
							</span>
						</div>
					{:else}
						<div class="text-surface-300">Disabled <span class="text-surface-400">{port.telemetry === 0 ? "Auto" : port.telemetry}</span></div>
					{/if}
				</div>
				<div class="col-span-2 md:col-span-1">
					{#if sensorNames.some((sensor) => port.function.includes(sensor))}
						<div>
							{Array.isArray(port.function) ? port.function.filter((peripheral) => sensorNames.includes(peripheral)) : []} 
							<!-- if the function is "GPS", show gps value instead of telemetry value -->
							<span class="text-surface-400">
								{port.function.includes("GPS") ? port.gps : port.telemetry === 0 ? "Auto" : port.telemetry}
							</span>
						</div>
					{:else}
						<div class="text-surface-300">Disabled <span class="text-surface-400">{port.telemetry === 0 ? "Auto" : port.telemetry}</span></div>
					{/if}
				</div>
				<div class="col-span-2 md:col-span-1">
					{#if peripheralNames.some((peripheral) => port.function.includes(peripheral))}
						<div>
							{Array.isArray(port.function) ? port.function.filter((peripheral) => peripheralNames.includes(peripheral)) : []} 
							<span class="text-surface-400">
								{port.telemetry === 0 ? "Auto" : port.telemetry}
							</span>
						</div>
					{:else}
						<div class="text-surface-300">Disabled <span class="text-surface-400">{port.telemetry === 0 ? "Auto" : port.telemetry}</span></div>
					{/if}
				</div>
				<div class="block md:hidden col-span-full bg-surface-500 h-0.5 w-full my-2"></div>
			{/each}
		</div>
	</section>
</div>
		</svelte:fragment>
	</AccordionItem>
</Accordion>