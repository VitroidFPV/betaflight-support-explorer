import { GITHUB_PAT } from "$env/static/private"
import { Octokit } from "octokit"
import { json } from "@sveltejs/kit"
import type { Manufacturer } from "$lib/stores/targetsCache.js"

const octokit = new Octokit({
	auth: GITHUB_PAT
})

export async function GET() {
	try {
		const { data: manufacturers } = await octokit.request(
			"GET /repos/{owner}/{repo}/contents/{path}",
			{
				owner: "betaflight",
				repo: "config",
				path: "Manufacturers.md"
			}
		)

		let formattedManufacturers: Manufacturer[] = []

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

		return json(formattedManufacturers)
	} catch (error) {
		console.error("Error fetching manufacturers:", error)
		return json([], { status: 500 })
	}
}
