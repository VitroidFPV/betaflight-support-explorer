import type { PageLoad } from "./$types";
import { error } from "@sveltejs/kit";
import { extractStatus, extractProblem, extractDump, extractDma, extractTimer, extractSerial, extractModes, extractCliLine } from "$lib/extract";
import { SemVer } from "semver";
import { previousIds } from "$lib/stores/previousIds";
import { get } from "svelte/store";

type BuildConfig = {
	Manufacturer: string;
	Target: string;
	MCU: string;
}

type BuildRequest = {
	Release: string;
	Tag: string;
	Options: string[];
}

type PreviousId = {
	id: string;
	createdAt: number;
	manufacturer: string;
	target: string;
	version: string;
	problemDescription: string;
	options: string[];
	armDisableFlags: string[];
}

function addPreviousId(currentId: string, config: BuildConfig | undefined, request: BuildRequest | undefined, problem: string | null, ArmingDisableFlags: string[]) {
	if (!config || !request) {
		console.error("No config or request found");
		return;
	}

	console.log("Adding previous id");
	
	const existingId = get(previousIds).find((id: PreviousId) => id.id === currentId);
	if (!existingId) {
		previousIds.update((ids) => [...ids, {
			id: currentId,
			createdAt: Date.now(),
			manufacturer: config.Manufacturer,
			target: config.Target,
			version: request.Release,
			problemDescription: problem ?? "",
			options: request.Options,
			armDisableFlags: ArmingDisableFlags,
		}]);
	}
}

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
		const supportResponse = await fetch(supportUrl);
		const supportText = await supportResponse.text();

		const versionMatch = supportText.match(/Betaflight \/ .* (\d+\.\d+\.\d+)/);
		const version = versionMatch ? versionMatch[1] : null;
		if (version) {
			const semver = new SemVer(version);
			if (semver.compare("4.4.0") === -1) {
				return error(400, {
					message: "The data in this Support ID is from an old version of Betaflight which doesn't provide the necessary info."
				});
			}
		}

		const supportBuildKeyMatch = supportText.match(/BUILD KEY: ([a-z0-9]+)/i);
		const supportBuildKey = supportBuildKeyMatch ? supportBuildKeyMatch[1] : null;
		const buildResponse = await fetch(
			`https://build.betaflight.com/api/builds/${supportBuildKey}/json`
		);
		let build = null;
		if (buildResponse.ok) {
			build = await buildResponse.json();	
		} else {
			return error(400, {
				message: "The data in this Support ID is missing a valid Cloud Build Key. Likely from a locally built firmware."
			});
		}

		const status = extractStatus(supportText);
		const problem = extractProblem(supportText);
		const dump = extractDump(supportText);
		const dma = extractDma(supportText);
		const timer = extractTimer(supportText);
		const serial = extractSerial(supportText);
		const modes = extractModes(supportText);

		const commonSettings = {
			"Denominations": {
				"imuDenom": {
					name: "IMU Denom",
					value: extractCliLine(supportText, "imu_process_denom")
				},
				"pidDenom": {
					name: "PID Denom",
					value: extractCliLine(supportText, "pid_process_denom")
				},
			},
			
			"Receiver Settings": {
				"rxProtocol": {
					name: "RX Protocol",
					value: extractCliLine(supportText, "serialrx_provider")
				},
				"rxInverted": {
					name: "RX Inverted",
					value: extractCliLine(supportText, "serialrx_inverted")
				},
				"rxHalfDuplex": {
					name: "RX Half Duplex",
					value: extractCliLine(supportText, "serialrx_halfduplex")
				},
			},

			"DShot Config": {
				"escProtocol": {
					name: "ESC Protocol",
					value: extractCliLine(supportText, "motor_pwm_protocol")
				},
				"dshotBurst": {
					name: "DShot Burst",
					value: extractCliLine(supportText, "dshot_burst")
				},
				"dshotBidir": {
					name: "Bidirectional DShot",
					value: extractCliLine(supportText, "dshot_bidir")
				},
				"dshotEdt": {
					name: "DShot EDT",
					value: extractCliLine(supportText, "dshot_edt")
				},
				"dshotBitbang": {
					name: "DShot Bitbang",
					value: extractCliLine(supportText, "dshot_bitbang")
				},
				"dshotBitbangTimer": {
					name: "DShot Bitbang Timer",
					value: extractCliLine(supportText, "dshot_bitbang_timer")
				},
			},
			"Motor Config": {
				"motorPoles": {
					name: "Motor Poles",
					value: extractCliLine(supportText, "motor_poles")
				},
				"motorsReversed": {
					name: "Motors Reversed",
					value: extractCliLine(supportText, "yaw_motors_reversed")
				},
				"motorOutputLimit": {
					name: "Motor Output Limit",
					value: extractCliLine(supportText, "motor_output_limit")
				},
			}
		}

		// Add the support ID to the previous IDs store
		addPreviousId(key,build.Config, build.Request, problem, (status?.["Arming disable flags"] as string)?.split(" ") ?? []);

		return { build, support: supportText, status, problem, dump, dma, timer, serial, modes, commonSettings };
	}

	const buildResponse = await fetch(buildUrl);
	const build = await buildResponse.json();
	return { build };
}) satisfies PageLoad;
