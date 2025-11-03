import type { PageLoad } from "./$types"
import { error } from "@sveltejs/kit"

export const load: PageLoad = async ({ params, fetch }) => {
	const { target } = params

	const response = await fetch(`/api/target/${target}`)
	const config = await response.json()

	if (!response.ok) {
		throw error(response.status, config.error || "Failed to fetch target config")
	}

	const manufacturerId = config.content.match(/MANUFACTURER_ID\s+(\w+)/)[1]
	const manufacturerResponse = await fetch(`/api/manufacturers/${manufacturerId}`)
	const manufacturer = await manufacturerResponse.json()

	if (!manufacturerResponse.ok) {
		throw error(manufacturerResponse.status, manufacturer.error || "Failed to fetch manufacturer")
	}

	return {
		config,
		manufacturer
	}
}
