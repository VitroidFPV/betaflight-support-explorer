import type { CustomThemeConfig } from "@skeletonlabs/tw-plugin";

export const yellowTheme: CustomThemeConfig = {
	name: "yellow-theme",
	properties: {
		// =~= Theme Properties =~=
		"--theme-font-family-base": `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace`,
		"--theme-font-family-heading": `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'`,
		"--theme-font-color-base": "0 0 0",
		"--theme-font-color-dark": "255 255 255",
		"--theme-rounded-base": "9999px",
		"--theme-rounded-container": "16px",
		"--theme-border-base": "3px",
		// =~= Theme On-X Colors =~=
		"--on-primary": "0 0 0",
		"--on-secondary": "255 255 255",
		"--on-tertiary": "255 255 255",
		"--on-success": "0 0 0",
		"--on-warning": "0 0 0",
		"--on-error": "255 255 255",
		"--on-surface": "255 255 255",
		// =~= Theme Colors  =~=
		// primary | #ffbb00
		"--color-primary-50": "255 245 217", // #fff5d9
		"--color-primary-100": "255 241 204", // #fff1cc
		"--color-primary-200": "255 238 191", // #ffeebf
		"--color-primary-300": "255 228 153", // #ffe499
		"--color-primary-400": "255 207 77", // #ffcf4d
		"--color-primary-500": "255 187 0", // #ffbb00
		"--color-primary-600": "230 168 0", // #e6a800
		"--color-primary-700": "191 140 0", // #bf8c00
		"--color-primary-800": "153 112 0", // #997000
		"--color-primary-900": "125 92 0", // #7d5c00
		// secondary | #292929
		"--color-secondary-50": "223 223 223", // #dfdfdf
		"--color-secondary-100": "212 212 212", // #d4d4d4
		"--color-secondary-200": "202 202 202", // #cacaca
		"--color-secondary-300": "169 169 169", // #a9a9a9
		"--color-secondary-400": "105 105 105", // #696969
		"--color-secondary-500": "41 41 41", // #292929
		"--color-secondary-600": "37 37 37", // #252525
		"--color-secondary-700": "31 31 31", // #1f1f1f
		"--color-secondary-800": "25 25 25", // #191919
		"--color-secondary-900": "20 20 20", // #141414
		// tertiary | #2e2e2e
		"--color-tertiary-50": "224 224 224", // #e0e0e0
		"--color-tertiary-100": "213 213 213", // #d5d5d5
		"--color-tertiary-200": "203 203 203", // #cbcbcb
		"--color-tertiary-300": "171 171 171", // #ababab
		"--color-tertiary-400": "109 109 109", // #6d6d6d
		"--color-tertiary-500": "46 46 46", // #2e2e2e
		"--color-tertiary-600": "41 41 41", // #292929
		"--color-tertiary-700": "35 35 35", // #232323
		"--color-tertiary-800": "28 28 28", // #1c1c1c
		"--color-tertiary-900": "23 23 23", // #171717
		// success | #84cc16
		"--color-success-50": "237 247 220", // #edf7dc
		"--color-success-100": "230 245 208", // #e6f5d0
		"--color-success-200": "224 242 197", // #e0f2c5
		"--color-success-300": "206 235 162", // #ceeba2
		"--color-success-400": "169 219 92", // #a9db5c
		"--color-success-500": "132 204 22", // #84cc16
		"--color-success-600": "119 184 20", // #77b814
		"--color-success-700": "99 153 17", // #639911
		"--color-success-800": "79 122 13", // #4f7a0d
		"--color-success-900": "65 100 11", // #41640b
		// warning | #ff851a
		"--color-warning-50": "255 237 221", // #ffeddd
		"--color-warning-100": "255 231 209", // #ffe7d1
		"--color-warning-200": "255 225 198", // #ffe1c6
		"--color-warning-300": "255 206 163", // #ffcea3
		"--color-warning-400": "255 170 95", // #ffaa5f
		"--color-warning-500": "255 133 26", // #ff851a
		"--color-warning-600": "230 120 23", // #e67817
		"--color-warning-700": "191 100 20", // #bf6414
		"--color-warning-800": "153 80 16", // #995010
		"--color-warning-900": "125 65 13", // #7d410d
		// error | #d21956
		"--color-error-50": "248 221 230", // #f8dde6
		"--color-error-100": "246 209 221", // #f6d1dd
		"--color-error-200": "244 198 213", // #f4c6d5
		"--color-error-300": "237 163 187", // #eda3bb
		"--color-error-400": "224 94 137", // #e05e89
		"--color-error-500": "210 25 86", // #d21956
		"--color-error-600": "189 23 77", // #bd174d
		"--color-error-700": "158 19 65", // #9e1341
		"--color-error-800": "126 15 52", // #7e0f34
		"--color-error-900": "103 12 42", // #670c2a
		// surface | #1f1f1f
		"--color-surface-50": "221 221 221", // #dddddd
		"--color-surface-100": "210 210 210", // #d2d2d2
		"--color-surface-200": "199 199 199", // #c7c7c7
		"--color-surface-300": "165 165 165", // #a5a5a5
		"--color-surface-400": "98 98 98", // #626262
		"--color-surface-500": "31 31 31", // #1f1f1f
		"--color-surface-600": "28 28 28", // #1c1c1c
		"--color-surface-700": "23 23 23", // #171717
		"--color-surface-800": "19 19 19", // #131313
		"--color-surface-900": "15 15 15" // #0f0f0f
	}
};
