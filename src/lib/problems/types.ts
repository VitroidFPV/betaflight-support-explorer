interface StatusObject {
	[key: string]: string | number | boolean | null
}

interface CommonSettings {
	[section: string]: {
		[setting: string]: {
			name: string
			value: string | null
		}
	}
}

interface BuildConfig {
	manufacturer: string
	target: string
	mcu: string
}

interface BuildRequest {
	release: string
	tag: string
	options: string[]
}

interface Build {
	status: string
	identifier: string
	submitted: string
	elapsed: number
	config: BuildConfig
	request: BuildRequest
}

interface SerialPort {
	identifier: string
	function: string[]
	msp: number
	gps: number
	telemetry: number
	blackbox: number
}

export interface ProblemCheckData {
	status: StatusObject | null
	commonSettings: CommonSettings
	armingDisableFlags: string[]
	modes: { mode: string; channel: number; low: number; high: number }[] | null
	problem: string | null
	build?: Build | null
	dma?: { [key: string]: { [key: string]: string } } | null
	timer?: { [key: string]: { [key: string]: string } | string } | null
	serial?: SerialPort[] | null
	dump?: string | null
}

export interface Problem {
	id: string
	title: string
	description: string
	severity: "warning" | "error" | "info"
}

export interface ProblemDefinition {
	id: string
	title: string
	description: string | ((data: ProblemCheckData, values?: any) => string)
	severity: "warning" | "error" | "info"
	check: (data: ProblemCheckData) => boolean | { result: boolean; values?: any }
}
