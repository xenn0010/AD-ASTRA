export type Copy = {
	headline?: string;
	subhead?: string;
	bullets?: string[];
	cta?: { label: string; url: string };
};

export type Issue = { field: string; message: string; severity: "error" | "warn" };

const BANNED = ["guarantee", "cure", "free forever"];

export function validateCopy(copy: Copy): Issue[] {
	const issues: Issue[] = [];
	if (!copy.headline || copy.headline.trim().length < 4) {
		issues.push({ field: "headline", message: "headline too short", severity: "error" });
	}
	if (copy.subhead && copy.subhead.length > 160) {
		issues.push({ field: "subhead", message: "subhead too long", severity: "warn" });
	}
	const text = `${copy.headline ?? ""} ${copy.subhead ?? ""} ${(copy.bullets ?? []).join(" ")}`.toLowerCase();
	for (const term of BANNED) {
		if (text.includes(term)) {
			issues.push({ field: "text", message: `contains banned term: ${term}` , severity: "error"});
		}
	}
	if (copy.cta && !/^https?:\/\//.test(copy.cta.url)) {
		issues.push({ field: "cta.url", message: "cta url must be http(s)", severity: "error" });
	}
	return issues;
}

export function validateAgentPayload(agent: unknown): Issue[] {
	const issues: Issue[] = [];
	if (!agent || typeof agent !== "object") {
		issues.push({ field: "agent", message: "missing agent payload", severity: "error" });
		return issues;
	}
	// Minimal structural check for JSON-LD
	const jl: any = (agent as any).jsonld;
	if (jl && jl["@context"] !== "https://schema.org") {
		issues.push({ field: "agent.jsonld.@context", message: "jsonld context should be schema.org", severity: "warn" });
	}
	return issues;
}


