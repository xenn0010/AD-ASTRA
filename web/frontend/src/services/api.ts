// API Service for Ad-Astra Backend Integration

const BACKEND_CONFIG = {
	banditService: import.meta.env.VITE_BANDIT_SERVICE_URL || "http://localhost:8000",
	agentOrchestrator: import.meta.env.VITE_AGENT_ORCHESTRATOR_URL || "http://localhost:8001",
	evolutionService: import.meta.env.VITE_EVOLUTION_SERVICE_URL || "http://localhost:8002",
	offerPages: import.meta.env.VITE_OFFER_PAGES_URL || "http://localhost:8787",
	convexUrl: import.meta.env.VITE_CONVEX_URL || "https://spotted-coyote-595.convex.cloud",
};

export type Campaign = {
	id: string;
	name: string;
	goal: { type: string; target: number };
	status: "draft" | "running" | "paused" | "completed";
	conversions: number;
	spend: number;
	segments: string[];
	createdAt: number;
	agentsActive: number;
};

export type Agent = {
	id: string;
	campaignId: string;
	type: "creative" | "optimizer" | "analyst";
	status: "initializing" | "generating" | "testing" | "optimizing" | "active" | "error";
	progress: number;
	createdAt: number;
	tasksCompleted: number;
	performance: number;
};

export type CampaignMetrics = {
	impressions: number;
	clicks: number;
	conversions: number;
	spend: number;
	ctr: number;
	cpc: number;
	conversionRate: number;
};

// Campaign API
export const CampaignAPI = {
	async create(data: {
		name: string;
		goal: { type: string; target: number };
		segments: string[];
	}): Promise<Campaign> {
		const response = await fetch(`${BACKEND_CONFIG.agentOrchestrator}/campaigns`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			throw new Error(`Failed to create campaign: ${response.statusText}`);
		}

		return response.json();
	},

	async deploy(campaignId: string): Promise<{ success: boolean; message: string }> {
		const response = await fetch(
			`${BACKEND_CONFIG.agentOrchestrator}/campaigns/${campaignId}/deploy`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
			}
		);

		if (!response.ok) {
			throw new Error(`Failed to deploy campaign: ${response.statusText}`);
		}

		return response.json();
	},

	async pause(campaignId: string): Promise<{ success: boolean }> {
		const response = await fetch(
			`${BACKEND_CONFIG.agentOrchestrator}/campaigns/${campaignId}/pause`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
			}
		);

		if (!response.ok) {
			throw new Error(`Failed to pause campaign: ${response.statusText}`);
		}

		return response.json();
	},

	async resume(campaignId: string): Promise<{ success: boolean }> {
		const response = await fetch(
			`${BACKEND_CONFIG.agentOrchestrator}/campaigns/${campaignId}/resume`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
			}
		);

		if (!response.ok) {
			throw new Error(`Failed to resume campaign: ${response.statusText}`);
		}

		return response.json();
	},

	async getMetrics(campaignId: string): Promise<CampaignMetrics> {
		const response = await fetch(
			`${BACKEND_CONFIG.agentOrchestrator}/campaigns/${campaignId}/metrics`
		);

		if (!response.ok) {
			throw new Error(`Failed to fetch metrics: ${response.statusText}`);
		}

		return response.json();
	},

	async list(): Promise<Campaign[]> {
		const response = await fetch(`${BACKEND_CONFIG.agentOrchestrator}/campaigns`);

		if (!response.ok) {
			throw new Error(`Failed to fetch campaigns: ${response.statusText}`);
		}

		return response.json();
	},
};

// Agent API
export const AgentAPI = {
	async list(campaignId?: string): Promise<Agent[]> {
		const url = campaignId
			? `${BACKEND_CONFIG.agentOrchestrator}/agents?campaignId=${campaignId}`
			: `${BACKEND_CONFIG.agentOrchestrator}/agents`;

		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`Failed to fetch agents: ${response.statusText}`);
		}

		return response.json();
	},

	async create(campaignId: string, type: Agent["type"]): Promise<Agent> {
		const response = await fetch(`${BACKEND_CONFIG.agentOrchestrator}/agents`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ campaignId, type }),
		});

		if (!response.ok) {
			throw new Error(`Failed to create agent: ${response.statusText}`);
		}

		return response.json();
	},

	async stop(agentId: string): Promise<{ success: boolean }> {
		const response = await fetch(
			`${BACKEND_CONFIG.agentOrchestrator}/agents/${agentId}/stop`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
			}
		);

		if (!response.ok) {
			throw new Error(`Failed to stop agent: ${response.statusText}`);
		}

		return response.json();
	},
};

// Creative API (for AI-generated images/videos)
export type Creative = {
	id: string;
	type: "image" | "video";
	url: string;
	thumbnail?: string;
	title: string;
	variant: string;
	status: "generating" | "ready" | "deployed";
	performance?: {
		views: number;
		clicks: number;
		ctr: number;
	};
	generatedBy: string;
	createdAt: number;
	segment: "human" | "agent";
};

export const CreativeAPI = {
	async list(campaignId?: string): Promise<Creative[]> {
		const url = campaignId
			? `${BACKEND_CONFIG.agentOrchestrator}/creatives?campaignId=${campaignId}`
			: `${BACKEND_CONFIG.agentOrchestrator}/creatives`;

		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`Failed to fetch creatives: ${response.statusText}`);
		}

		return response.json();
	},

	async generate(data: {
		campaignId: string;
		type: "image" | "video";
		prompt: string;
		segment: "human" | "agent";
	}): Promise<Creative> {
		const response = await fetch(`${BACKEND_CONFIG.agentOrchestrator}/creatives/generate`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			throw new Error(`Failed to generate creative: ${response.statusText}`);
		}

		return response.json();
	},

	async getPerformance(creativeId: string): Promise<Creative["performance"]> {
		const response = await fetch(
			`${BACKEND_CONFIG.agentOrchestrator}/creatives/${creativeId}/performance`
		);

		if (!response.ok) {
			throw new Error(`Failed to fetch performance: ${response.statusText}`);
		}

		return response.json();
	},
};

// Chat API (for campaign assistant)
export const ChatAPI = {
	async sendMessage(message: string, campaignId?: string): Promise<string> {
		const response = await fetch(`${BACKEND_CONFIG.agentOrchestrator}/chat`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ message, campaignId }),
		});

		if (!response.ok) {
			throw new Error(`Failed to send message: ${response.statusText}`);
		}

		const data = await response.json();
		return data.response;
	},
};

// Bandit Service API (for A/B testing and optimization)
export const BanditAPI = {
	async getRecommendation(campaignId: string, context: Record<string, any>): Promise<any> {
		const response = await fetch(`${BACKEND_CONFIG.banditService}/recommend`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ campaignId, context }),
		});

		if (!response.ok) {
			throw new Error(`Failed to get recommendation: ${response.statusText}`);
		}

		return response.json();
	},

	async recordReward(
		campaignId: string,
		variantId: string,
		reward: number
	): Promise<{ success: boolean }> {
		const response = await fetch(`${BACKEND_CONFIG.banditService}/reward`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ campaignId, variantId, reward }),
		});

		if (!response.ok) {
			throw new Error(`Failed to record reward: ${response.statusText}`);
		}

		return response.json();
	},
};

// Health check for all services
export const HealthAPI = {
	async checkAll(): Promise<Record<string, boolean>> {
		const services = {
			bandit: BACKEND_CONFIG.banditService,
			orchestrator: BACKEND_CONFIG.agentOrchestrator,
			evolution: BACKEND_CONFIG.evolutionService,
		};

		const results: Record<string, boolean> = {};

		await Promise.all(
			Object.entries(services).map(async ([name, url]) => {
				try {
					const response = await fetch(`${url}/health`, { method: "GET" });
					results[name] = response.ok;
				} catch (error) {
					results[name] = false;
				}
			})
		);

		return results;
	},
};

export default {
	CampaignAPI,
	AgentAPI,
	CreativeAPI,
	ChatAPI,
	BanditAPI,
	HealthAPI,
	BACKEND_CONFIG,
};
