import { persisted } from "svelte-persisted-store";

type IdPreviewCardSetting = {
	title: string;
	name: string;
	value: boolean;
}

const idPreviewCardSettings: IdPreviewCardSetting[] = [
	{
		"title": "Created At",
		"name": "createdAt",
		"value": true,
	},
	{
		"title": "Manufacturer",
		"name": "manufacturer",
		"value": true,
	},
	{
		"title": "Target",
		"name": "target",
		"value": true,
	},
	{
		"title": "Version",
		"name": "version",
		"value": true,
	},
	{
		"title": "Problem Description",
		"name": "problemDescription",
		"value": true,
	},
	{
		"title": "Options",
		"name": "options",
		"value": true,
	},
	{
		"title": "Arming Disable Flags",
		"name": "armDisableFlags",
		"value": true,
	}
]

const allSettings = {
	idPreviewCardSettings: idPreviewCardSettings,
}

export const settings = persisted("settings", allSettings);
