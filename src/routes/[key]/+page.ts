import type { PageLoad } from './$types';

interface StatusObject {
[key: string]: string | number | boolean | null;
}

function extractStatus(data: string): StatusObject {
	const statusSection = data.match(/# status([\s\S]*?)(?=#|$)/);
	const statusLines = statusSection ? statusSection[1].trim().split('\n') : [];

	const statusObject: StatusObject = {};

	statusLines.forEach((line) => {
		const properties = line.split(',');
		properties.forEach((property) => {
		const match = property.match(/^\s*([^:=]+)\s*[:=]\s*(.+)\s*$/);
		if (match) {
			const key = match[1].trim();
			let value: string | number | boolean | null = match[2].trim();

			// Convert value to number if possible
			if (!isNaN(Number(value))) {
			value = Number(value);
			}

			// Convert boolean strings to boolean
			if (value === 'true' || value === 'false') {
			value = value === 'true';
			}

			statusObject[key] = value;
		}
		});
	});

	return statusObject;
}

function extractProblem(data: string): string | null {
    const match = data.match(/# Problem description\s*#\s*#\s*(.*)\s*#\s*#/);

    return match ? match[1].trim() : null;
}

export const load = (async ({params, fetch}) => {
	const key = params.key as string;
	let isBuildKey: boolean = false;

	// 15822928-d909-4488-9f17-4baa9c752eca = support key
	// 24452661cf65e9f33f55404fc5dcea75 = build key

	isBuildKey = key.length === 32;

	const buildUrl = `https://build.betaflight.com/api/builds/${key}/json`;
	const supportUrl = `https://build.betaflight.com/api/support/${key}`;

	// # IP: 109.81.126.123
	// # X-Amz-Cf-Id: 6apceAn9uMcZ6ih0nK-44gfsrEafBUmzr4GH1pXKW8CesiHy_UYjrg==
	// # X-Cfg-Ver: 10.10.0-debug-ad3520b
	// # X-Envoy-Expected-Rq-Timeout-Ms: 120000
	// # X-Envoy-External-Address: 109.81.126.123
	// # X-Forwarded-For: 109.81.126.123,130.176.143.72
	// # X-Forwarded-Proto: https
	// # X-Request-Id: 307f1a28-2a40-4b49-aedd-51d883bc87c8

	// ###

	// # # Problem description

	// # # bidirectinal dshot error

	// # ###

	// # version
	// # Betaflight / AT32F435M (A435) 4.5.0 Sep 19 2023 / 16:46:51 (1856d6f7e) MSP API: 1.46
	// # config rev: 8dbe16c
	// # board: manufacturer_id: AIRB, board_name: AIRBOTF435

	// # status
	// MCU AT32F435 Clock=288MHz, Vref=3.29V, Core temp=42degC
	// Stack size: 2048, Stack address: 0x2002fff0
	// Configuration: CONFIGURED, size: 3757, max available: 16384
	// Devices detected: SPI:1, I2C:1
	// Gyros detected: gyro 1 locked dma
	// GYRO=ICM42688P, ACC=ICM42688P, BARO=DPS310
	// OSD: MAX7456 (30 x 13)
	// BUILD KEY: 24452661cf65e9f33f55404fc5dcea75 (4.5.0-zulu)
	// System Uptime: 70 seconds, Current Time: 2024-01-24T19:47:01.120+00:00
	// CPU:22%, cycle time: 125, GYRO rate: 8000, RX rate: 15, System rate: 9
	// Voltage: 25 * 0.01V (0S battery - NOT PRESENT)
	// I2C Errors: 0
	// FLASH: JEDEC ID=0x00ef4018 16M
	// GPS: NOT ENABLED
	// Arming disable flags: RXLOSS CLI MSP

	// # flash_info
	// Flash sectors=256, sectorSize=65536, pagesPerSector=256, pageSize=256, totalSize=16777216 JEDEC ID=0x00ef4018
	// Partitions:
	//   0: FLASHFS   0 255
	// FlashFS size=16777216, usedSize=0

	// # dump master
	// ...
	// example start of support response

	// if only build key is provided, return {build}
	// if support key is provided, find build key from support response and return {build, support}
	// support is not json, it's text

	if (!isBuildKey) {
		const supportResponse = await fetch(supportUrl);
		const supportText = await supportResponse.text();

		const supportBuildKeyMatch = supportText.match(/BUILD KEY: ([a-z0-9]+)/i);

		const supportBuildKey = supportBuildKeyMatch ? supportBuildKeyMatch[1] : null;
		const buildResponse = await fetch(`https://build.betaflight.com/api/builds/${supportBuildKey}/json`);
		const build = await buildResponse.json();

		const status = extractStatus(supportText);
		const problem = extractProblem(supportText);

		return {build, support: supportText, status, problem};
	}

	const buildResponse = await fetch(buildUrl);
	const build = await buildResponse.json();
	return {build};
	
}) satisfies PageLoad;