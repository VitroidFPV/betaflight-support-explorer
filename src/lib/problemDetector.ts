import type { Problem, ProblemCheckData } from './problems/types'
import { problemDefinitions } from './problems/definitions'

export type { Problem, ProblemCheckData, ProblemDefinition } from './problems/types'

export function detectProblems(data: ProblemCheckData): Problem[] {
	const detectedProblems: Problem[] = []
	
	for (const problemDef of problemDefinitions) {
		try {
			if (problemDef.check(data)) {
				detectedProblems.push({
					id: problemDef.id,
					title: problemDef.title,
					description: problemDef.description,
					severity: problemDef.severity
				})
			}
		} catch (error) {
			console.error(`Error checking problem ${problemDef.id}:`, error)
		}
	}
	
	return detectedProblems
}
