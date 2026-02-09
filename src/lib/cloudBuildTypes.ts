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
	manufacturer: string // Manufacturer name as listed in Manufacturers.md
	manufacturerId: string // Manufacturer ID as listed in the target's config.h file
	mcu: string
	group: string
}

export type CBManufacturer = {
	id: string
	name: string
	url: string | null
}
