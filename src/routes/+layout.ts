import posthog from "posthog-js"
import { browser } from "$app/environment"

export const load = async () => {
	if (browser) {
		posthog.init("phc_5lkemDqQpGZFBXuwM0LkZF8zIEKiphDQbnxA95VWtrC", {
			api_host: "https://us.i.posthog.com",
			defaults: "2025-05-24",
			person_profiles: "identified_only" // or 'always' to create profiles for anonymous users as well
		})
	}

	return
}
