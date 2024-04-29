<script lang="ts">
	import { Accordion, AccordionItem } from "@skeletonlabs/skeleton"

	export let modes: { mode: string; channel: number; low: number; high: number }[] = [];

	// object: [
	// 	{
	// 		"mode": "ARM",
	// 		"channel": 0,
	// 		"low": 1900,
	// 		"high": 2100
	// 	},
	// 	{
	// 		"mode": "TELEMETRY",
	// 		"channel": 3,
	// 		"low": 1900,
	// 		"high": 2100
	// 	},
	// 	{
	// 		"mode": "PARALYZE",
	// 		"channel": 2,
	// 		"low": 1900,
	// 		"high": 2100
	// 	},
	// 	{
	// 		"mode": "GPSRESCUE",
	// 		"channel": 1,
	// 		"low": 1900,
	// 		"high": 2100
	// 	}
	// ]
</script>

<Accordion>
	<AccordionItem class="card">
		<svelte:fragment slot="summary">
			<header class="card-header text-primary-500 h2 font-bold mb-4">Modes</header>
		</svelte:fragment>
		<svelte:fragment slot="content">
			<div>
				<section class="p-4 text-lg">
					<div class="grid grid-cols-6 row-auto justify-items-center gap-y-2">
						<div class="font-bold col-span-3 md:col-span-1">Mode</div>
						<div class="font-bold col-span-3 md:col-span-1">AUX</div>
						<div class="font-bold col-span-6 md:col-span-4">Range</div>

						<div class="col-span-full bg-surface-500 h-0.5 w-full my-2"></div>

						{#each modes as mode}
							<div class="col-span-3 md:col-span-1 font-bold text-primary-500">{mode.mode}</div>
							<div class="col-span-3 md:col-span-1">{mode.channel === 255 ? "N/A" : mode.channel + 1}</div>
							<div class="col-span-6 md:col-span-4 w-full">
								<div class="relative h-3 rounded-full overflow-clip w-full bg-surface-500">
									<div class="absolute h-full bg-primary-500 rounded-full" style="width: {((mode.high - mode.low) / 1200) * 100}%; left: {((mode.low - 900) / 1200) * 100}%"></div>
								</div>
								<div class="flex w-full justify-between mt-2 mb-6">
									{#each Array.from({ length: 13 }, (_, i) => i * 100 + 900) as pip}
										<div class="relative">
											<div class="w-0.5 h-2 bg-surface-500"></div>
											<div 
												class="text-surface-400 text-sm -translate-x-1/2 absolute"
												style={`display: ${(pip/100) % 2 !== 0 ? "block" : "none"}`}
											>
												{pip}
											</div>
										</div>
									{/each}
								</div>
							</div>
							<div class="block md:hidden col-span-full bg-surface-500 h-0.5 w-full my-2"></div>
						{/each}
					
					</div>
				</section>
			</div>
		</svelte:fragment>
	</AccordionItem>
</Accordion>
