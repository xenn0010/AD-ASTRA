import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const segmentEnum = v.union(v.literal("human"), v.literal("agent"));
const agentTypeEnum = v.union(
	v.literal("landing_page"),
	v.literal("social_media"),
	v.literal("placement"),
	v.literal("visual"),
	v.literal("ai_context")
);

export default defineSchema({
	campaigns: defineTable({
		goal: v.object({
			type: v.union(v.literal("conversions"), v.literal("revenue")),
			target: v.number(),
		}),
		segments: v.array(segmentEnum),
		status: v.union(
			v.literal("draft"),
			v.literal("running"),
			v.literal("paused"),
			v.literal("completed"),
		),
		budgets: v.optional(
			v.object({
				daily: v.optional(v.number()),
				total: v.optional(v.number()),
				currency: v.optional(v.string()),
			}),
		),
		createdAt: v.number(),
		name: v.optional(v.string()),
		description: v.optional(v.string()),
	})
		.index("by_status", ["status"]) 
		.index("by_created", ["createdAt"]),

	variants: defineTable({
		campaignId: v.id("campaigns"),
		segment: segmentEnum,
		agentType: agentTypeEnum, // NEW: Type of agent (landing_page, social_media, etc.)
		payload: v.object({
			human: v.optional(
				v.object({
					headline: v.optional(v.string()),
					subhead: v.optional(v.string()),
					bullets: v.optional(v.array(v.string())),
					cta: v.optional(
						v.object({ label: v.string(), url: v.string() }),
					),
					imageAssetId: v.optional(v.string()),
					videoAssetId: v.optional(v.string()),
				}),
			),
			agent: v.optional(
				v.object({
					jsonld: v.optional(v.any()),
					blob: v.optional(v.any()),
					aiWellKnownPath: v.optional(v.string()),
				}),
			),
		}),
		// Agent-based advertising configuration
		agentConfig: v.optional(
			v.object({
				// Agent personality
				personality: v.object({
					tone: v.string(), // e.g., "friendly", "professional", "enthusiastic"
					style: v.string(), // e.g., "consultative", "direct", "storytelling"
					traits: v.array(v.string()), // e.g., ["empathetic", "data-driven"]
				}),
				// Strategy configuration
				strategy: v.object({
					objective: v.string(), // e.g., "maximize_conversions"
					tactics: v.array(v.string()), // e.g., ["social_proof", "urgency"]
					adaptationRate: v.number(), // 0-1
				}),
				// LLM configuration
				llmConfig: v.object({
					model: v.string(), // e.g., "gpt-4-turbo-preview"
					systemPrompt: v.string(), // Base instructions
					temperature: v.number(),
					maxTokens: v.number(),
				}),
				// Evolution tracking
				evolution: v.object({
					generation: v.number(), // Which generation (0 = seed)
					parentIds: v.array(v.id("variants")), // Parent agent IDs
					mutationRate: v.number(),
					fitnessScore: v.number(), // Performance metric
				}),
			}),
		),
		active: v.boolean(),
		createdAt: v.number(),
		name: v.optional(v.string()),
	})
		.index("by_campaign", ["campaignId"])
		.index("by_campaign_segment", ["campaignId", "segment"])
		.index("by_campaign_type", ["campaignId", "agentType"])
		.index("by_active", ["active"])
		.index("by_generation", ["agentConfig.evolution.generation"]),

	assignments: defineTable({
		campaignId: v.id("campaigns"),
		segment: segmentEnum,
		variantId: v.id("variants"),
		reqId: v.string(),
		ts: v.number(),
		meta: v.optional(v.any()),
	})
		.index("by_campaign", ["campaignId"]) 
		.index("by_variant", ["variantId"]) 
		.index("by_req", ["reqId"]),

	events: defineTable({
		type: v.union(
			v.literal("impression"),
			v.literal("click"),
			v.literal("convert"),
		),
		campaignId: v.id("campaigns"),
		variantId: v.id("variants"),
		segment: segmentEnum,
		assignmentId: v.id("assignments"),
		ts: v.number(),
		value: v.optional(v.number()),
		ua: v.optional(v.string()),
		ipHash: v.optional(v.string()),
		geo: v.optional(v.string()),
	})
		.index("by_campaign", ["campaignId"]) 
		.index("by_variant", ["variantId"]) 
		.index("by_assignment", ["assignmentId"]) 
		.index("by_type", ["type"]) 
		.index("by_ts", ["ts"]),

	bandit_state: defineTable({
		campaignId: v.id("campaigns"),
		segment: segmentEnum,
		arms: v.object({}), // map of variantId -> params; stored as plain object
		updatedAt: v.number(),
	})
		.index("by_campaign_segment", ["campaignId", "segment"])
		.index("by_updated", ["updatedAt"]),

	// NEW: Campaign assets (uploaded images, videos, content)
	campaign_assets: defineTable({
		campaignId: v.id("campaigns"),
		assetType: v.union(
			v.literal("image"),
			v.literal("video"),
			v.literal("text"),
			v.literal("pdf")
		),
		fileName: v.string(),
		fileUrl: v.string(),
		fileSize: v.number(),
		mimeType: v.string(),
		metadata: v.optional(v.any()), // Image dimensions, video length, etc.
		description: v.optional(v.string()),
		tags: v.array(v.string()),
		createdAt: v.number(),
	})
		.index("by_campaign", ["campaignId"])
		.index("by_type", ["assetType"])
		.index("by_created", ["createdAt"]),

	// NEW: Agent interactions (tracks all agent behavior)
	agent_interactions: defineTable({
		campaignId: v.id("campaigns"),
		variantId: v.id("variants"), // Which agent
		agentType: agentTypeEnum,
		assignmentId: v.id("assignments"),
		interactionType: v.union(
			v.literal("page_view"),
			v.literal("hover"),
			v.literal("scroll"),
			v.literal("click"),
			v.literal("form_interaction"),
			v.literal("content_change")
		),
		context: v.any(), // Interaction details
		timestamp: v.number(),
		visitorId: v.optional(v.string()),
		sessionId: v.optional(v.string()),
	})
		.index("by_campaign", ["campaignId"])
		.index("by_variant", ["variantId"])
		.index("by_assignment", ["assignmentId"])
		.index("by_timestamp", ["timestamp"]),

	// NEW: Agent memory (what agents learn from interactions)
	agent_memory: defineTable({
		variantId: v.id("variants"),
		memoryType: v.union(
			v.literal("successful_tactic"),
			v.literal("failed_tactic"),
			v.literal("visitor_pattern"),
			v.literal("conversion_insight")
		),
		insight: v.string(), // What the agent learned
		confidence: v.number(), // 0-1
		occurrences: v.number(), // How many times observed
		lastSeen: v.number(),
		createdAt: v.number(),
	})
		.index("by_variant", ["variantId"])
		.index("by_type", ["memoryType"])
		.index("by_confidence", ["confidence"]),

	// NEW: Evolution history (tracks breeding and mutations)
	evolution_history: defineTable({
		campaignId: v.id("campaigns"),
		generation: v.number(),
		parentIds: v.array(v.id("variants")),
		childId: v.id("variants"),
		mutationsApplied: v.array(v.string()), // Which traits mutated
		reason: v.string(), // Why this breeding happened
		timestamp: v.number(),
	})
		.index("by_campaign", ["campaignId"])
		.index("by_generation", ["generation"])
		.index("by_child", ["childId"]),

	// NEW: Agent performance metrics (for fitness scoring)
	agent_metrics: defineTable({
		variantId: v.id("variants"),
		campaignId: v.id("campaigns"),
		// Engagement metrics
		impressions: v.number(),
		clicks: v.number(),
		conversions: v.number(),
		revenue: v.number(),
		// Calculated metrics
		ctr: v.number(), // Click-through rate
		cvr: v.number(), // Conversion rate
		avgEngagementTime: v.number(), // seconds
		bounceRate: v.number(), // 0-1
		// Fitness score
		fitnessScore: v.number(),
		// Time window
		windowStart: v.number(),
		windowEnd: v.number(),
		updatedAt: v.number(),
	})
		.index("by_variant", ["variantId"])
		.index("by_campaign", ["campaignId"])
		.index("by_fitness", ["fitnessScore"])
		.index("by_updated", ["updatedAt"]),
});


