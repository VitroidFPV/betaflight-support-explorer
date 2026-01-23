import { env } from "$env/dynamic/private"
import { Octokit } from "octokit"
import { json } from "@sveltejs/kit"

const octokit = new Octokit(env.GITHUB_PAT ? { auth: env.GITHUB_PAT } : {})

export async function GET() {
	try {
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

		return json(formattedTargets)
	} catch (error) {
		console.error("Error fetching targets:", error)
		return json([], { status: 500 })
	}
}
