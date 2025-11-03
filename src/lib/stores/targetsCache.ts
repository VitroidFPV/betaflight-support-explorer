import { persisted } from "svelte-persisted-store"

export type Manufacturer = {
	id: string
	name: string
	url: string
}

export type Target = {
	target: string
	manufacturer: string
	mcu: string
}

export type CachedData = {
	targets: Target[]
	manufacturers: Manufacturer[]
	lastFetched: number
	cacheVersion: string
}

// Cache for 1 hour (3600000 ms)
export const CACHE_DURATION = 3600000
export const CACHE_VERSION = "1.0.0"

const defaultCacheData: CachedData = {
	targets: [],
	manufacturers: [],
	lastFetched: 0,
	cacheVersion: CACHE_VERSION
}

export const targetsCache = persisted<CachedData>("targetsCache", defaultCacheData)

export function isCacheValid(cachedData: CachedData): boolean {
	const now = Date.now()
	const isWithinTimeLimit = now - cachedData.lastFetched < CACHE_DURATION
	const isCorrectVersion = cachedData.cacheVersion === CACHE_VERSION
	const hasData = cachedData.targets.length > 0

	return isWithinTimeLimit && isCorrectVersion && hasData
}

export function updateCache(targets: Target[], manufacturers: Manufacturer[]): void {
	targetsCache.set({
		targets,
		manufacturers,
		lastFetched: Date.now(),
		cacheVersion: CACHE_VERSION
	})
}

export function clearCache(): void {
	targetsCache.set(defaultCacheData)
}
