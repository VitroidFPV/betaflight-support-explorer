interface StatusObject {
	[key: string]: string | number | boolean | null;
}

export function extractStatus(data: string): StatusObject {
	const statusSection = data.match(/# status([\s\S]*?)(?=#|$)/);
	const statusLines = statusSection ? statusSection[1].trim().split("\n") : [];

	const statusObject: StatusObject = {};

	statusLines.forEach((line) => {
		const properties = line.split(",");
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
				if (value === "true" || value === "false") {
					value = value === "true";
				}

				statusObject[key] = value;
			}
		});
	});

	return statusObject;
}

export function extractProblem(data: string): string | null {
	const match = data.match(/# Problem description\s*#\s*#\s*(.*)\s*#\s*#/);

	return match ? match[1].trim() : null;
}

export function extractDump(data: string): string | null {
	// match everything between "# dump master" and "batch end"
	const match = data.match(/# dump master([\s\S]*?)batch end/);

	return match ? match[1].trim() : null;
}

export function extractDma(data: string): { [key: string]: { [key: string]: string } } | null {
	// match everything between "# dma show" and "# timer show"
	const match = data.match(/# dma show([\s\S]*?)# timer show/);

	if (match) {
		const dmaLines = match[1].trim().split("\n");
		const dmaObject: { [key: string]: { [key: string]: string } } = {};

		let currentDma = "";

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

export function extractTimer(data: string): { [key: string]: { [key: string]: string } | string } | null {
	// match everything between "# timer show" and "#"
	const match = data.match(/# timer show([\s\S]*?)#/);

	if (match) {
		const timerLines = match[1].trim().split("\n");
		const timerObject: { [key: string]: { [key: string]: string } | string } = {};

		let currentTimer = "";

		timerLines.forEach((line) => {
			const timerMatch = line.match(/(TIM\d+):(.*)/);
			const channelMatch = line.match(/(CH\d) : (.*)/);

			if (timerMatch) {
				currentTimer = timerMatch[1];
				const status = timerMatch[2].trim();
				if (status === "FREE") {
					timerObject[currentTimer] = "FREE";
				} else {
					timerObject[currentTimer] = {};
				}
			} else if (channelMatch && timerObject[currentTimer] !== "FREE") {
				const channel = channelMatch[1];
				const target = channelMatch[2];
				(timerObject[currentTimer] as { [key: string]: string })[channel] = target;
			}
		});

		return timerObject;
	} else {
		return null;
	}
}

export function extractSerial(data: string): { identifier: string; function: string[]; msp: number; gps: number; telemetry: number; blackbox: number }[] | null{
	const match = data.match(/# serial([\s\S]*?)#/);

	if (match) {
		const serialLines = match[1].trim().split("\n");
		const serialObject: { identifier: number; function: number; msp: number; gps: number; telemetry: number; blackbox: number }[] = [];

		serialLines.forEach((line) => {
			const serialMatch = line.match(/serial (\d+) (\d+) (\d+) (\d+) (\d+) (\d+)/);
			if (serialMatch) {
				const port = Number(serialMatch[1]);
				const func = Number(serialMatch[2]);
				const msp = Number(serialMatch[3]);
				const gps = Number(serialMatch[4]);
				const telemetry = Number(serialMatch[5]);
				const blackbox = Number(serialMatch[6]);

				serialObject.push({ identifier: port, function: func, msp, gps, telemetry, blackbox });
			}
		});

		// console.log(serialObject);

		const identifierNames = [
			{ name: "None", value: -1 },
			{ name: "UART 1", value: 0 },
			{ name: "UART 2", value: 1 },
			{ name: "UART 3", value: 2 },
			{ name: "UART 4", value: 3 },
			{ name: "UART 5", value: 4 },
			{ name: "UART 6", value: 5 },
			{ name: "UART 7", value: 6 },
			{ name: "UART 8", value: 7 },
			{ name: "UART 9", value: 8 },
			{ name: "UART 10", value: 9 },
			{ name: "USB VCP", value: 20 },
			{ name: "Soft Serial 1", value: 30 },
			{ name: "Soft Serial 2", value: 31 },
			{ name: "LPUART 1", value: 40 }
		];

		const functionNames = [
			{ name: "None", value: 0 },
			{ name: "MSP", value: 1 << 0 },
			{ name: "GPS", value: 1 << 1 },
			{ name: "FrSky Hub", value: 1 << 2 },
			{ name: "HoTT", value: 1 << 3 },
			{ name: "LTM", value: 1 << 4 },
			{ name: "SmartPort", value: 1 << 5 },
			{ name: "RX Serial", value: 1 << 6 },
			{ name: "Blackbox", value: 1 << 7 },
			{ name: "Not Used", value: 1 << 8 },
			{ name: "MAVLink", value: 1 << 9 },
			{ name: "ESC Sensor", value: 1 << 10 },
			{ name: "VTX SmartAudio", value: 1 << 11 },
			{ name: "Telemetry iBus", value: 1 << 12 },
			{ name: "VTX Tramp", value: 1 << 13 },
			{ name: "RC Device", value: 1 << 14 },
			{ name: "Lidar TF", value: 1 << 15 },
			{ name: "FrSky OSD", value: 1 << 16 },
			{ name: "VTX MSP", value: (1 << 17)}
		];

		const formattedSerial = serialObject.map((serial) => {
			const identifier = identifierNames.find((port) => port.value === serial.identifier)?.name || "Unknown";
			const functions = functionNames.filter((func) => serial.function & func.value).map((func) => func.name);

			return {
				identifier,
				function: functions,
				msp: serial.msp,
				gps: serial.gps,
				telemetry: serial.telemetry,
				blackbox: serial.blackbox
			};

		});

		return formattedSerial;
	}
	return null;
}