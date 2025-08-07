/**
 * Extracts a support ID (UUID format) from a given string.
 * @param text - The string to extract the support ID from
 * @returns The extracted support ID or null if no valid support ID is found
 */
export function extractSupportId(text: string): string | null {
	// Regular expression to match UUID format
	const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
	const match = text.match(uuidRegex)
	return match ? match[0] : null
}
