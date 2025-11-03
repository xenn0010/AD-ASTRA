export async function getConversions(
	propertyId: string,
	sinceDays: number = 7
): Promise<{ total: number; byEvent: Record<string, number> }>
{
	// TODO: implement via Metorial MCP GA4 tool
	throw new Error("ga4.getConversions not implemented");
}


