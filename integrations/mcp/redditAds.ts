export type RedditAdCreative = {
	title: string;
	body?: string;
	finalUrl: string;
};

export async function listAdGroups(advertiserId: string): Promise<any[]> {
	throw new Error("redditAds.listAdGroups not implemented");
}

export async function createAd(adGroupId: string, creative: RedditAdCreative): Promise<{ adId: string }>{
	throw new Error("redditAds.createAd not implemented");
}


