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

export interface ProblemCheckData {
	status: StatusObject | null
	commonSettings: CommonSettings | null
	armingDisableFlags: string[]
	modes: { mode: string; channel: number; low: number; high: number }[] | null
	problem: string | null
}

export interface Problem {
	id: string
	title: string
	description: string
	severity: 'warning' | 'error' | 'info'
}

export interface ProblemDefinition {
	id: string
	title: string
	description: string
	severity: 'warning' | 'error' | 'info'
	check: (data: ProblemCheckData) => boolean
}