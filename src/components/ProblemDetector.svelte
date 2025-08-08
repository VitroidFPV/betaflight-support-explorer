<script lang="ts">
	import type { Problem } from "$lib/problemDetector"
	import { Accordion } from "@skeletonlabs/skeleton-svelte"

	interface Props {
		problems: Problem[]
	}

	let { problems }: Props = $props()

	let groupedProblems = $derived(() => {
		const grouped = {
			error: problems.filter((p) => p.severity === "error"),
			warning: problems.filter((p) => p.severity === "warning"),
			info: problems.filter((p) => p.severity === "info")
		}
		return grouped
	})

	let totalProblems = $derived(problems.length)
	let errorCount = $derived(groupedProblems().error.length)
	let warningCount = $derived(groupedProblems().warning.length)
	let infoCount = $derived(groupedProblems().info.length)

	function getProblemSeverityColor(severity: "error" | "warning" | "info") {
		switch (severity) {
			case "error":
				return {
					tonalPreset: "preset-tonal-error",
					textColor: "text-error-500"
				}
			case "warning":
				return {
					tonalPreset: "preset-tonal-warning",
					textColor: "text-warning-500"
				}
			case "info":
				return {
					tonalPreset: "preset-tonal-tertiary",
					textColor: "text-surface-contrast-900"
				}
		}
	}
</script>

<Accordion collapsible>
	<Accordion.Item
		classes="card preset-tonal-secondary"
		controlHover="hover:bg-primary-500/20"
		value="commonSettings"
		panelClasses="px-4 py-4"
	>
		{#snippet control()}
			<div class="flex flex-row justify-between items-center">
				<header class="h2 font-bold mb-4 mt-3">Data Analysis</header>
				<div class="flex gap-2 text-sm">
					{#if errorCount > 0}
						<span class="badge preset-tonal-error">
							{errorCount} Error{errorCount !== 1 ? "s" : ""}
						</span>
					{/if}
					{#if warningCount > 0}
						<span class="badge preset-tonal-warning">
							{warningCount} Warning{warningCount !== 1 ? "s" : ""}
						</span>
					{/if}
					{#if infoCount > 0}
						<span class="badge preset-tonal-tertiary">
							{infoCount} Info{infoCount !== 1 ? "s" : ""}
						</span>
					{/if}
				</div>
			</div>
		{/snippet}

		{#snippet panel()}
			{#if totalProblems > 0}
				<div class="grid grid-cols-1 gap-4">
					{#each Object.entries(groupedProblems()) as [, problems], i (i)}
						{#each problems as problem, j (j)}
							<div
								class={`card flex flex-col gap-2 p-4 ${getProblemSeverityColor(problem.severity).tonalPreset}`}
							>
								<header
									class={`h5 font-semibold font-mono ${getProblemSeverityColor(problem.severity).textColor}`}
								>
									{problem.title}
								</header>
								<div>
									<!-- eslint-disable-next-line svelte/no-at-html-tags - it gets sanitized on the server, should be safe... I hope -->
									{@html problem.description}
								</div>
							</div>
						{/each}
					{/each}
				</div>
			{:else}
				<div class="card flex flex-col gap-2 p-3 preset-tonal-success">
					<header class="h5 font-semibold font-mono text-success-500">No Problems Detected</header>
					<div class="text-surface-contrast-900">
						All checked settings appear to be properly configured.
					</div>
				</div>
			{/if}
		{/snippet}
	</Accordion.Item>
</Accordion>
