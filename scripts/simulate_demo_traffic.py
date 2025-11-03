#!/usr/bin/env python3
"""
Traffic Simulation Script for Ad-Astra Demo
Simulates realistic user behavior with varying conversion rates per variant
"""

import asyncio
import httpx
import random
import time
from typing import Dict, List

# Configuration
BANDIT_URL = "http://localhost:8000"
CAMPAIGN_ID = "demo_campaign"
SEGMENT = "human"

# Variant performance profiles (simulates different creative quality)
VARIANT_PROFILES = {
    "var1": {"ctr": 0.05, "cvr": 0.02},  # Poor performer
    "var2": {"ctr": 0.12, "cvr": 0.08},  # Best performer
    "var3": {"ctr": 0.08, "cvr": 0.04},  # Medium performer
}


class TrafficSimulator:
    def __init__(self, num_visitors: int = 100):
        self.num_visitors = num_visitors
        self.results = {
            "impressions": 0,
            "clicks": 0,
            "conversions": 0,
            "by_variant": {}
        }

    def simulate_user_behavior(self, variant_id: str) -> Dict[str, bool]:
        """Simulate a single user's behavior based on variant quality"""
        profile = VARIANT_PROFILES.get(variant_id, {"ctr": 0.05, "cvr": 0.02})

        clicked = random.random() < profile["ctr"]
        converted = clicked and (random.random() < profile["cvr"])

        return {"clicked": clicked, "converted": converted}

    async def simulate_visitor(self, visitor_num: int):
        """Simulate a single visitor"""
        async with httpx.AsyncClient() as client:
            try:
                # 1. Get variant from bandit
                select_response = await client.post(
                    f"{BANDIT_URL}/select",
                    json={
                        "campaignId": CAMPAIGN_ID,
                        "segment": SEGMENT,
                        "arms": list(VARIANT_PROFILES.keys())
                    },
                    timeout=5.0
                )

                if select_response.status_code != 200:
                    print(f"  ❌ Visitor {visitor_num}: Bandit selection failed")
                    return

                variant_data = select_response.json()
                variant_id = variant_data.get("variantId")

                # Track impression
                self.results["impressions"] += 1
                if variant_id not in self.results["by_variant"]:
                    self.results["by_variant"][variant_id] = {
                        "impressions": 0,
                        "clicks": 0,
                        "conversions": 0
                    }
                self.results["by_variant"][variant_id]["impressions"] += 1

                # 2. Simulate user behavior
                behavior = self.simulate_user_behavior(variant_id)

                # 3. Send reward to bandit
                if behavior["converted"]:
                    reward = 1.0
                    self.results["conversions"] += 1
                    self.results["by_variant"][variant_id]["conversions"] += 1
                    outcome = "✅ CONVERSION"
                elif behavior["clicked"]:
                    reward = 0.3
                    self.results["clicks"] += 1
                    self.results["by_variant"][variant_id]["clicks"] += 1
                    outcome = "👆 Click"
                else:
                    reward = 0.0
                    outcome = "👁️  View"

                # Send reward
                await client.post(
                    f"{BANDIT_URL}/reward",
                    json={
                        "campaignId": CAMPAIGN_ID,
                        "segment": SEGMENT,
                        "variantId": variant_id,
                        "reward": reward
                    },
                    timeout=5.0
                )

                print(f"  Visitor {visitor_num:3d}: {variant_id} → {outcome}")

            except Exception as e:
                print(f"  ❌ Visitor {visitor_num}: Error - {e}")

    async def run(self):
        """Run the traffic simulation"""
        print(f"\n🚀 Starting Traffic Simulation")
        print(f"   Simulating {self.num_visitors} visitors...")
        print(f"   Variant Profiles:")
        for var, profile in VARIANT_PROFILES.items():
            print(f"     {var}: CTR={profile['ctr']:.1%}, CVR={profile['cvr']:.1%}")
        print()

        # Run visitors in batches for visual effect
        batch_size = 5
        for i in range(0, self.num_visitors, batch_size):
            batch = [
                self.simulate_visitor(i + j + 1)
                for j in range(min(batch_size, self.num_visitors - i))
            ]
            await asyncio.gather(*batch)
            await asyncio.sleep(0.5)  # Small delay between batches

        # Print summary
        self.print_summary()

    def print_summary(self):
        """Print simulation results"""
        print("\n" + "="*60)
        print("📊 SIMULATION COMPLETE")
        print("="*60)

        print(f"\n📈 Overall Metrics:")
        print(f"   Total Impressions: {self.results['impressions']}")
        print(f"   Total Clicks:      {self.results['clicks']}")
        print(f"   Total Conversions: {self.results['conversions']}")

        if self.results['impressions'] > 0:
            overall_ctr = self.results['clicks'] / self.results['impressions']
            print(f"   Overall CTR:       {overall_ctr:.2%}")

        if self.results['clicks'] > 0:
            overall_cvr = self.results['conversions'] / self.results['clicks']
            print(f"   Overall CVR:       {overall_cvr:.2%}")

        print(f"\n🎯 Performance by Variant:")
        for variant_id, stats in sorted(self.results['by_variant'].items()):
            imp = stats['impressions']
            clicks = stats['clicks']
            conv = stats['conversions']

            ctr = (clicks / imp * 100) if imp > 0 else 0
            cvr = (conv / clicks * 100) if clicks > 0 else 0

            profile = VARIANT_PROFILES.get(variant_id, {})
            expected_ctr = profile.get('ctr', 0) * 100
            expected_cvr = profile.get('cvr', 0) * 100

            print(f"\n   {variant_id}:")
            print(f"     Impressions: {imp:3d}")
            print(f"     Clicks:      {clicks:3d}  (CTR: {ctr:5.1f}% | Expected: {expected_ctr:.1f}%)")
            print(f"     Conversions: {conv:3d}  (CVR: {cvr:5.1f}% | Expected: {expected_cvr:.1f}%)")

        print("\n💡 The bandit should learn to favor var2 (best performer)!")
        print("="*60)
        print()


async def main():
    """Main entry point"""
    print("\n" + "="*60)
    print("🎯 Ad-Astra Demo Traffic Simulator")
    print("="*60)

    # Check if bandit service is running
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{BANDIT_URL}/health", timeout=2.0)
            if response.status_code != 200:
                print("❌ Bandit service not responding. Start it with:")
                print("   cd services/bandit && python3 app.py")
                return
            print("✅ Bandit service is running\n")
    except Exception:
        print("❌ Cannot connect to bandit service. Start it with:")
        print("   cd services/bandit && python3 app.py")
        return

    # Run simulation
    simulator = TrafficSimulator(num_visitors=50)
    await simulator.run()


if __name__ == "__main__":
    asyncio.run(main())
