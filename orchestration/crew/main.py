from __future__ import annotations

import json
import os
from dataclasses import dataclass
from typing import Any, Dict, List

import httpx


@dataclass
class Offer:
    product: str
    value_props: List[str]
    pricing: Dict[str, str]
    tone: str = "enterprise"


def make_human_variant(offer: Offer) -> Dict[str, Any]:
    headline = f"{offer.product}: {offer.value_props[0]}"
    subhead = " ".join(offer.value_props[1:])[:140]
    bullets = offer.value_props[:3]
    return {
        "headline": headline,
        "subhead": subhead,
        "bullets": bullets,
        "cta": {"label": "Try free", "url": os.environ.get("DEFAULT_CTA_URL", "https://example.com/signup")},
    }


def make_agent_payload(offer: Offer) -> Dict[str, Any]:
    return {
        "jsonld": {
            "@context": "https://schema.org",
            "@type": "Offer",
            "name": offer.product,
            "description": "; ".join(offer.value_props),
            "offers": {"price": offer.pricing.get("starter", ""), "priceCurrency": "USD"},
        }
    }


async def create_variant_in_convex(campaign_id: str, segment: str, payload: Dict[str, Any]) -> str:
    # Placeholder: In a real setup, call a Convex mutation; for now, we call the /assign path indirectly by ensuring variant exists.
    # This function should be replaced with a dedicated Convex mutation to insert a variant.
    return "var_temp"


async def trigger_generation(campaign_id: str, offer: Offer) -> List[Dict[str, Any]]:
    variants: List[Dict[str, Any]] = []
    # Generate 3 human + 3 agent variants (simple templates for MVP)
    for i in range(3):
        human = make_human_variant(offer)
        agent = make_agent_payload(offer)
        variants.append({"segment": "human", "payload": {"human": human}})
        variants.append({"segment": "agent", "payload": {"agent": agent}})
    return variants


async def main() -> None:
    # Example usage: generate variants for a campaign
    campaign_id = os.environ.get("CAMPAIGN_ID", "camp_123")
    offer = Offer(
        product=os.environ.get("PRODUCT", "Acme API Monitoring"),
        value_props=[
            "Detect incidents <5s",
            "99.99% SLA",
            "Edge probes in 20 regions",
        ],
        pricing={"starter": "$29/mo", "pro": "$99/mo"},
    )
    variants = await trigger_generation(campaign_id, offer)
    print(json.dumps({"campaignId": campaign_id, "generated": len(variants)}, indent=2))


if __name__ == "__main__":
    import asyncio

    asyncio.run(main())


