import type { PageLoad } from "./$types"
import { browser } from "$app/environment"
import { get } from "svelte/store"
import { targetsCache, isCacheValid, updateCache } from "$lib/stores/targetsCache.js"
import type { Manufacturer, Target } from "$lib/stores/targetsCache.js"

export const load: PageLoad = async ({ fetch }) => {
	// If we're in the browser, check cache first
	if (browser) {
		const cachedData = get(targetsCache)

		if (isCacheValid(cachedData)) {
			console.log("Using cached data - no server call needed")
			return {
				targets: cachedData.targets,
				manufacturers: cachedData.manufacturers,
				fromCache: true
			}
		}
	}

	console.log("Fetching fresh data from API")

	// Fetch fresh data from the API
	const [manufacturersResponse, targetsResponse] = await Promise.all([
		fetch("https://build.betaflight.com/api/manufacturers"),
		fetch("https://build.betaflight.com/api/targets")
	])

	const manufacturers: Manufacturer[] = await manufacturersResponse.json()
	const targets: Target[] = await targetsResponse.json()

	// Combine targets with their manufacturer info as an array of objects
	const targetsWithManufacturers = targets.map((target) => {
		const manufacturer = manufacturers.find((m) => m.id === target.manufacturer)
		return {
			...target,
			manufacturer: manufacturer?.name || "Unknown"
		}
	})

	// Update cache if we're in the browser
	if (browser) {
		updateCache(targetsWithManufacturers, manufacturers)
	}

	return {
		targets: targetsWithManufacturers,
		manufacturers,
		fromCache: false
	}
}
