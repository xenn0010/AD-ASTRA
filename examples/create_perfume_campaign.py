#!/usr/bin/env python3
"""
Example: Create an Agent-Based Perfume Campaign

This script demonstrates how to:
1. Create a campaign with a conversion goal
2. Upload product assets
3. Generate AI agent swarm (50 agents across 5 types)
4. Deploy agents to start optimization

Usage:
    python examples/create_perfume_campaign.py
"""

import asyncio
import os
from typing import Dict, Any, List

import httpx
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Service URLs
CONVEX_BASE = os.getenv("CONVEX_HTTP_BASE", "http://localhost:8788")
ORCHESTRATOR_URL = os.getenv("AGENT_ORCHESTRATOR_URL", "http://localhost:8001")
ADMIN_SECRET = os.getenv("ADMIN_SECRET")


async def create_campaign() -> str:
    """Step 1: Create campaign in Convex"""
    print("📝 Creating campaign...")

    campaign_data = {
        "name": "Midnight Rose Perfume Launch",
        "description": "Agent-based campaign to drive 10k purchases of new luxury perfume",
        "goal": {
            "type": "conversions",
            "target": 10000
        },
        "segments": ["human", "agent"],  # Optimize for both humans and AI agents
        "budgets": {
            "total": 50000,
            "daily": 1666,
            "currency": "USD"
        }
    }

    headers = {"x-admin-key": ADMIN_SECRET} if ADMIN_SECRET else {}

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"{CONVEX_BASE}/admin/createCampaign",
            json=campaign_data,
            headers=headers
        )
        response.raise_for_status()
        result = response.json()

    campaign_id = result["id"]
    print(f"✅ Campaign created: {campaign_id}")
    return campaign_id


async def create_agent_swarm(campaign_id: str) -> Dict[str, Any]:
    """Step 2: Create agent swarm across all types"""
    print("\n🤖 Creating agent swarm...")

    # Product information
    product_info = {
        "name": "Midnight Rose Eau de Parfum",
        "brand": "Luxe Fragrances",
        "price": "$89",
        "description": "A captivating blend of rose, sandalwood, and vanilla with hints of amber",
        "features": [
            "Long-lasting 24-hour wear",
            "Sustainably sourced ingredients",
            "Luxurious hand-blown glass bottle",
            "Cruelty-free and vegan",
            "Made in France"
        ],
        "targetAudience": "Women 25-45, luxury shoppers, fragrance enthusiasts",
        "valueProp": "Parisian elegance meets modern sustainability",
        "pricePoint": "Premium ($80-$100)",
        "category": "Luxury Fragrance"
    }

    # Campaign assets (in real use, these would be actual uploaded files)
    assets = [
        {
            "assetType": "image",
            "fileName": "bottle_hero.jpg",
            "fileUrl": "https://example.com/assets/bottle_hero.jpg",
            "description": "Hero shot of perfume bottle",
            "tags": ["product", "hero", "bottle"]
        },
        {
            "assetType": "image",
            "fileName": "lifestyle_1.jpg",
            "fileUrl": "https://example.com/assets/lifestyle_1.jpg",
            "description": "Lifestyle shot: elegant woman wearing perfume",
            "tags": ["lifestyle", "luxury", "elegant"]
        },
        {
            "assetType": "video",
            "fileName": "product_showcase.mp4",
            "fileUrl": "https://example.com/assets/product_showcase.mp4",
            "description": "30-second product showcase video",
            "tags": ["video", "showcase", "luxury"]
        }
    ]

    # Goal configuration
    goal = {
        "type": "conversions",
        "target": 10000
    }

    # Create agents for each type
    agent_types = ["landing_page", "social_media", "placement", "visual", "ai_context"]
    segments = ["human", "agent"]  # Create agents for both human and AI audiences

    results = {
        "campaign_id": campaign_id,
        "agents_created": []
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        for agent_type in agent_types:
            for segment in segments:
                print(f"  Creating {agent_type} agents for {segment} segment...")

                request_data = {
                    "campaignId": campaign_id,
                    "agentType": agent_type,
                    "segment": segment,
                    "assets": assets,
                    "productInfo": product_info,
                    "goal": goal,
                    "count": 5  # 5 seed agents per type/segment = 50 total
                }

                try:
                    response = await client.post(
                        f"{ORCHESTRATOR_URL}/create-agents",
                        json=request_data
                    )
                    response.raise_for_status()
                    result = response.json()

                    results["agents_created"].append({
                        "type": agent_type,
                        "segment": segment,
                        "count": result["count"],
                        "agents": result.get("agents", [])
                    })

                    print(f"    ✅ Created {result['count']} {agent_type} agents")

                except Exception as e:
                    print(f"    ❌ Error creating {agent_type} agents: {e}")

    total_agents = sum(r["count"] for r in results["agents_created"])
    print(f"\n✅ Total agents created: {total_agents}")

    return results


async def display_summary(campaign_id: str, agents_data: Dict[str, Any]):
    """Step 3: Display campaign summary"""
    print("\n" + "="*60)
    print("🎉 CAMPAIGN DEPLOYED SUCCESSFULLY")
    print("="*60)

    print(f"\n📊 Campaign ID: {campaign_id}")
    print(f"🎯 Goal: 10,000 purchases")
    print(f"💰 Budget: $50,000 total ($1,666/day)")
    print(f"⏱️  Timeline: 30 days")

    print("\n🤖 Agent Swarm Composition:")
    for agent_group in agents_data["agents_created"]:
        print(f"  • {agent_group['type']} ({agent_group['segment']}): {agent_group['count']} agents")

    print("\n📈 What Happens Next:")
    print("  1. Multi-armed bandit starts selecting agents for traffic")
    print("  2. Agents adapt content based on visitor behavior")
    print("  3. Performance metrics tracked (CTR, CVR, revenue)")
    print("  4. Every 48 hours: Top 20% agents breed new generation")
    print("  5. Weak agents retire, strong agents dominate")
    print("  6. Process continues until 10k purchases reached")

    print("\n🔗 URLs:")
    print(f"  Campaign Status: {CONVEX_BASE}/campaigns/{campaign_id}")
    print(f"  Evolution Status: http://localhost:8002/evolution-status/{campaign_id}")

    print("\n💡 Monitor Your Campaign:")
    print(f"  curl http://localhost:8002/evolution-status/{campaign_id}")

    print("\n🚀 Agents are now LIVE and optimizing!")
    print("="*60)


async def main():
    """Main execution"""
    print("🚀 Ad-Astra Agent-Based Campaign Creator")
    print("🌹 Creating Midnight Rose Perfume Campaign\n")

    try:
        # Step 1: Create campaign
        campaign_id = await create_campaign()

        # Step 2: Create agent swarm
        agents_data = await create_agent_swarm(campaign_id)

        # Step 3: Display summary
        await display_summary(campaign_id, agents_data)

    except httpx.HTTPStatusError as e:
        print(f"\n❌ HTTP Error: {e.response.status_code}")
        print(f"Response: {e.response.text}")
    except Exception as e:
        print(f"\n❌ Error: {e}")


if __name__ == "__main__":
    asyncio.run(main())
