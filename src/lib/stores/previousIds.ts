import { persisted } from "svelte-persisted-store";

type PreviousId = {
	id: string;
	createdAt: number;
	manufacturer: string;
	target: string;
	version: string;
	problemDescription: string;
	options: string[];
	armDisableFlags: string[];
}

export const previousIds = persisted<PreviousId[]>("previousIds", []);
