import { queryGeneric } from "convex/server";
import { v } from "convex/values";

const query = queryGeneric;

export const getActiveVariantsByCampaignSegment = query({
	args: {
		campaignId: v.id("campaigns"),
		segment: v.union(v.literal("human"), v.literal("agent")),
	},
	handler: async (ctx, args) => {
		return await ctx.db
			.query("variants")
			.withIndex("by_campaign_segment", q =>
				q.eq("campaignId", args.campaignId).eq("segment", args.segment),
			)
			.filter(q => q.eq(q.field("active"), true))
			.collect();
	},
});

export const getVariantById = query({
	args: { id: v.id("variants") },
	handler: async (ctx, args) => {
		const variant = await ctx.db.get(args.id);
		return variant;
	},
});

// Get agent metrics for a specific variant
export const getAgentMetrics = query({
	args: { variantId: v.id("variants") },
	handler: async (ctx, args) => {
		const metrics = await ctx.db
			.query("agent_metrics")
			.withIndex("by_variant", (q) => q.eq("variantId", args.variantId))
			.first();
		return metrics;
	},
});

// Get all metrics for a campaign
export const getCampaignMetrics = query({
	args: { campaignId: v.id("campaigns") },
	handler: async (ctx, args) => {
		const metrics = await ctx.db
			.query("agent_metrics")
			.withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
			.collect();
		return metrics;
	},
});

// Get top performing agents by fitness
export const getTopPerformers = query({
	args: {
		campaignId: v.id("campaigns"),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const limit = args.limit ?? 10;
		const metrics = await ctx.db
			.query("agent_metrics")
			.withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
			.collect();

		// Sort by fitness score descending
		const sorted = metrics.sort((a, b) => b.fitnessScore - a.fitnessScore);
		return sorted.slice(0, limit);
	},
});

// Get evolution history for a campaign
export const getEvolutionHistory = query({
	args: { campaignId: v.id("campaigns") },
	handler: async (ctx, args) => {
		const history = await ctx.db
			.query("evolution_history")
			.withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
			.collect();
		return history;
	},
});

// Get all variants for a campaign by agent type
export const getVariantsByType = query({
	args: {
		campaignId: v.id("campaigns"),
		agentType: v.union(
			v.literal("landing_page"),
			v.literal("social_media"),
			v.literal("placement"),
			v.literal("visual"),
			v.literal("ai_context")
		),
	},
	handler: async (ctx, args) => {
		const variants = await ctx.db
			.query("variants")
			.withIndex("by_campaign_type", (q) =>
				q.eq("campaignId", args.campaignId).eq("agentType", args.agentType)
			)
			.collect();
		return variants;
	},
});

// Get campaign stats
export const getCampaignStats = query({
	args: { campaignId: v.id("campaigns") },
	handler: async (ctx, args) => {
		// Get campaign
		const campaign = await ctx.db.get(args.campaignId);
		if (!campaign) return null;

		// Get all variants
		const variants = await ctx.db
			.query("variants")
			.withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
			.collect();

		// Get all metrics
		const metrics = await ctx.db
			.query("agent_metrics")
			.withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
			.collect();

		// Get all events
		const events = await ctx.db
			.query("events")
			.withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
			.collect();

		// Calculate totals
		const totalImpressions = metrics.reduce((sum, m) => sum + m.impressions, 0);
		const totalClicks = metrics.reduce((sum, m) => sum + m.clicks, 0);
		const totalConversions = metrics.reduce((sum, m) => sum + m.conversions, 0);
		const totalRevenue = metrics.reduce((sum, m) => sum + m.revenue, 0);

		const overallCTR = totalImpressions > 0 ? totalClicks / totalImpressions : 0;
		const overallCVR = totalClicks > 0 ? totalConversions / totalClicks : 0;

		// Get current generation
		const generations = variants
			.map((v) => v.agentConfig?.evolution?.generation ?? 0)
			.filter((g) => g !== undefined);
		const currentGeneration = generations.length > 0 ? Math.max(...generations) : 0;

		return {
			campaign,
			totalVariants: variants.length,
			activeVariants: variants.filter((v) => v.active).length,
			currentGeneration,
			totalImpressions,
			totalClicks,
			totalConversions,
			totalRevenue,
			overallCTR,
			overallCVR,
			goalProgress: campaign.goal.type === "conversions"
				? (totalConversions / campaign.goal.target) * 100
				: (totalRevenue / campaign.goal.target) * 100,
		};
	},
});


