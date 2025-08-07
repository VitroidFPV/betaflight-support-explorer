import type { ProblemDefinition } from "./types"

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
