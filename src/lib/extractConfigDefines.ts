/** One object-like `#define` from a `config.h`-style source. */
export type ConfigDefineEntry = {
	name: string
	/** Present when the macro has a replacement list (non-boolean-style). */
	value?: string
}

export function extractConfigDefines(source: string): ConfigDefineEntry[] {
	const out: ConfigDefineEntry[] = []

	for (const line of source.split(/\r?\n/)) {
		const trimmed = line.trim()
		if (trimmed.startsWith("*") || trimmed.startsWith("*/")) continue

		const m = line.match(/^\s*(?:(?:\/\/)\s*)?#define\s+([A-Za-z_]\w*)(?:\s+(.*))?$/u)
		if (!m) continue

		let valuePart = (m[2] ?? "").trim()
		valuePart = valuePart.replace(/\s+\/\/.*$/, "").trim()
		valuePart = valuePart.replace(/\s*\/\*[\s\S]*?\*\/\s*$/, "").trim()

		const entry: ConfigDefineEntry = { name: m[1] }
		if (valuePart.length > 0) {
			entry.value = valuePart
		}
		out.push(entry)
	}

	return out
}

export function extractDefineValue(name: string, defines: ConfigDefineEntry[]): string | null {
	const define = defines.find((define) => define.name === name)
	return define?.value ?? null
}

function extractPrefixedDefineValue(name: string, prefixes: string[]): string | null {
	const matchingPrefix = [...prefixes]
		.sort((a, b) => b.length - a.length)
		.find((prefix) => name.startsWith(prefix))

	if (!matchingPrefix) {
		return null
	}

	const prefixedValue = name.slice(matchingPrefix.length).trim()
	if (prefixedValue.length === 0) {
		return null
	}

	return prefixedValue
}

export function extractImus(defines: ConfigDefineEntry[]): string[] {
	const prefixes = ["USE_ACCGYRO_", "USE_ACC_SPI_", "USE_GYRO_SPI_"]
	const seen = new Set<string>()
	const imus: string[] = []

	for (const define of defines) {
		const imuName = extractPrefixedDefineValue(define.name, prefixes)
		if (!imuName || seen.has(imuName)) continue

		seen.add(imuName)
		imus.push(imuName)
	}

	return imus
}

export function extractBarometers(defines: ConfigDefineEntry[]): string[] {
	const prefixes = ["USE_BARO_", "USE_BARO_SPI_"]
	const seen = new Set<string>()
	const barometers: string[] = []

	for (const define of defines) {
		const barometerName = extractPrefixedDefineValue(define.name, prefixes)
		if (!barometerName || seen.has(barometerName)) continue

		seen.add(barometerName)
		barometers.push(barometerName)
	}

	return barometers
}

export function extractMagnetometers(defines: ConfigDefineEntry[]): string[] {
	const prefixes = ["USE_MAG_", "USE_MAG_SPI_"]
	const seen = new Set<string>()
	const magnetometers: string[] = []
	for (const define of defines) {
		const magnetometerName = extractPrefixedDefineValue(define.name, prefixes)
		if (!magnetometerName || seen.has(magnetometerName)) continue

		seen.add(magnetometerName)
		magnetometers.push(magnetometerName)
	}

	return magnetometers
}
