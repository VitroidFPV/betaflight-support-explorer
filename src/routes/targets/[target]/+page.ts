import type { PageLoad } from "./$types"
import { error } from "@sveltejs/kit"

export const load: PageLoad = async ({ params, fetch }) => {
	const { target } = params

	type CloudBuildTarget = {
		releases: {
			release: string
			type: string
			date: string
			label: string
			cloudBuild: boolean
			unifiedConfig: boolean
			withdrawn: boolean
		}[]
		target: string
		manufacturer: string
	}

	const targetReleasesResponse = await fetch(`https://build.betaflight.com/api/targets/${target}`)
	const cloudBuildTarget: CloudBuildTarget = await targetReleasesResponse.json()

	// log all releases and their unifiedConfig value
	console.log(
		cloudBuildTarget.releases.map((release) => ({
			release: release.release,
			unifiedConfig: release.unifiedConfig
		}))
	)

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

	// Fallback to using the manufacturer ID if the API lookup fails
	let manufacturer = { id: manufacturerId, name: manufacturerId, contact: "" }
	if (manufacturerResponse.ok) {
		manufacturer = await manufacturerResponse.json()
	}

	return {
		config,
		manufacturer,
		cloudBuildTarget
	}
}
