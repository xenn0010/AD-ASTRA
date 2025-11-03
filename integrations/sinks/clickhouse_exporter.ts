type Event = {
	id: string;
	type: "impression" | "click" | "convert";
	campaignId: string;
	variantId: string;
	segment: "human" | "agent";
	assignmentId: string;
	ts: number;
	value?: number;
};

async function fetchEventsBatch(sinceMs: number): Promise<Event[]> {
	// TODO: fetch from Convex query
	return [];
}

async function insertIntoClickHouse(events: Event[]): Promise<void> {
	const chUrl = process.env.CLICKHOUSE_HTTP_URL || "http://localhost:8123";
	const rows = events
		.map(
			e => `('${e.id}','${e.type}','${e.campaignId}','${e.variantId}','${e.segment}','${e.assignmentId}',${e.ts},${e.value ?? 0})`,
		)
		.join(",");
	const sql = `INSERT INTO ad_astra.events (id,type,campaign_id,variant_id,segment,assignment_id,ts,value) VALUES ${rows}`;
	await fetch(chUrl, { method: "POST", body: sql });
}

export async function runExporter(): Promise<void> {
	const sinceMs = Date.now() - 5 * 60 * 1000;
	const events = await fetchEventsBatch(sinceMs);
	if (events.length > 0) {
		await insertIntoClickHouse(events);
	}
}


