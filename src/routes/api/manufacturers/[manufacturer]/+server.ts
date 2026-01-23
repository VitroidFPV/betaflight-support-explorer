import { env } from "$env/dynamic/private"
import { Octokit } from "octokit"
import { json } from "@sveltejs/kit"
import type { CBManufacturer } from "$lib/cloudBuildTypes"

const octokit = new Octokit(env.GITHUB_PAT ? { auth: env.GITHUB_PAT } : {})

export async function GET({ params }) {
	const { manufacturer } = params

	if (!manufacturer) {
		return json({ error: "Manufacturer parameter is required" }, { status: 400 })
	}

	try {
		const { data: manufacturers } = await octokit.request(
			"GET /repos/{owner}/{repo}/contents/{path}",
			{
				owner: "betaflight",
				repo: "config",
				path: "Manufacturers.md"
			}
		)

		let formattedManufacturers: CBManufacturer[] = []

		if (Array.isArray(manufacturers)) {
			console.log("Received array of files/directories")
		} else if ("content" in manufacturers) {
			const table = atob(manufacturers.content ?? "")
				.split("\n")
				.slice(7)
				.filter((line) => line.trim().length > 0)
			formattedManufacturers = table.map((line) => {
				// skip first | and last |
				const [id, name, contact] = line.split("|").slice(1, -1)
				return { id: id.trim(), name: name.trim(), contact: contact.trim() }
			})
		} else {
			console.log("No content available")
		}

		// Find the specific manufacturer by ID
		const foundManufacturer = formattedManufacturers.find((m) => m.id === manufacturer)

		if (!foundManufacturer) {
			return json({ error: `Manufacturer "${manufacturer}" not found` }, { status: 404 })
		}

		return json(foundManufacturer)
	} catch (error) {
		console.error("Error fetching manufacturer:", error)
		return json({ error: "Internal server error" }, { status: 500 })
	}
}
