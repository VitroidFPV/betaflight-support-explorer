import type { ProblemDefinition } from "./types"

// Global constants
const lowerEndMcus = ["F411", "F405", "F435", "F722", "G473"]

// USE_SERIALRX_CRSF
// USE_SERIALRX_FPORT
// USE_SERIALRX_GHST
// USE_SERIALRX_IBUS
// USE_SERIALRX_JETIEXBUS
// USE_SERIALRX_SBUS
// USE_SERIALRX_SPEKTRUM
// USE_SERIALRX_SRXL2
// USE_SERIALRX_SUMD
// USE_SERIALRX_SUMH
// USE_SERIALRX_TARGET_CUSTOM
// USE_SERIALRX_XBUS

// serialrx_provider = CRSF
// Allowed values: NONE, SPEK2048, SBUS, SUMD, SUMH, XB-B, XB-B-RJ01, IBUS, JETIEXBUS, CRSF, SRXL, CUSTOM, FPORT, SRXL2, GHST, SPEK1024

const rxProtocolMap = [
	{
		define: "USE_SERIALRX_CRSF",
		cli: ["CRSF"]
	},
	{
		define: "USE_SERIALRX_FPORT",
		cli: ["FPORT"]
	},
	{
		define: "USE_SERIALRX_GHST",
		cli: ["GHST"]
	},
	{
		define: "USE_SERIALRX_IBUS",
		cli: ["IBUS"]
	},
	{
		define: "USE_SERIALRX_JETIEXBUS",
		cli: ["JETIEXBUS"]
	},
	{
		define: "USE_SERIALRX_SBUS",
		cli: ["SBUS"]
	},
	{
		define: "USE_SERIALRX_SPEKTRUM",
		cli: ["SPEK2048", "SPEK1024", "SRXL"]
	},
	{
		define: "USE_SERIALRX_SRXL2",
		cli: ["SRXL2"]
	},
	{
		define: "USE_SERIALRX_SUMD",
		cli: ["SUMD"]
	},
	{
		define: "USE_SERIALRX_SUMH",
		cli: ["SUMH"]
	},
	{
		define: "USE_SERIALRX_TARGET_CUSTOM",
		cli: ["CUSTOM"]
	},
	{
		define: "USE_SERIALRX_XBUS",
		cli: ["XBUS"]
	}
]

export const problemDefinitions: ProblemDefinition[] = [
	{
		id: "low-pid-rate",
		title: "Low PID Loop Rate",
		description:
			"PID loop rate is lower than 1/4 of the gyro rate, which may cause reduced performance in most setups.",
		severity: "warning",
		check: (data) => {
			const pidDenom = data.commonSettings["Denominations"]?.["pidDenom"]?.value
			if (!pidDenom) return false
			return parseInt(pidDenom) > 4
		}
	},

	{
		id: "high-pid-rate",
		title: "High PID Loop Rate",
		description: (data, values) => {
			if (!values) {
				return "When using a G4, F4, or F722 MCU, it can struggle with an 8kHz PID loop rate. Consider using a lower rate to avoid instability."
			}
			return `Current PID loop rate: <strong>${values.pidRate}Hz</strong>, Detected MCU: <strong>${values.mcu}</strong>.<br>
			G4, F4, and F722 MCUs can struggle with an 8kHz PID loop rate. Consider using a lower rate to avoid instability.`
		},
		severity: "warning",
		check: (data) => {
			const gyroRateStr = data.status?.["GYRO rate"] as string | undefined
			const pidDenomValue = data.commonSettings["Denominations"]?.["pidDenom"]?.value
			const mcu = data.build?.Config?.MCU

			if (!gyroRateStr || !pidDenomValue || !mcu) return false

			const gyroRate = parseFloat(gyroRateStr)
			const pidDenom = parseFloat(pidDenomValue)

			if (isNaN(gyroRate) || isNaN(pidDenom) || pidDenom === 0) return false

			const pidRate = Math.round(gyroRate / pidDenom)
			const isMatch = pidRate >= 8000 && lowerEndMcus.some((mcuType) => mcu.includes(mcuType))

			return isMatch ? { result: true, values: { pidRate, mcu } } : false
		}
	},

	{
		id: "high-dshot-rate",
		title: "High DShot Rate",
		description: (data, values) => {
			if (!values) {
				return "When using a G4, F4, or F722 MCU, it can struggle with a DShot rate of 600. Consider using a DShot 300 to avoid instability."
			}
			return `Current DShot rate: <strong>${values.dshotRate}</strong>, Detected MCU: <strong>${values.mcu}</strong>.<br>
			G4, F4, and F722 MCUs can struggle with DShot 600. Consider using DShot 300 to avoid instability. It's better to use a lower DShot rate with bidirectional DShot enabled than a higher one without.`
		},
		severity: "warning",
		check: (data) => {
			const escProtocol = data.commonSettings["DShot Config"]?.["escProtocol"]?.value // DSHOT600
			const dshotRate = escProtocol?.includes("DSHOT")
				? parseInt(escProtocol.split("DSHOT")[1])
				: null
			// null if not DSHOT, otherwise number
			const mcu = data.build?.Config?.MCU

			if (!dshotRate || !mcu) return false

			const isMatch = dshotRate > 300 && lowerEndMcus.some((mcuType) => mcu.includes(mcuType))

			return isMatch ? { result: true, values: { dshotRate, mcu } } : false
		}
	},

	{
		id: "high-cpu-load",
		title: "High CPU Load",
		description:
			"The CPU load is higher than 50%. In flight this value will be higher, and may cause issues in flight and even crashes.",
		severity: "warning",
		check: (data) => {
			const cpuLoad = data.status?.["CPU Load"] as string | undefined
			if (!cpuLoad) return false
			const cpuLoadValue = parseFloat(cpuLoad)
			return cpuLoadValue > 50
		}
	},

	{
		id: "dshot-without-bidir",
		title: "DShot Without Bidirectional DShot",
		description:
			"Using DShot protocol without bidirectional enabled. Consider enabling bidirectional DShot for better performance.",
		severity: "info",
		check: (data) => {
			const escProtocol = data.commonSettings["DShot Config"]?.["escProtocol"]?.value
			const dshotBidir = data.commonSettings["DShot Config"]?.["dshotBidir"]?.value

			if (!escProtocol) return false

			const isDshot = escProtocol.toLowerCase().includes("dshot")
			const isBidirEnabled = dshotBidir === "ON"

			return isDshot && !isBidirEnabled
		}
	},

	{
		id: "arming-disabled",
		title: "Unexpected Arming Prevention Flags Present",
		description:
			"Detected unexpected arming prevention flags. The flight controller may not arm. MSP and CLI are expected, and should go away after disconnecting from the Configurator.",
		severity: "error",
		check: (data) => {
			const flags = data.armingDisableFlags
			if (flags.length === 0) return false
			const relevantFlags = flags.filter(
				(flag) => flag !== "NONE" && flag !== "CLI" && flag !== "MSP"
			)
			return relevantFlags.length > 0
		}
	},

	{
		id: "rx-protocol-not-matching",
		title: "Configured receiver protocol does not match",
		description: (data, values) => {
			if (!values) {
				return "The configured receiver protocol does not match the protocol built into the firmware."
			}

			return `Configured receiver protocol: <strong>${values.cliRxProtocol}</strong>, protocol(s) defined in firmware: <strong>${values.builtInRxProtocols.length > 0 ? values.builtInRxProtocols.join(", ") : "None"}</strong>.<br> 
			You will not be able to get communication from the receiver until firmware is re-flashed with the correct protocol (<strong>${values.requiredDefines.join(" or ")}</strong>).`
		},
		severity: "error",
		check: (data) => {
			const cliRxProtocol = data.commonSettings["Receiver Settings"]?.["rxProtocol"]?.value
			const buildOptions = data.build?.Request?.Options

			// Skip check if we don't have the necessary data
			if (!cliRxProtocol || !buildOptions || cliRxProtocol === "NONE") {
				return false
			}

			// Find which protocol defines match the CLI protocol
			const matchingProtocols = rxProtocolMap.filter((mapping) =>
				mapping.cli.includes(cliRxProtocol)
			)

			// If no mapping found for CLI protocol, we can't validate
			if (matchingProtocols.length === 0) {
				return false
			}

			// Check if any of the matching protocol defines are present in build options
			const hasMatchingDefine = matchingProtocols.some((mapping) =>
				buildOptions.includes(mapping.define)
			)

			// Return true if protocol is configured but not built into firmware
			const isMatch = !hasMatchingDefine

			if (isMatch) {
				const requiredDefines = matchingProtocols.map((m) => m.define)
				const builtInRxProtocols = buildOptions
					.filter((option) => option.startsWith("USE_SERIALRX_") && option !== "USE_SERIALRX")
					.map((option) => {
						const mapping = rxProtocolMap.find((m) => m.define === option)
						return mapping ? mapping.cli.join("/") : option.replace("USE_SERIALRX_", "")
					})

				return {
					result: true,
					values: { cliRxProtocol, builtInRxProtocols, requiredDefines }
				}
			}

			return false
		}
	},

	{
		id: "analog-osd-incompatibility",
		title: "Potential analog OSD incompatibility",
		description: `The firmware build includes both <strong>OSD_SD</strong> and <strong>OSD_HD</strong> options. When <strong>OSD_HD</strong> is defined, the settings 
			are automatically set up for digital OSD. Either flash the firmware with only <strong>OSD_SD</strong> enabled, or manually set up the OSD settings in the CLI:<br><br>
			<pre>
set osd_displayport_device = MAX7456
save
			</pre>
			You may also need to set the video system to PAL or NTSC - the command shows PAL, but you can use NTSC if you prefer:<br><br>
			<pre>
set vcd_video_system = PAL
save
			</pre>
			`,
		severity: "warning",
		check: (data) => {
			const buildOptions = data.build?.Request?.Options
			if (!buildOptions) return false
			return buildOptions.includes("OSD_SD") && buildOptions.includes("OSD_HD")
		}
	}

	// {
	// 	id: "rx-protocol-not-set",
	// 	title: "Receiver Protocol Not Configured",
	// 	description: "Receiver protocol is not properly configured.",
	// 	severity: "error",
	// 	check: (data) => {
	// 		const rxProtocol = data.commonSettings["Receiver Settings"]?.["rxProtocol"]?.value
	// 		return !rxProtocol || rxProtocol === "NONE" || rxProtocol === "0"
	// 	}
	// }
]
