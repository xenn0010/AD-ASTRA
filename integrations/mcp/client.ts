type ToolName = "googleAds" | "metaAds" | "xAds" | "redditAds" | "ga4" | "storage";

export type MCPRequest = {
	tool: ToolName;
	action: string;
	params?: Record<string, unknown>;
};

export async function callTool<T = unknown>(req: MCPRequest): Promise<T> {
	// Placeholder: integrate Metorial MCP SDK; this is a shim
	throw new Error(`MCP tool not wired: ${req.tool}.${req.action}`);
}


