export type CBRelease = {
	release: string
	type: string
	date: string
	label: string
	cloudBuild: boolean
	unifiedConfig: boolean
	withdrawn: boolean
}

export type CBTarget = {
	releases: CBRelease[]
	target: string
	manufacturer: string
}

export type CBManufacturer = {
	id: string
	name: string
	contact: string
}
