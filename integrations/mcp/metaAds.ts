export type MetaAdCreative = {
	primaryText: string;
	headline: string;
	callToAction?: string;
	linkUrl: string;
};

export async function listAdSets(accountId: string): Promise<any[]> {
	throw new Error("metaAds.listAdSets not implemented");
}

export async function createAd(adSetId: string, creative: MetaAdCreative): Promise<{ adId: string }>{
	throw new Error("metaAds.createAd not implemented");
}


