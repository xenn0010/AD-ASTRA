export type XAdCreative = {
	headline: string;
	body?: string;
	finalUrl: string;
};

export async function listLineItems(accountId: string): Promise<any[]> {
	throw new Error("xAds.listLineItems not implemented");
}

export async function createAd(lineItemId: string, creative: XAdCreative): Promise<{ adId: string }>{
	throw new Error("xAds.createAd not implemented");
}


