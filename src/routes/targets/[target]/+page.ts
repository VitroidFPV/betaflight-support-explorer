import type { PageLoad } from "./$types"
import { error } from "@sveltejs/kit"
import type { CBManufacturer, CBTarget } from "$lib/cloudBuildTypes"
import {
	extractBarometers,
	extractConfigDefines,
	extractDefineValue,
	extractImus,
	extractMagnetometers
} from "$lib/extractConfigDefines"

export const load: PageLoad = async ({ params, fetch }) => {
	const { target } = params

	const targetReleasesResponse = await fetch(`https://build.betaflight.com/api/targets/${target}`)
	const cloudBuildTarget: CBTarget = await targetReleasesResponse.json()

	// throw an error unless at least one release has unifiedConfig set to false
	if (cloudBuildTarget.releases.every((release) => release.unifiedConfig)) {
		throw error(404, "This target only has legacy unified configs and no config.h file")
	}

	const response = await fetch(`/api/target/${target}`)
	const config = await response.json()

	if (!response.ok) {
		throw error(response.status, config.error || "Failed to fetch target config")
	}

	const manufacturerId = config.content.match(/MANUFACTURER_ID\s+(\w+)/)?.[1] ?? "UNKNOWN"
	const manufacturerResponse = await fetch(
		`https://build.betaflight.com/api/manufacturers/${manufacturerId}`
	)

	// Fallback to using the manufacturer ID if the API lookup fails (url: null indicates no URL)
	let manufacturer: CBManufacturer = { id: manufacturerId, name: manufacturerId, url: null }
	if (manufacturerResponse.ok) {
		manufacturer = await manufacturerResponse.json()
	}

	const defines = extractConfigDefines(config.content)

	const formattedDefines = {
		MCU: extractDefineValue("FC_TARGET_MCU", defines),
		IMU: extractImus(defines),
		BARO: extractBarometers(defines),
		MAG: extractMagnetometers(defines)
	}

	console.log(formattedDefines)

	return {
		config,
		manufacturer,
		cloudBuildTarget,
		formattedDefines
	}
}
