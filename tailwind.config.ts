import { join } from "path";
import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";
import { skeleton } from "@skeletonlabs/tw-plugin";
import { yellowTheme } from "./yellowTheme";

export default {
	darkMode: "class",
	content: [
		"./src/**/*.{html,js,svelte,ts}",
		join(require.resolve("@skeletonlabs/skeleton"), "../**/*.{html,js,svelte,ts}")
	],
	theme: {
		extend: {
			backgroundSize: {
				"0w": "0% 100%",
				"100w": "100% 100%"
			},
		}
	},
	plugins: [
		forms,
		typography,
		skeleton({
			themes: {
				custom: [yellowTheme]
				// preset: [
				// 	{
				// 		name: 'skeleton',
				// 		enhancements: true,
				// 	},
				// ],
			}
		})
	]
} satisfies Config;
