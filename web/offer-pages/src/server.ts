import { Hono } from "hono";
import { serve } from "hono/node";

type HumanPayload = {
  headline?: string;
  subhead?: string;
  bullets?: string[];
  cta?: { label: string; url: string };
  imageAssetId?: string;
  videoAssetId?: string;
};

type AgentPayload = {
  jsonld?: unknown;
  blob?: unknown;
};

type VariantPayload = {
  human?: HumanPayload;
  agent?: AgentPayload;
};

// Convex-backed data source
async function getVariantPayload(variantId: string): Promise<VariantPayload | null> {
  const base = process.env.CONVEX_HTTP_BASE;
  if (!base) return null;
  const res = await fetch(`${base}/variant?id=${encodeURIComponent(variantId)}`);
  if (!res.ok) return null;
  const data = await res.json();
  return (data?.payload as VariantPayload) ?? null;
}

function renderHtml(id: string, payload: VariantPayload): string {
  const h = payload.human ?? {};
  const bullets = h.bullets?.map(b => `<li>${b}</li>`).join("") ?? "";
  const jsonld = payload.agent?.jsonld ? `<script type="application/ld+json">${JSON.stringify(payload.agent.jsonld)}</script>` : "";
  const cta = h.cta ? `<a href="${h.cta.url}" class="cta">${h.cta.label}</a>` : "";
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Offer ${id}</title>
  ${jsonld}
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Arial,sans-serif;margin:0;padding:40px;line-height:1.4}
    h1{font-size:32px;margin:0 0 8px}
    p{color:#444;margin:0 0 12px}
    ul{padding-left:18px;margin:0 0 16px}
    .cta{display:inline-block;background:#111;color:#fff;padding:10px 14px;border-radius:6px;text-decoration:none}
  </style>
  <link rel="alternate" type="application/json" href="./ai.json" />
  <meta name="robots" content="index,follow" />
  <meta name="ai-agents" content="allow" />
  <link rel="ai-agents" href="/.well-known/ai.json" />
  </head>
<body>
  <main>
    <h1>${h.headline ?? ""}</h1>
    <p>${h.subhead ?? ""}</p>
    <ul>${bullets}</ul>
    ${cta}
  </main>
</body>
</html>`;
}

const app = new Hono();

app.get("/offer/:id", async c => {
  const id = c.req.param("id");
  const payload = await getVariantPayload(id);
  if (!payload) return c.text("Not Found", 404);
  return c.html(renderHtml(id, payload));
});

app.get("/offer/:id/ai.json", async c => {
  const id = c.req.param("id");
  const payload = await getVariantPayload(id);
  if (!payload) return c.json({ error: "Not Found" }, 404);
  const agent = payload.agent ?? {};
  return c.json({ ad_id: id, ...agent });
});

app.get("/.well-known/ai.json", c => {
  return c.json({
    policy: "allow",
    contact: "mailto:ads@example.com",
    docs: "https://example.com/agent-offers"
  });
});

serve({ fetch: app.fetch, port: Number(process.env.PORT || 8787) });


