import { mutationGeneric } from "convex/server";
import { v } from "convex/values";

const mutation = mutationGeneric;

export const createAssignment = mutation({
	args: {
		campaignId: v.id("campaigns"),
		segment: v.union(v.literal("human"), v.literal("agent")),
		variantId: v.id("variants"),
		reqId: v.string(),
		ts: v.number(),
		meta: v.optional(v.any()),
	},
	handler: async (ctx, args) => {
		const id = await ctx.db.insert("assignments", args);
		return id;
	},
});

export const insertEvent = mutation({
	args: {
		type: v.union(
			v.literal("impression"),
			v.literal("click"),
			v.literal("convert"),
		),
		campaignId: v.id("campaigns"),
		variantId: v.id("variants"),
		segment: v.union(v.literal("human"), v.literal("agent")),
		assignmentId: v.id("assignments"),
		ts: v.number(),
		value: v.optional(v.number()),
		ua: v.optional(v.string()),
		ipHash: v.optional(v.string()),
		geo: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		await ctx.db.insert("events", args);
		return { ok: true } as const;
	},
});

export const createCampaign = mutation({
	args: {
		goal: v.object({
			type: v.union(v.literal("conversions"), v.literal("revenue")),
			target: v.number(),
		}),
		segments: v.array(v.union(v.literal("human"), v.literal("agent"))),
		name: v.optional(v.string()),
		description: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const now = Date.now();
		const id = await ctx.db.insert("campaigns", {
			...args,
			status: "running",
			createdAt: now,
		});
		return id;
	},
});

export const createVariant = mutation({
	args: {
		campaignId: v.id("campaigns"),
		segment: v.union(v.literal("human"), v.literal("agent")),
		agentType: v.union(
			v.literal("landing_page"),
			v.literal("social_media"),
			v.literal("placement"),
			v.literal("visual"),
			v.literal("ai_context")
		),
		payload: v.any(),
		agentConfig: v.optional(v.any()),
		name: v.optional(v.string()),
		active: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const now = Date.now();
		const id = await ctx.db.insert("variants", {
			campaignId: args.campaignId,
			segment: args.segment,
			agentType: args.agentType,
			payload: args.payload,
			agentConfig: args.agentConfig,
			active: args.active ?? true,
			createdAt: now,
			name: args.name,
		});
		return id;
	},
});

// Agent metrics mutations
export const upsertAgentMetrics = mutation({
	args: {
		variantId: v.id("variants"),
		campaignId: v.id("campaigns"),
		impressions: v.number(),
		clicks: v.number(),
		conversions: v.number(),
		revenue: v.number(),
		ctr: v.number(),
		cvr: v.number(),
		avgEngagementTime: v.number(),
		bounceRate: v.number(),
		fitnessScore: v.number(),
		windowStart: v.number(),
		windowEnd: v.number(),
	},
	handler: async (ctx, args) => {
		const now = Date.now();

		// Check if metrics already exist
		const existing = await ctx.db
			.query("agent_metrics")
			.withIndex("by_variant", (q) => q.eq("variantId", args.variantId))
			.first();

		if (existing) {
			await ctx.db.patch(existing._id, {
				...args,
				updatedAt: now,
			});
			return existing._id;
		} else {
			const id = await ctx.db.insert("agent_metrics", {
				...args,
				updatedAt: now,
			});
			return id;
		}
	},
});

// Track agent interactions
export const insertAgentInteraction = mutation({
	args: {
		campaignId: v.id("campaigns"),
		variantId: v.id("variants"),
		agentType: v.union(
			v.literal("landing_page"),
			v.literal("social_media"),
			v.literal("placement"),
			v.literal("visual"),
			v.literal("ai_context")
		),
		assignmentId: v.id("assignments"),
		interactionType: v.union(
			v.literal("page_view"),
			v.literal("hover"),
			v.literal("scroll"),
			v.literal("click"),
			v.literal("form_interaction"),
			v.literal("content_change")
		),
		context: v.any(),
		visitorId: v.optional(v.string()),
		sessionId: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const id = await ctx.db.insert("agent_interactions", {
			...args,
			timestamp: Date.now(),
		});
		return id;
	},
});

// Store evolution history
export const insertEvolutionHistory = mutation({
	args: {
		campaignId: v.id("campaigns"),
		generation: v.number(),
		parentIds: v.array(v.id("variants")),
		childId: v.id("variants"),
		mutationsApplied: v.array(v.string()),
		reason: v.string(),
	},
	handler: async (ctx, args) => {
		const id = await ctx.db.insert("evolution_history", {
			...args,
			timestamp: Date.now(),
		});
		return id;
	},
});

// Update variant fitness score
export const updateVariantFitness = mutation({
	args: {
		variantId: v.id("variants"),
		fitnessScore: v.number(),
	},
	handler: async (ctx, args) => {
		const variant = await ctx.db.get(args.variantId);
		if (!variant || !variant.agentConfig) {
			throw new Error("Variant not found or missing agent config");
		}

		// Update fitness in agentConfig
		const updatedConfig = {
			...variant.agentConfig,
			evolution: {
				...variant.agentConfig.evolution,
				fitnessScore: args.fitnessScore,
			},
		};

		await ctx.db.patch(args.variantId, {
			agentConfig: updatedConfig,
		});

		return { ok: true };
	},
});

export const recalculateMetricsForCampaign = mutation({
	args: {
		campaignId: v.id("campaigns"),
	},
	handler: async (ctx, args) => {
		const events = await ctx.db
			.query("events")
			.withIndex("by_campaign", q => q.eq("campaignId", args.campaignId))
			.collect();

		const now = Date.now();

		if (events.length === 0) {
			return { updated: 0, events: 0 };
		}

		type Bucket = {
			impressions: number;
			clicks: number;
			conversions: number;
			revenue: number;
			windowStart: number;
			windowEnd: number;
		};

		const buckets = new Map<string, Bucket>();

		for (const evt of events) {
			const key = evt.variantId as string;
			const bucket = buckets.get(key) ?? {
				impressions: 0,
				clicks: 0,
				conversions: 0,
				revenue: 0,
				windowStart: evt.ts,
				windowEnd: evt.ts,
			};

			if (evt.type === "impression") bucket.impressions += 1;
			if (evt.type === "click") bucket.clicks += 1;
			if (evt.type === "convert") {
				bucket.conversions += 1;
				bucket.revenue += typeof evt.value === "number" ? evt.value : 0;
			}

			bucket.windowStart = Math.min(bucket.windowStart, evt.ts);
			bucket.windowEnd = Math.max(bucket.windowEnd, evt.ts);

			buckets.set(key, bucket);
		}

		let updated = 0;

		for (const [variantId, bucket] of buckets.entries()) {
			const impressions = bucket.impressions;
			const clicks = bucket.clicks;
			const conversions = bucket.conversions;
			const revenue = bucket.revenue;

			const ctr = impressions > 0 ? clicks / impressions : 0;
			const cvr = clicks > 0 ? conversions / clicks : 0;

			const existing = await ctx.db
				.query("agent_metrics")
				.withIndex("by_variant", q => q.eq("variantId", variantId as any))
				.first();

			const payload = {
				variantId: variantId as any,
				campaignId: args.campaignId,
				impressions,
				clicks,
				conversions,
				revenue,
				ctr,
				cvr,
				avgEngagementTime: existing?.avgEngagementTime ?? 0,
				bounceRate: existing?.bounceRate ?? 0,
				fitnessScore: existing?.fitnessScore ?? 0,
				windowStart: bucket.windowStart,
				windowEnd: bucket.windowEnd,
				updatedAt: now,
			};

			if (existing) {
				await ctx.db.patch(existing._id, payload);
			} else {
				await ctx.db.insert("agent_metrics", payload);
			}

			updated += 1;
		}

		return { updated, events: events.length };
	},
});

