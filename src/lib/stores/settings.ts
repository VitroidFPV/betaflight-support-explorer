import { persisted } from "svelte-persisted-store"

type IdPreviewCardSetting = {
	title: string
	name: string
	value: boolean
}

const idPreviewCardSettings: IdPreviewCardSetting[] = [
	{
		title: "Created At",
		name: "createdAt",
		value: true
	},
	{
		title: "Manufacturer",
		name: "manufacturer",
		value: true
	},
	{
		title: "Target",
		name: "target",
		value: true
	},
	{
		title: "Version",
		name: "version",
		value: true
	},
	{
		title: "Problem Description",
		name: "problemDescription",
		value: true
	},
	{
		title: "Options",
		name: "options",
		value: true
	},
	{
		title: "Arming Disable Flags",
		name: "armDisableFlags",
		value: true
	},
	{
		title: "Local Build Warning",
		name: "isLocal",
		value: true
	}
]

const showDataAnalysis = {
	showDataAnalysis: true
}

const hiddenProblems: string[] = []

const showHideWarning = true

const showFullText = false

const allSettings = {
	version: 2,
	idPreviewCardSettings: idPreviewCardSettings,
	showDataAnalysis: showDataAnalysis,
	hiddenProblems: hiddenProblems,
	showHideWarning: showHideWarning,
	showFullText: showFullText
}

export const settings = persisted("settings", allSettings)
settings.update((s) => {
	if (!s.version || s.version < 2) {
		s.idPreviewCardSettings.push({
			title: "Local Build Warning",
			name: "isLocal",
			value: true
		})
		s.version = 2
	}
	return s
})
