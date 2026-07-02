function normalizeForSearch(text: string): string {
	return text.toLowerCase().replace(/[^a-z0-9]/g, "")
}

export function matchesTargetSearch(query: string, ...haystacks: string[]): boolean {
	const terms = query
		.trim()
		.toLowerCase()
		.split(/\s+/)
		.map(normalizeForSearch)
		.filter(Boolean)

	if (terms.length === 0) {
		return true
	}

	const normalizedHaystacks = haystacks.map(normalizeForSearch)

	return terms.every((term) => normalizedHaystacks.some((haystack) => haystack.includes(term)))
}
