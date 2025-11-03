export type LayoutPreset = "square_1_1" | "landscape_1_91_1" | "story_9_16";

export type ImageVariantSpec = {
	product: string;
	headline: string;
	subhead?: string;
	cta?: { label: string; url: string };
};

export async function generateImage(
	spec: ImageVariantSpec,
	layout: LayoutPreset = "square_1_1"
): Promise<{ assetUrl: string; layout: LayoutPreset; meta: Record<string, unknown> }>
{
	// Placeholder stub: integrate NanoBanana API here
	const assetUrl = `https://cdn.example.com/image/${layout}/${Date.now()}.jpg`;
	return { assetUrl, layout, meta: { spec } };
}


