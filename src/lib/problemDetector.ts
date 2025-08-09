import type { Problem, ProblemCheckData } from "./problems/types"
import { problemDefinitions } from "./problems/definitions"
import sanitizeHtml from "sanitize-html"

export type { Problem, ProblemCheckData, ProblemDefinition } from "./problems/types"

export function detectProblems(data: ProblemCheckData): Problem[] {
	const detectedProblems: Problem[] = []

	for (const problemDef of problemDefinitions) {
		try {
			const checkResult = problemDef.check(data)
			const isMatch = typeof checkResult === "boolean" ? checkResult : checkResult.result
			const values = typeof checkResult === "object" ? checkResult.values : undefined

			if (isMatch) {
				const description =
					typeof problemDef.description === "function"
						? problemDef.description(data, values)
						: problemDef.description

				detectedProblems.push({
					id: problemDef.id,
					title: problemDef.title,
					description: sanitizeHtml(description),
					severity: problemDef.severity
				})
			}
		} catch (error) {
			console.error(`Error checking problem ${problemDef.id}:`, error)
		}
	}

	return detectedProblems
}
