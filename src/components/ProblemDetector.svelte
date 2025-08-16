<script lang="ts">
	import type { Problem } from "$lib/problemDetector"
	import { Accordion } from "@skeletonlabs/skeleton-svelte"
	import { Dialog, Tooltip } from "bits-ui"
	import { EyeOff, X } from "@steeze-ui/lucide-icons"
	import { Icon } from "@steeze-ui/svelte-icon"
	import { settings } from "$lib/stores/settings"
	import { Switch } from "@skeletonlabs/skeleton-svelte"
	interface Props {
		problems: Problem[]
	}

	let { problems }: Props = $props()

	// Filter out hidden problems before grouping
	let visibleProblems = $derived(() => {
		return problems.filter((problem) => !$settings.hiddenProblems?.includes(problem.id))
	})

	let groupedProblems = $derived(() => {
		const grouped = {
			error: visibleProblems().filter((p) => p.severity === "error"),
			warning: visibleProblems().filter((p) => p.severity === "warning"),
			info: visibleProblems().filter((p) => p.severity === "info")
		}
		return grouped
	})

	let totalProblems = $derived(visibleProblems().length)
	let errorCount = $derived(groupedProblems().error.length)
	let warningCount = $derived(groupedProblems().warning.length)
	let infoCount = $derived(groupedProblems().info.length)

	function getProblemSeverityColor(severity: "error" | "warning" | "info") {
		switch (severity) {
			case "error":
				return {
					tonalPreset: "preset-tonal-error",
					filledPreset: "preset-filled-error-500",
					textColor: "text-error-500"
				}
			case "warning":
				return {
					tonalPreset: "preset-tonal-warning",
					filledPreset: "preset-filled-warning-500",
					textColor: "text-warning-500"
				}
			case "info":
				return {
					tonalPreset: "preset-tonal-tertiary",
					filledPreset: "preset-filled-tertiary-500",
					textColor: "text-surface-contrast-900"
				}
		}
	}

	function handleHideProblem(problem: Problem) {
		currentProblem = problem
		if (!$settings.showHideWarning) {
			hideProblem(problem)
		} else {
			isOpen = true
		}
	}

	function hideProblem(problem: Problem) {
		if (!$settings.hiddenProblems?.includes(problem.id)) {
			$settings.hiddenProblems = [...($settings.hiddenProblems || []), problem.id]
		}
	}

	let currentProblem = $state<Problem | null>(null)
	let isOpen = $state(false)
</script>

<Dialog.Root bind:open={isOpen}>
	<Dialog.Portal>
		<Dialog.Overlay
			class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80"
		/>
		<Dialog.Content
			class="card preset-filled-surface-100-900 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-6 z-50 flex flex-col gap-4"
		>
			<div class="flex flex-col gap-4">
				<header class="h3 font-bold">Hide Problem</header>
				<p>Do you want to hide this problem? It will stay hidden on all future checks.</p>
				<p>
					You can show it again in the <a href="/settings" class="fancy-link text-primary-500"
						>settings</a
					>.
				</p>
			</div>
			<hr class="border-surface-500" />
			<div class="flex gap-2 justify-between items-center">
				<div class="flex gap-2 items-center">
					<Switch
						checked={!$settings.showHideWarning}
						onCheckedChange={() => ($settings.showHideWarning = !$settings.showHideWarning)}
						thumbInactive="bg-surface-300"
						controlInactive="bg-surface-500"
					/>
					<div class="text-sm">Don't show again</div>
				</div>
				<div class="flex gap-2">
					<Dialog.Close class="btn preset-filled-secondary-500">
						<Icon src={X} size="1rem" />
						Cancel
					</Dialog.Close>
					<Dialog.Close
						class="btn preset-filled-primary-500"
						onclick={() => hideProblem(currentProblem!)}
					>
						<Icon src={EyeOff} size="1rem" />
						Hide
					</Dialog.Close>
				</div>
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>

<Accordion collapsible>
	<Accordion.Item
		classes="card preset-tonal-secondary"
		controlHover="hover:bg-primary-500/20"
		value="commonSettings"
		panelClasses="px-4 py-4"
	>
		{#snippet control()}
			<div class="flex lg:flex-row flex-col justify-between lg:items-center items-start">
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
								<div class="flex justify-between items-center">
									<header
										class={`h5 font-semibold font-mono ${getProblemSeverityColor(problem.severity).textColor}`}
									>
										{problem.title}
									</header>
									<Tooltip.Root>
										<Tooltip.Trigger>
											<button
												class={`btn-icon ${getProblemSeverityColor(problem.severity).tonalPreset}`}
												onclick={() => handleHideProblem(problem)}
											>
												<Icon src={EyeOff} size="1rem" />
											</button>
										</Tooltip.Trigger>
										<Tooltip.Content
											class="p-2 rounded-xl border-2 border-surface-500 preset-filled-surface-400-600"
										>
											<span>Hide this problem</span>
										</Tooltip.Content>
									</Tooltip.Root>
								</div>
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
