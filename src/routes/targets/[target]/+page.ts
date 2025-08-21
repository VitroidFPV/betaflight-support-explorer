import type { PageLoad } from "./$types"
import { error } from "@sveltejs/kit"

export const load: PageLoad = async ({ params, fetch }) => {
	const { target } = params

	const response = await fetch(`/api/target/${target}`)
	const data = await response.json()

	if (!response.ok) {
		throw error(response.status, data.error || "Failed to fetch target data")
	}

	return {
		target: data
	}
}
