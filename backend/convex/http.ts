import { httpRouter } from "convex/server";
import { httpActionGeneric } from "convex/server";

const httpAction = httpActionGeneric;

type Segment = "human" | "agent";

async function sha256Hex(input: string): Promise<string> {
	const data = new TextEncoder().encode(input);
	const digest = await crypto.subtle.digest("SHA-256", data);
	return Array.from(new Uint8Array(digest))
		.map(b => b.toString(16).padStart(2, "0"))
		.join("");
}

async function signPayload(payload: string): Promise<string | null> {
	const secret = process.env.ASSIGNMENT_SIGNING_SECRET;
	if (!secret) return null;
	return sha256Hex(`${secret}:${payload}`);
}

async function selectVariantFromBandit(args: {
	campaignId: string;
	segment: Segment;
	arms: string[];
	context?: Record<string, unknown>;
}): Promise<{ variantId: string; explore?: boolean }> {
	const url = process.env.BANDIT_SERVICE_URL || "http://localhost:8000";
	const res = await fetch(`${url}/select`, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(args),
	});
	if (!res.ok) throw new Error(`Bandit select failed: ${res.status}`);
	return (await res.json()) as { variantId: string; explore?: boolean };
}

export const POST = httpAction(async (ctx, req) => {
	const url = new URL(req.url);
	// Admin create endpoints (guarded by ADMIN_SECRET)
	if (url.pathname.endsWith("/admin/createCampaign")) {
		const admin = req.headers.get("x-admin-key");
		if (!process.env.ADMIN_SECRET || admin !== process.env.ADMIN_SECRET) {
			return new Response("Unauthorized", { status: 401 });
		}
		const body = (await req.json()) as {
			goal: { type: "conversions" | "revenue"; target: number };
			segments: Segment[];
			name?: string;
			description?: string;
		};
		const id = await ctx.runMutation("mutations:createCampaign", body as any);
		return new Response(JSON.stringify({ id }), {
			status: 200,
			headers: { "content-type": "application/json" },
		});
	}

	if (url.pathname.endsWith("/admin/createVariant")) {
		const admin = req.headers.get("x-admin-key");
		if (!process.env.ADMIN_SECRET || admin !== process.env.ADMIN_SECRET) {
			return new Response("Unauthorized", { status: 401 });
		}
		const body = (await req.json()) as {
			campaignId: string;
			segment: Segment;
			payload: any;
			name?: string;
			active?: boolean;
		};
		const id = await ctx.runMutation("mutations:createVariant", body as any);
		return new Response(JSON.stringify({ id }), {
			status: 200,
			headers: { "content-type": "application/json" },
		});
	}
	if (url.pathname.endsWith("/admin/recalculateMetrics")) {
		const admin = req.headers.get("x-admin-key");
		if (!process.env.ADMIN_SECRET || admin !== process.env.ADMIN_SECRET) {
			return new Response("Unauthorized", { status: 401 });
		}
		const body = (await req.json()) as {
			campaignId: string;
		};
		const result = await ctx.runMutation("mutations:recalculateMetricsForCampaign", body as any);
		return new Response(JSON.stringify(result), {
			status: 200,
			headers: { "content-type": "application/json" },
		});
	}
	if (url.pathname.endsWith("/assign")) {
		const body = (await req.json()) as {
			campaignId: string;
			segment: Segment;
			context?: Record<string, unknown>;
			reqId?: string;
		};
		if (!body?.campaignId || !body?.segment) {
			return new Response("Missing campaignId or segment", { status: 400 });
		}
		const variants = await ctx.runQuery("queries:getActiveVariantsByCampaignSegment", {
			campaignId: body.campaignId,
			segment: body.segment,
		});
		if (variants.length === 0) {
			return new Response("No active variants", { status: 404 });
		}
		const arms = variants.map(v => v._id);
		const { variantId, explore } = await selectVariantFromBandit({
			campaignId: body.campaignId,
			segment: body.segment,
			arms: arms.map(String),
			context: body.context || {},
		});
		const ts = Date.now();
		const assignmentId = await ctx.runMutation("mutations:createAssignment", {
			campaignId: body.campaignId,
			segment: body.segment,
			variantId,
			reqId: body.reqId || crypto.randomUUID(),
			ts,
			meta: { explore: !!explore },
		});
		const payloadToSign = JSON.stringify({ assignmentId, variantId, ts });
		const signature = await signPayload(payloadToSign);
		return new Response(
			JSON.stringify({ assignmentId, variantId, ts, signature }),
			{ status: 200, headers: { "content-type": "application/json" } },
		);
	}

	if (url.pathname.endsWith("/event")) {
		const body = (await req.json()) as {
			type: "impression" | "click" | "convert";
			campaignId: string;
			variantId: string;
			segment: Segment;
			assignmentId: string;
			value?: number;
			ua?: string;
			ipHash?: string;
			geo?: string;
		};
		if (!body?.type || !body?.campaignId || !body?.variantId || !body?.assignmentId) {
			return new Response("Missing required fields", { status: 400 });
		}
		const ts = Date.now();
		await ctx.runMutation("mutations:insertEvent", {
			...body,
			ts,
		});
		// Optionally, forward reward to bandit on conversions
		if (body.type === "convert") {
			const url = process.env.BANDIT_SERVICE_URL || "http://localhost:8000";
			try {
				await fetch(`${url}/reward`, {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({
						campaignId: body.campaignId,
						segment: body.segment,
						variantId: body.variantId,
						reward: body.value ?? 1,
						assignmentId: body.assignmentId,
					}),
				});
			} catch (_) {
				// ignore bandit forwarding errors for MVP
			}
		}
		return new Response(JSON.stringify({ ok: true, ts }), {
			status: 200,
			headers: { "content-type": "application/json" },
		});
	}

	return new Response("Not Found", { status: 404 });
});

export const GET = httpAction(async (ctx, req) => {
	const url = new URL(req.url);
	if (url.pathname.endsWith("/variant")) {
		const id = url.searchParams.get("id");
		if (!id) return new Response("Missing id", { status: 400 });
		try {
			const variant = await ctx.runQuery("queries:getVariantById", { id: id as any });
			if (!variant) return new Response("Not Found", { status: 404 });
			return new Response(JSON.stringify({ id, payload: variant.payload }), {
				status: 200,
				headers: { "content-type": "application/json" },
			});
		} catch (e) {
			return new Response("Bad Request", { status: 400 });
		}
	}
	return new Response("Not Found", { status: 404 });
});

const http = httpRouter();

http.route({
	path: "/assign",
	method: "POST",
	handler: POST,
});

http.route({
	path: "/event",
	method: "POST",
	handler: POST,
});

http.route({
	path: "/admin/createCampaign",
	method: "POST",
	handler: POST,
});

http.route({
	path: "/admin/createVariant",
	method: "POST",
	handler: POST,
});

http.route({
	path: "/admin/recalculateMetrics",
	method: "POST",
	handler: POST,
});

http.route({
	path: "/variant",
	method: "GET",
	handler: GET,
});

export default http;

