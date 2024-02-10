import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

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

function extractDump(data: string): string | null {
	// match everything between "# dump master" and "batch end"
	const match = data.match(/# dump master([\s\S]*?)batch end/);

	return match ? match[1].trim() : null;
}

function extractDma(data: string): {[key: string]: {[key: string]: string}} | null {
    // match everything between "# dma show" and "# timer show"
    const match = data.match(/# dma show([\s\S]*?)# timer show/);

    if (match) {
        const dmaLines = match[1].trim().split('\n');
        const dmaObject: {[key: string]: {[key: string]: string}} = {};

        let currentDma = '';

        dmaLines.forEach((line) => {
            const dmaMatch = line.match(/(DMA\d) Channel (\d): (.*)/);

            if (dmaMatch) {
                currentDma = dmaMatch[1];
                const channel = `Channel ${dmaMatch[2]}`;
                const target = dmaMatch[3];
                if (!dmaObject[currentDma]) {
                    dmaObject[currentDma] = {};
                }
                dmaObject[currentDma][channel] = target;
            }
        });

        return dmaObject;
    } else {
        return null;
    }
}

function extractTimer(data: string): {[key: string]: {[key: string]: string} | string} | null {
    // match everything between "# timer show" and "#"
    const match = data.match(/# timer show([\s\S]*?)#/);

    if (match) {
        const timerLines = match[1].trim().split('\n');
        const timerObject: {[key: string]: {[key: string]: string} | string} = {};

        let currentTimer = '';

        timerLines.forEach((line) => {
            const timerMatch = line.match(/(TIM\d+):(.*)/);
            const channelMatch = line.match(/(CH\d) : (.*)/);

            if (timerMatch) {
                currentTimer = timerMatch[1];
                const status = timerMatch[2].trim();
                if (status === 'FREE') {
                    timerObject[currentTimer] = 'FREE';
                } else {
                    timerObject[currentTimer] = {};
                }
            } else if (channelMatch && timerObject[currentTimer] !== 'FREE') {
                const channel = channelMatch[1];
                const target = channelMatch[2];
                (timerObject[currentTimer] as {[key: string]: string})[channel] = target;
            }
        });

        return timerObject;
    } else {
        return null;
    }
}

export const load = (async ({params, fetch}) => {
	const key = params.key as string;
	let isBuildKey: boolean = false;

	// 15822928-d909-4488-9f17-4baa9c752eca = support key
	// 24452661cf65e9f33f55404fc5dcea75 = build key

	isBuildKey = key.length === 32;

	// Check if the key is correctly formatted
    if (!isBuildKey && !/^[\da-f]{8}-([\da-f]{4}-){3}[\da-f]{12}$/i.test(key)) {
		error(
			400,
			{
				message: 'Invalid key format! Check the key and try again.',
			}
		)
    }

	const buildUrl = `https://build.betaflight.com/api/builds/${key}/json`;
	const supportUrl = `https://build.betaflight.com/api/support/${key}`;

	if (!isBuildKey) {
		const supportResponse = await fetch(supportUrl);
		const supportText = await supportResponse.text();

		const supportBuildKeyMatch = supportText.match(/BUILD KEY: ([a-z0-9]+)/i);

		const supportBuildKey = supportBuildKeyMatch ? supportBuildKeyMatch[1] : null;
		const buildResponse = await fetch(`https://build.betaflight.com/api/builds/${supportBuildKey}/json`);
		const build = await buildResponse.json();

		const status = extractStatus(supportText);
		const problem = extractProblem(supportText);
		const dump = extractDump(supportText);
		const dma = extractDma(supportText);
		const timer = extractTimer(supportText);

		return {build, support: supportText, status, problem, dump, dma, timer};
	}

	const buildResponse = await fetch(buildUrl);
	const build = await buildResponse.json();
	return {build};
	
}) satisfies PageLoad;