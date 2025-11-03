// Simple end-to-end demo: creates a campaign + variants via Convex admin endpoints,
// then simulates assign + impression/click/convert events.

const BASE = process.env.CONVEX_HTTP_BASE; // e.g., http://localhost:3000/api/http
const ADMIN = process.env.ADMIN_SECRET; // must match backend

if (!BASE || !ADMIN) {
  console.error("Set CONVEX_HTTP_BASE and ADMIN_SECRET in env");
  process.exit(1);
}

async function post(path, body, headers = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${path} failed: ${res.status}`);
  return await res.json();
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`${path} failed: ${res.status}`);
  return await res.json();
}

function rand(p) { return Math.random() < p; }

async function main() {
  // 1) Create campaign
  const camp = await post("/admin/createCampaign", {
    goal: { type: "conversions", target: 10 },
    segments: ["human", "agent"],
    name: "Demo Campaign",
  }, { "x-admin-key": ADMIN });
  const campaignId = camp.id;
  console.log("campaign:", campaignId);

  // 2) Create variants for both segments
  const vdefs = [
    { segment: "human", payload: { human: { headline: "Never miss an outage", subhead: "Detect in <5s", bullets: ["Edge probes", "SLA 99.99%"], cta: { label: "Start free", url: "https://example.com" } } } },
    { segment: "human", payload: { human: { headline: "API monitoring that actually works", subhead: "Global checks", bullets: ["20 regions", "Slack alerts"], cta: { label: "Try now", url: "https://example.com" } } } },
    { segment: "agent", payload: { agent: { jsonld: { "@context": "https://schema.org", "@type": "Offer", name: "Acme API Monitoring", description: "Detect incidents <5s; 99.99% SLA", url: "https://example.com" } } } },
    { segment: "agent", payload: { agent: { jsonld: { "@context": "https://schema.org", "@type": "Offer", name: "Acme API Monitoring Pro", description: "Edge probes; credits on downtime", url: "https://example.com/pro" } } } },
  ];
  const variantIds = [];
  for (const def of vdefs) {
    const v = await post("/admin/createVariant", { campaignId, ...def }, { "x-admin-key": ADMIN });
    variantIds.push(v.id);
  }
  console.log("variants:", variantIds.join(","));

  // 3) Simulate traffic
  async function one(segment) {
    const assign = await post("/assign", { campaignId, segment, context: { geo: "US" } });
    const { assignmentId, variantId } = assign;
    await post("/event", { type: "impression", campaignId, variantId, segment, assignmentId });
    if (rand(0.25)) {
      await post("/event", { type: "click", campaignId, variantId, segment, assignmentId });
      if (rand(0.12)) {
        await post("/event", { type: "convert", campaignId, variantId, segment, assignmentId, value: 1 });
      }
    }
  }

  const N = Number(process.env.DEMO_REQUESTS || 100);
  for (let i = 0; i < N; i++) {
    await Promise.all([
      one("human"),
      one("agent"),
    ]);
    await new Promise(r => setTimeout(r, 10));
  }

  console.log("demo complete");
}

main().catch(err => { console.error(err); process.exit(1); });


