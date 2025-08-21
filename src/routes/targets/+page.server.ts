import { GITHUB_PAT } from "$env/static/private"
import { Octokit } from "octokit"
import {
	targetsCache,
	isCacheValid,
	updateCache,
	type Manufacturer
} from "$lib/stores/targetsCache.js"
import { get } from "svelte/store"

const octokit = new Octokit({
	auth: GITHUB_PAT
})

async function fetchFreshData() {
	const { data: manufacturers } = await octokit.request(
		"GET /repos/{owner}/{repo}/contents/{path}",
		{
			owner: "betaflight",
			repo: "config",
			path: "Manufacturers.md"
		}
	)

	let formattedManufacturers: Manufacturer[] = []

	// Check if manufacturers is an array or a single file object
	if (Array.isArray(manufacturers)) {
		console.log("Received array of files/directories")
	} else if ("content" in manufacturers) {
		const table = atob(manufacturers.content ?? "")
			.split("\n")
			.slice(7)
		formattedManufacturers = table.map((line) => {
			// skip first | and last |
			const [id, name, contact] = line.split("|").slice(1, -1)
			return { id, name, contact }
		})
	} else {
		console.log("No content available")
	}

	const { data: targets } = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
		owner: "betaflight",
		repo: "config",
		path: "configs"
	})

	let formattedTargets: string[] = []

	if (Array.isArray(targets)) {
		formattedTargets = targets.map((target) => {
			return target.name
		})
	} else {
		console.log("No content available")
	}

	return { manufacturers: formattedManufacturers, targets: formattedTargets }
}

export const load = async () => {
	// Check if we have valid cached data
	const cachedData = get(targetsCache)

	if (isCacheValid(cachedData)) {
		console.log("Using cached targets and manufacturers data")
		return {
			manufacturers: cachedData.manufacturers,
			targets: cachedData.targets,
			fromCache: true
		}
	}

	console.log("Fetching fresh targets and manufacturers data")
	const freshData = await fetchFreshData()

	// Update cache with fresh data
	updateCache(freshData.targets, freshData.manufacturers)

	return {
		...freshData,
		fromCache: false
	}
}
