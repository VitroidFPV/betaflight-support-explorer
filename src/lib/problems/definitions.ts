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
		title: "Low PID loop rate",
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
		title: "High PID loop rate",
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
		title: "High DShot rate",
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
		title: "High CPU load",
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
		title: "DShot without bidirectional DShot",
		description:
			"Using DShot protocol without bidirectional enabled. Consider enabling bidirectional DShot for better performance - only if your ESC supports it!",
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
		title: "Unexpected arming prevention flags present",
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
</pre><br>
			You may also need to set the video system to PAL or NTSC - the command shows PAL, but you can use NTSC if you prefer:<br><br>
			<pre>
set vcd_video_system = PAL
save
</pre><br>
If your analog OSD is working fine, you don't need to do anything.
			`,
		severity: "warning",
		check: (data) => {
			const buildOptions = data.build?.Request?.Options
			if (!buildOptions) return false
			return buildOptions.includes("USE_OSD_SD") && buildOptions.includes("USE_OSD_HD")
		}
	},

	{
		id: "noncompliant-smartaudio-4-5-2",
		title: "Noncompliant SmartAudio on Betaflight 4.5.2",
		description: `Betaflight 4.5.2 included a bugfix for SmartAudio issues, but it also caused a regression where non-compliant SmartAudio devices 
				may not work correctly. The issue isn't present in previous versions, and has been fixed in future versions.<br>
				It can be fixed by using those other versions, or flashing with the <strong>NONCOMPLIANT_SMARTAUDIO</strong> custom define added. If your VTX works fine, you don't need to do anything.`,
		severity: "warning",
		check: (data) => {
			const buildOptions = data.build?.Request
			if (!buildOptions) return false
			const isBetaflight452 = data.build?.Request?.Release?.startsWith("4.5.2") ?? false
			const includesNoncompliantSmartAudio = data.build?.Request.Options.includes(
				"USE_NONCOMPLIANT_SMARTAUDIO"
			)
			const isSmartAudioSet =
				data.serial?.some((port) => port.function.includes("VTX SmartAudio")) ?? false
			if (includesNoncompliantSmartAudio) return false
			return isSmartAudioSet && isBetaflight452
		}
	},

	{
		id: "elrs-arm-aux-1",
		title: "ARM mode not on Aux 1 (CH5) - ELRS",
		description: (data, values) => {
			if (!values) {
				return `ELRS requires the ARM mode to be on Aux 1 (CH5). Many ELRS settings depend on the value of the ARM mode, it's important 
				that the flight controller setup matches what ELRS is expecting.`
			}
			return `The current ARM mode is on <strong>Aux ${values.armMode?.channel + 1} (CH${values.armMode?.channel + 5})</strong>.<br>
			ELRS requires the ARM mode to be on <strong>Aux 1 (CH5)</strong>. Many ELRS settings depend on the value of the ARM mode, it's important 
			that the flight controller setup matches what ELRS is expecting.<br>
			If you're not using ELRS, you can ignore this warning.`
		},
		severity: "warning",
		check: (data) => {
			const modes = data.modes
			const armMode = modes?.find((mode) => mode.mode === "ARM")
			if (!armMode) return false
			const isAux1 = armMode?.channel === 0
			return { result: !isAux1, values: { armMode } }
		}
	},

	{
		id: "elrs-arm-range",
		title: "ARM mode range set incorrectly - ELRS",
		description: (data, values) => {
			if (!values) {
				return `ELRS requires the range to be active around the 2000 value. Many ELRS settings depend on the value of the ARM mode, it's important 
				that the flight controller setup matches what ELRS is expecting.<br>If you're not using ELRS, you can ignore this warning.`
			}
			return `The current range is <strong>${values.armMode?.low} - ${values.armMode?.high}</strong>.<br>
			ELRS requires the range to be active around the 2000 value. Many ELRS settings depend on the value of the ARM mode, it's important 
			that the flight controller setup matches what ELRS is expecting.<br>
			If you're not using ELRS, you can ignore this warning.`
		},
		severity: "warning",
		check: (data) => {
			const modes = data.modes
			const armMode = modes?.find((mode) => mode.mode === "ARM")
			if (!armMode) return false
			const isRangeGood = armMode?.low > 1200 && armMode?.high > 2000
			return { result: !isRangeGood, values: { armMode } }
		}
	},

	{
		id: "wide-arm-range",
		title: "Arming range set too wide",
		description: (data, values) => {
			if (!values) {
				return "The arming range is set too wide. This will most likely result in the flight controller being constantly armed, locked with pre-flight checks and unable to actually arm."
			}
			return `The current range is <strong>${values.armMode?.low} - ${values.armMode?.high}</strong>.<br>
			The arming range is set too wide. This will most likely result in the flight controller being constantly armed, locked with pre-flight checks and unable to actually arm.`
		},
		severity: "error",
		check: (data) => {
			const modes = data.modes
			const armMode = modes?.find((mode) => mode.mode === "ARM")
			if (!armMode) return false
			const overallRange = armMode?.high - armMode?.low
			return { result: overallRange > 800, values: { armMode } }
		}
	},

	{
		id: "no-arm-mode",
		title: "No ARM mode set",
		description:
			"No ARM mode is set. You will not be able to arm the flight controller until one is set.",
		severity: "error",
		check: (data) => {
			const modes = data.modes
			const armMode = modes?.find((mode) => mode.mode === "ARM")
			return { result: !armMode, values: { armMode } }
		}
	},

	{
		id: "multiple-serialrx-ports",
		title: "Multiple ports set for Serial RX",
		description: (data, values) => {
			if (!values) {
				return "Multiple ports are set for Serial RX. It's not possible to set up redundant receivers this way. It will most likely result in incorrect communication with the receiver, or no communication at all."
			}
			return `Currently enabled on ports: <strong>${values.portsWithRx.map((port: { identifier: any }) => port.identifier).join(", ")}</strong>.<br>
			Multiple ports are set for Serial RX. It's not possible to set up redundant receivers this way. It will most likely result in incorrect communication with the receiver, or no communication at all.`
		},
		severity: "error",
		check: (data) => {
			if (!data.serial) return false
			const ports = data.serial
			const portsWithRx = ports.filter((port) => port.function.includes("RX Serial"))
			return { result: portsWithRx.length > 1, values: { portsWithRx } }
		}
	},

	{
		id: "small-arm-angle",
		title: "Maximum ARM angle set too low",
		description: (data, values) => {
			if (!values) {
				return `The maximum ARM angle value is set too low. The default is 25, but it's best to set it to 180 degrees so that you can arm even when stuck upside down.<br>
				You can set the maximum ARM angle in the CLI:<br><br>
				<pre>
set small_angle = 180
save
</pre>
				`
			}
			return `The current maximum ARM angle is <strong>${values.smallAngle}</strong>.<br>
			The maximum ARM angle value is set too low. The default is 25, but it's best to set it to 180 degrees so that you can arm even when stuck upside down.<br>
			You can set the maximum ARM angle in the CLI:<br><br>
			<pre>
set small_angle = 180
save
</pre>
			`
		},
		severity: "warning",
		check: (data) => {
			const smallAngle = data.commonSettings["Misc Config"]?.["smallAngle"]?.value
			if (!smallAngle) return false
			return { result: Number(smallAngle) < 180, values: { smallAngle } }
		}
	},

	{
		id: "uncommon-channel-mapping",
		title: "Uncommon channel mapping",
		description: (data, values) => {
			if (!values) {
				return "The channel mapping setting isn't set to commonly used mappings (AETR1234 or TAER1234). The order of the 4 main control channels may be incorrect."
			}
			return `The current channel mapping is <strong>${values.channelMapping}</strong>.<br>
			The channel mapping setting isn't set to commonly used mappings (AETR1234 or TAER1234). The order of the 4 main control channels may be incorrect.`
		},
		severity: "warning",
		check: (data) => {
			const channelMapping = data.commonSettings["Misc Config"]?.["channelMapping"]?.value
			if (!channelMapping) return false
			const commonMappings = ["AETR1234", "TAER1234"]
			return { result: !commonMappings.includes(channelMapping), values: { channelMapping } }
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
