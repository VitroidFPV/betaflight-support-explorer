import { GITHUB_PAT } from "$env/static/private"
import { Octokit } from "octokit"

const octokit = new Octokit({
	auth: GITHUB_PAT
})

export const load = async () => {
	const { data: manufacturers } = await octokit.request(
		"GET /repos/{owner}/{repo}/contents/{path}",
		{
			owner: "betaflight",
			repo: "config",
			path: "Manufacturers.md"
		}
	)

	let formattedManufacturers: { id: string; name: string; contact: string }[] = []

	// Check if manufacturers is an array or a single file object
	if (Array.isArray(manufacturers)) {
		console.log("Received array of files/directories")
	} else if ("content" in manufacturers) {
		// console.log(atob(manufacturers.content ?? ""))
		// manufacturers.content =
		// # Manufacturer Ids
		//
		// This is the official list of manufacturer ids (`manufacturer_id` in the target config) that will be supported for loading onto board configurations by Betaflight configurator.
		//
		//
		// |Manufacturer Id|Name|Contact|
		// |-|-|-|
		// |CUST|'Custom', to be used for homebrew targets||
		// |FOSS|Free open source target definitions||
		// |COMM|Community provided target definitions for closed source targets||
		// |LEGA|Closed source legacy targets without a maintainer||
		// ...
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

	// 	{
	//     name: 'AOCODARCF722_AIO',
	//     path: 'configs/AOCODARCF722_AIO',
	//     sha: 'b3a3275c6d4a7bf589471bb9ac4a8941c8152c5f',
	//     size: 0,
	//     url: 'https://api.github.com/repos/betaflight/config/contents/configs/AOCODARCF722_AIO?ref=master',
	//     html_url: 'https://github.com/betaflight/config/tree/master/configs/AOCODARCF722_AIO',
	//     git_url: 'https://api.github.com/repos/betaflight/config/git/trees/b3a3275c6d4a7bf589471bb9ac4a8941c8152c5f',
	//     download_url: null,
	//     type: 'dir',
	//     _links: {
	//       self: 'https://api.github.com/repos/betaflight/config/contents/configs/AOCODARCF722_AIO?ref=master',
	//       git: 'https://api.github.com/repos/betaflight/config/git/trees/b3a3275c6d4a7bf589471bb9ac4a8941c8152c5f',
	//       html: 'https://github.com/betaflight/config/tree/master/configs/AOCODARCF722_AIO'
	//     }
	//   },
	//   {
	//     name: 'AOCODARCF7DUAL',
	//     path: 'configs/AOCODARCF7DUAL',
	//     sha: 'a2cb4ce371b6b0837c1d8d60039efd952fa88e49',
	//     size: 0,
	//     url: 'https://api.github.com/repos/betaflight/config/contents/configs/AOCODARCF7DUAL?ref=master',
	//     html_url: 'https://github.com/betaflight/config/tree/master/configs/AOCODARCF7DUAL',
	//     git_url: 'https://api.github.com/repos/betaflight/config/git/trees/a2cb4ce371b6b0837c1d8d60039efd952fa88e49',
	//     download_url: null,
	//     type: 'dir',
	//     _links: {
	//       self: 'https://api.github.com/repos/betaflight/config/contents/configs/AOCODARCF7DUAL?ref=master',
	//       git: 'https://api.github.com/repos/betaflight/config/git/trees/a2cb4ce371b6b0837c1d8d60039efd952fa88e49',
	//       html: 'https://github.com/betaflight/config/tree/master/configs/AOCODARCF7DUAL'
	//     }
	//   },
	//   {
	//     name: 'AOCODARCH7DUAL',
	//     path: 'configs
	// ...
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
