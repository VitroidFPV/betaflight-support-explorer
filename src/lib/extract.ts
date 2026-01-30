interface StatusObject {
	[key: string]: string | number | boolean | null
}

export function extractStatus(data: string): StatusObject {
	const statusSection = data.match(/# status([\s\S]*?)(?=#|$)/)
	const statusLines = statusSection ? statusSection[1].trim().split("\n") : []

	const statusObject: StatusObject = {}

	statusLines.forEach((line) => {
		const properties = line.split(",")
		properties.forEach((property) => {
			const match = property.match(/^\s*([^:=]+)\s*[:=]\s*(.+)\s*$/)
			if (match) {
				const key = match[1].trim()
				let value: string | number | boolean | null = match[2].trim()

				// Convert value to number if possible
				if (!isNaN(Number(value))) {
					value = Number(value)
				}

				// Convert boolean strings to boolean
				if (value === "true" || value === "false") {
					value = value === "true"
				}

				statusObject[key] = value
			}
		})
	})

	return statusObject
}

export function extractProblem(data: string): string | null {
	const match = data.match(/# Problem description\s*#\s*#\s*(.*)\s*#\s*#/)

	return match ? match[1].trim() : null
}

export function extractDump(data: string, showFullText: boolean = false): string | null {
	if (showFullText) {
		// Find the position of "# version"
		const versionIndex = data.indexOf("# version")
		if (versionIndex === -1) return null

		// Find the start of the line before "# version" by looking backwards for a newline
		let startIndex = versionIndex
		// First, go back past any whitespace/newlines to the previous line's content
		while (startIndex > 0 && (data[startIndex - 1] === "\n" || data[startIndex - 1] === "\r")) {
			startIndex--
		}
		// Then find the start of that previous line
		while (startIndex > 0 && data[startIndex - 1] !== "\n") {
			startIndex--
		}

		// Find "batch end" position
		const batchEndIndex = data.indexOf("batch end")
		if (batchEndIndex === -1) return null

		const endIndex = batchEndIndex + "batch end".length
		return data.slice(startIndex, endIndex).trim()
	} else {
		// match everything between "# dump master" and "batch end"
		const match = data.match(/# dump master([\s\S]*?)batch end/)
		return match ? match[1].trim() : null
	}
}

export function extractDma(data: string): { [key: string]: { [key: string]: string } } | null {
	// match everything between "# dma show" and "# timer show"
	const match = data.match(/# dma show([\s\S]*?)# timer show/)

	if (match) {
		const dmaLines = match[1].trim().split("\n")
		const dmaObject: { [key: string]: { [key: string]: string } } = {}

		let currentDma = ""

		dmaLines.forEach((line) => {
			const dmaMatch = line.match(/(DMA\d) Channel (\d): (.*)/)

			if (dmaMatch) {
				currentDma = dmaMatch[1]
				const channel = `Channel ${dmaMatch[2]}`
				const target = dmaMatch[3]
				if (!dmaObject[currentDma]) {
					dmaObject[currentDma] = {}
				}
				dmaObject[currentDma][channel] = target
			}
		})

		return dmaObject
	} else {
		return null
	}
}

export function extractTimer(
	data: string
): { [key: string]: { [key: string]: string } | string } | null {
	// match everything between "# timer show" and "#"
	const match = data.match(/# timer show([\s\S]*?)#/)

	if (match) {
		const timerLines = match[1].trim().split("\n")
		const timerObject: { [key: string]: { [key: string]: string } | string } = {}

		let currentTimer = ""

		timerLines.forEach((line) => {
			const timerMatch = line.match(/(TIM\d+):(.*)/)
			const channelMatch = line.match(/(CH\d) : (.*)/)

			if (timerMatch) {
				currentTimer = timerMatch[1]
				const status = timerMatch[2].trim()
				if (status === "FREE") {
					timerObject[currentTimer] = "FREE"
				} else {
					timerObject[currentTimer] = {}
				}
			} else if (channelMatch && timerObject[currentTimer] !== "FREE") {
				const channel = channelMatch[1]
				const target = channelMatch[2]
				;(timerObject[currentTimer] as { [key: string]: string })[channel] = target
			}
		})

		return timerObject
	} else {
		return null
	}
}

export function extractSerial(data: string):
	| {
			identifier: string
			function: string[]
			msp: number
			gps: number
			telemetry: number
			blackbox: number
	  }[]
	| null {
	const match = data.match(/# serial([\s\S]*?)#/)

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
	]

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
		{ name: "VTX MSP", value: 1 << 17 }
	]

	if (match) {
		const serialLines = match[1].trim().split("\n")
		const serialObject: {
			identifier: string
			function: number
			msp: number
			gps: number
			telemetry: number
			blackbox: number
		}[] = []

		const lineRegex = /serial\s+(\w+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/

		for (const line of serialLines) {
			const matches = line.trim().match(lineRegex)
			if (matches) {
				const [, portId, func, msp, gps, telemetry, blackbox] = matches

				let identifier = portId
				if (!isNaN(Number(portId))) {
					const found = identifierNames.find((id) => id.value === parseInt(portId))
					identifier = found ? found.name : portId
				}

				serialObject.push({
					identifier,
					function: parseInt(func),
					msp: parseInt(msp),
					gps: parseInt(gps),
					telemetry: parseInt(telemetry),
					blackbox: parseInt(blackbox)
				})
			}
		}

		const formattedSerial = serialObject.map((serial) => {
			const functions = functionNames
				.filter((func) => serial.function & func.value)
				.map((func) => func.name)

			return {
				identifier: serial.identifier,
				function: functions,
				msp: serial.msp,
				gps: serial.gps,
				telemetry: serial.telemetry,
				blackbox: serial.blackbox
			}
		})

		return formattedSerial
	}
	return null
}

export function extractModes(
	data: string
): { mode: string; channel: number; low: number; high: number }[] | null {
	const boxesSource = `
static const box_t boxes[CHECKBOX_ITEM_COUNT] = {
    { .boxId = BOXARM, .boxName = "ARM", .permanentId = 0 },
    { .boxId = BOXANGLE, .boxName = "ANGLE", .permanentId = 1 },
    { .boxId = BOXHORIZON, .boxName = "HORIZON", .permanentId = 2 },
    { .boxId = BOXALTHOLD, .boxName = "ALTHOLD", .permanentId = 3 },
    { .boxId = BOXANTIGRAVITY, .boxName = "ANTI GRAVITY", .permanentId = 4 },
    { .boxId = BOXMAG, .boxName = "MAG", .permanentId = 5 },
    { .boxId = BOXHEADFREE, .boxName = "HEADFREE", .permanentId = 6 },
    { .boxId = BOXHEADADJ, .boxName = "HEADADJ", .permanentId = 7 },
    { .boxId = BOXCAMSTAB, .boxName = "CAMSTAB", .permanentId = 8 },
//    { .boxId = BOXCAMTRIG, .boxName = "CAMTRIG", .permanentId = 9 },
//    { .boxId = BOXGPSHOME, .boxName = "GPS HOME", .permanentId = 10 },
    { .boxId = BOXPOSHOLD, .boxName = "POS HOLD", .permanentId = 11 },
    { .boxId = BOXPASSTHRU, .boxName = "PASSTHRU", .permanentId = 12 },
    { .boxId = BOXBEEPERON, .boxName = "BEEPER", .permanentId = 13 },
//    { .boxId = BOXLEDMAX, .boxName = "LEDMAX", .permanentId = 14 }, (removed)
    { .boxId = BOXLEDLOW, .boxName = "LEDLOW", .permanentId = 15 },
//    { .boxId = BOXLLIGHTS, .boxName = "LLIGHTS", .permanentId = 16 }, (removed)
    { .boxId = BOXCALIB, .boxName = "CALIB", .permanentId = 17 },
//    { .boxId = BOXGOV, .boxName = "GOVERNOR", .permanentId = 18 }, (removed)
    { .boxId = BOXOSD, .boxName = "OSD DISABLE", .permanentId = 19 },
    { .boxId = BOXTELEMETRY, .boxName = "TELEMETRY", .permanentId = 20 },
//    { .boxId = BOXGTUNE, .boxName = "GTUNE", .permanentId = 21 }, (removed)
//    { .boxId = BOXRANGEFINDER, .boxName = "RANGEFINDER", .permanentId = 22 }, (removed)
    { .boxId = BOXSERVO1, .boxName = "SERVO1", .permanentId = 23 },
    { .boxId = BOXSERVO2, .boxName = "SERVO2", .permanentId = 24 },
    { .boxId = BOXSERVO3, .boxName = "SERVO3", .permanentId = 25 },
    { .boxId = BOXBLACKBOX, .boxName = "BLACKBOX", .permanentId = 26 },
    { .boxId = BOXFAILSAFE, .boxName = "FAILSAFE", .permanentId = 27 },
    { .boxId = BOXAIRMODE, .boxName = "AIR MODE", .permanentId = 28 },
    { .boxId = BOX3D, .boxName = "3D DISABLE", .permanentId = 29},
    { .boxId = BOXFPVANGLEMIX, .boxName = "FPV ANGLE MIX", .permanentId = 30},
    { .boxId = BOXBLACKBOXERASE, .boxName = "BLACKBOX ERASE", .permanentId = 31 },
    { .boxId = BOXCAMERA1, .boxName = "CAMERA CONTROL 1", .permanentId = 32},
    { .boxId = BOXCAMERA2, .boxName = "CAMERA CONTROL 2", .permanentId = 33},
    { .boxId = BOXCAMERA3, .boxName = "CAMERA CONTROL 3", .permanentId = 34 },
    { .boxId = BOXCRASHFLIP, .boxName = "FLIP OVER AFTER CRASH", .permanentId = 35 },
    { .boxId = BOXPREARM, .boxName = "PREARM", .permanentId = 36 },
    { .boxId = BOXBEEPGPSCOUNT, .boxName = "GPS BEEP SATELLITE COUNT", .permanentId = 37 },
//    { .boxId = BOX3DONASWITCH, .boxName = "3D ON A SWITCH", .permanentId = 38 }, (removed)
    { .boxId = BOXVTXPITMODE, .boxName = "VTX PIT MODE", .permanentId = 39 },
    { .boxId = BOXUSER1, .boxName = BOX_USER1_NAME, .permanentId = 40 }, // may be overridden by modeActivationConfig
    { .boxId = BOXUSER2, .boxName = BOX_USER2_NAME, .permanentId = 41 },
    { .boxId = BOXUSER3, .boxName = BOX_USER3_NAME, .permanentId = 42 },
    { .boxId = BOXUSER4, .boxName = BOX_USER4_NAME, .permanentId = 43 },
    { .boxId = BOXPIDAUDIO, .boxName = "PID AUDIO", .permanentId = 44 },
    { .boxId = BOXPARALYZE, .boxName = "PARALYZE", .permanentId = 45 },
    { .boxId = BOXGPSRESCUE, .boxName = "GPS RESCUE", .permanentId = 46 },
    { .boxId = BOXACROTRAINER, .boxName = "ACRO TRAINER", .permanentId = 47 },
    { .boxId = BOXVTXCONTROLDISABLE, .boxName = "VTX CONTROL DISABLE", .permanentId = 48},
    { .boxId = BOXLAUNCHCONTROL, .boxName = "LAUNCH CONTROL", .permanentId = 49 },
    { .boxId = BOXMSPOVERRIDE, .boxName = "MSP OVERRIDE", .permanentId = 50},
    { .boxId = BOXSTICKCOMMANDDISABLE, .boxName = "STICK COMMANDS DISABLE", .permanentId = 51},
    { .boxId = BOXBEEPERMUTE, .boxName = "BEEPER MUTE", .permanentId = 52},
    { .boxId = BOXREADY, .boxName = "READY", .permanentId = 53},
    { .boxId = BOXLAPTIMERRESET, .boxName = "LAP TIMER RESET", .permanentId = 54},
};
	`

	// sourced from main betaflight codebase in src/main/msp/msp_box.c
	// when file is updated, this should be updated as well
	// unless I forget

	const boxesMatch = boxesSource.match(/BOX([A-Z0-9]+), .boxName = "(.*)", .permanentId = (\d+)/g)
	const boxes = boxesMatch
		? boxesMatch.map((box) => {
				const match = box.match(/BOX([A-Z0-9]+), .boxName = "(.*)", .permanentId = (\d+)/)
				return { name: match![2], id: Number(match![3]) }
			}, [])
		: []

	const match = data.match(/# aux([\s\S]*?)#/)

	if (match) {
		const auxLines = match[1].trim().split("\n")
		let auxObject: { mode: string; channel: number; low: number; high: number }[] = []

		auxLines.forEach((line) => {
			const auxMatch = line.match(/aux (\d+) (\d+) (\d+) (\d+) (\d+)/)
			if (auxMatch) {
				const mode = boxes.find((box) => box.id === Number(auxMatch[2]))?.name || "Unknown"
				const channel = Number(auxMatch[3])
				const low = Number(auxMatch[4])
				const high = Number(auxMatch[5])

				auxObject.push({ mode, channel, low, high })
			}
		})

		// filters empty aux slots
		auxObject = auxObject.filter((aux) => aux.low !== aux.high)

		if (auxObject.length === 0) {
			return null
		}

		return auxObject
	} else {
		return null
	}
}

export function extractCliLine(data: string, command: string): string | null {
	// match data for "set <command> = <value>"
	const match = data.match(new RegExp(`set ${command} = (.*)`))

	return match ? match[1].trim() : null
}

export function extractNonSetCliLine(data: string, prefix: string): string | null {
	// match for "<prefix> <value>"
	const match = data.match(new RegExp(`${prefix} (.*)`))

	return match ? match[1].trim() : null
}
