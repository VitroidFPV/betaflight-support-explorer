import type { ProblemDefinition } from "./types"

// Global constants
const lowerEndMcus = ["F411", "F405", "F435", "F722", "G473"]

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
			return `Current PID loop rate: ${values.pidRate}Hz (MCU: ${values.mcu}). G4, F4, and F722 MCUs can struggle with an 8kHz PID loop rate. Consider using a lower rate to avoid instability.`
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
			return `Current DShot rate: ${values.dshotRate} (MCU: ${values.mcu}). G4, F4, and F722 MCUs can struggle with DShot 600. Consider using DShot 300 to avoid instability. It's better to use a lower DShot rate with bidirectional DShot enabled than a higher one without.`
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

			const isMatch = dshotRate >= 300 && lowerEndMcus.some((mcuType) => mcu.includes(mcuType))

			return isMatch ? { result: true, values: { dshotRate, mcu } } : false
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
