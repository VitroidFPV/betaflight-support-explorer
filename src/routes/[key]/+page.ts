import type { PageLoad } from "./$types";
import { error } from "@sveltejs/kit";
import { extractStatus, extractProblem, extractDump, extractDma, extractTimer, extractSerial, extractModes } from "$lib/extract";

export const load = (async ({ params, fetch }) => {
	const key = params.key as string;
	let isBuildKey: boolean = false;

	// 15822928-d909-4488-9f17-4baa9c752eca = support key
	// 24452661cf65e9f33f55404fc5dcea75 = build key

	isBuildKey = key.length === 32;

	// Check if the key is correctly formatted
	if (!isBuildKey && !/^[\da-f]{8}-([\da-f]{4}-){3}[\da-f]{12}$/i.test(key)) {
		error(400, {
			message: "Invalid key format! Check the key and try again."
		});
	}

	const buildUrl = `https://build.betaflight.com/api/builds/${key}/json`;
	const supportUrl = `https://build.betaflight.com/api/support/${key}`;

	if (!isBuildKey) {
		console.log(key)
		const supportResponse = await fetch(supportUrl);
		const supportText = await supportResponse.text();

		const supportBuildKeyMatch = supportText.match(/BUILD KEY: ([a-z0-9]+)/i);

		const supportBuildKey = supportBuildKeyMatch ? supportBuildKeyMatch[1] : null;
		console.log(supportBuildKey);
		const buildResponse = await fetch(
			`https://build.betaflight.com/api/builds/${supportBuildKey}/json`
		);
		console.log(buildResponse)
		const build = await buildResponse.json();

		const status = extractStatus(supportText);
		const problem = extractProblem(supportText);
		const dump = extractDump(supportText);
		const dma = extractDma(supportText);
		const timer = extractTimer(supportText);
		const serial = extractSerial(supportText);
		const modes = extractModes(supportText);

		return { build, support: supportText, status, problem, dump, dma, timer, serial, modes };
	}

	const buildResponse = await fetch(buildUrl);
	const build = await buildResponse.json();
	return { build };
}) satisfies PageLoad;
