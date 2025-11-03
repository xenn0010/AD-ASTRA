export type GoogleAdCreative = {
	headline: string;
	description?: string;
	finalUrl: string;
};

export async function listCampaigns(accountId: string): Promise<any[]> {
	// TODO: implement via Metorial MCP Google Ads tool
	throw new Error("googleAds.listCampaigns not implemented");
}

export async function createAd(campaignId: string, creative: GoogleAdCreative): Promise<{ adId: string }>{
	// TODO: implement via Metorial MCP Google Ads tool
	throw new Error("googleAds.createAd not implemented");
}

export async function getCosts(campaignId: string, sinceDays: number = 7): Promise<{ costMicros: number }>{
	// TODO: implement via Metorial MCP Google Ads tool
	throw new Error("googleAds.getCosts not implemented");
}


