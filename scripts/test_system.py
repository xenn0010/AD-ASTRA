#!/usr/bin/env python3
"""
Comprehensive Test Script for Ad-Astra Agent System
Tests all components end-to-end
"""

import asyncio
import os
import sys
from typing import Dict, Any

import httpx
from dotenv import load_dotenv

# Load environment
load_dotenv()

# Service URLs
CONVEX_BASE = os.getenv("CONVEX_HTTP_BASE", "http://localhost:8788")
BANDIT_URL = os.getenv("BANDIT_SERVICE_URL", "http://localhost:8000")
ORCHESTRATOR_URL = os.getenv("AGENT_ORCHESTRATOR_URL", "http://localhost:8001")
EVOLUTION_URL = os.getenv("EVOLUTION_SERVICE_URL", "http://localhost:8002")
ADMIN_SECRET = os.getenv("ADMIN_SECRET", "test-secret")


class TestRunner:
    def __init__(self):
        self.results = []
        self.campaign_id = None
        self.variant_ids = []

    def test(self, name: str):
        """Decorator for test functions"""
        def decorator(func):
            async def wrapper(*args, **kwargs):
                print(f"\n{'='*60}")
                print(f"TEST: {name}")
                print(f"{'='*60}")
                try:
                    result = await func(*args, **kwargs)
                    print(f"✅ PASSED: {name}")
                    self.results.append({"test": name, "status": "PASSED", "result": result})
                    return result
                except Exception as e:
                    print(f"❌ FAILED: {name}")
                    print(f"Error: {e}")
                    self.results.append({"test": name, "status": "FAILED", "error": str(e)})
                    raise
            return wrapper
        return decorator

    async def check_service_health(self, url: str, name: str) -> Dict[str, Any]:
        """Check if a service is healthy"""
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{url}/health")
            response.raise_for_status()
            data = response.json()
            print(f"  {name}: {data.get('status', 'unknown')}")
            return data

    @test("1. Service Health Checks")
    async def test_health_checks(self):
        """Test that all services are running"""
        print("\nChecking service health...")

        services = [
            (BANDIT_URL, "Bandit Service"),
            (ORCHESTRATOR_URL, "Agent Orchestrator"),
            (EVOLUTION_URL, "Evolution Engine"),
        ]

        for url, name in services:
            try:
                await self.check_service_health(url, name)
            except Exception as e:
                print(f"  ⚠️  {name} not responding: {e}")
                raise

        return {"all_services": "healthy"}

    @test("2. Create Campaign")
    async def test_create_campaign(self):
        """Create a test campaign"""
        print("\nCreating campaign...")

        campaign_data = {
            "name": "Test Campaign - Agent System",
            "description": "Automated test campaign",
            "goal": {
                "type": "conversions",
                "target": 100
            },
            "segments": ["human", "agent"]
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{CONVEX_BASE}/admin/createCampaign",
                json=campaign_data,
                headers={"x-admin-key": ADMIN_SECRET}
            )
            response.raise_for_status()
            result = response.json()

        self.campaign_id = result["id"]
        print(f"  Campaign ID: {self.campaign_id}")
        return result

    @test("3. Create AI Agents")
    async def test_create_agents(self):
        """Test agent creation via orchestrator"""
        print("\nCreating AI agents...")

        product_info = {
            "name": "Test Product",
            "price": "$99",
            "description": "Test product for agent system",
            "features": ["Feature 1", "Feature 2"]
        }

        request_data = {
            "campaignId": self.campaign_id,
            "agentType": "landing_page",
            "segment": "human",
            "assets": [],
            "productInfo": product_info,
            "goal": {"type": "conversions", "target": 100},
            "count": 5
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{ORCHESTRATOR_URL}/create-agents",
                json=request_data
            )
            response.raise_for_status()
            result = response.json()

        print(f"  Created {result['count']} agents")
        self.variant_ids = [agent["id"] for agent in result.get("agents", [])]
        return result

    @test("4. Bandit Agent Selection")
    async def test_bandit_selection(self):
        """Test multi-armed bandit selection"""
        if not self.variant_ids:
            print("  ⚠️  Skipping: No variant IDs available")
            return {"skipped": True}

        print("\nTesting bandit selection...")

        request_data = {
            "campaignId": self.campaign_id,
            "segment": "human",
            "arms": self.variant_ids,
            "context": {}
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                f"{BANDIT_URL}/select",
                json=request_data
            )
            response.raise_for_status()
            result = response.json()

        print(f"  Selected variant: {result.get('variantId')}")
        return result

    @test("5. Generate Dynamic Content")
    async def test_generate_content(self):
        """Test LLM content generation"""
        if not self.variant_ids:
            print("  ⚠️  Skipping: No variant IDs available")
            return {"skipped": True}

        print("\nGenerating dynamic content...")

        # This would need actual agent config - skip for now
        print("  ⚠️  Skipped: Requires fetching actual agent config")
        return {"skipped": True}

    @test("6. Simulate Events")
    async def test_simulate_events(self):
        """Simulate impression, click, conversion events"""
        if not self.variant_ids:
            print("  ⚠️  Skipping: No variant IDs available")
            return {"skipped": True}

        print("\nSimulating events...")

        # Create assignment first
        assignment_data = {
            "campaignId": self.campaign_id,
            "segment": "human",
            "reqId": "test-req-123"
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            # Assignment
            assign_response = await client.post(
                f"{CONVEX_BASE}/assign",
                json=assignment_data
            )
            assign_response.raise_for_status()
            assignment = assign_response.json()

            variant_id = assignment["variantId"]
            assignment_id = assignment["assignmentId"]

            # Impression event
            impression = await client.post(
                f"{CONVEX_BASE}/event",
                json={
                    "type": "impression",
                    "campaignId": self.campaign_id,
                    "variantId": variant_id,
                    "segment": "human",
                    "assignmentId": assignment_id
                }
            )
            impression.raise_for_status()

            # Click event
            click = await client.post(
                f"{CONVEX_BASE}/event",
                json={
                    "type": "click",
                    "campaignId": self.campaign_id,
                    "variantId": variant_id,
                    "segment": "human",
                    "assignmentId": assignment_id
                }
            )
            click.raise_for_status()

            # Conversion event
            conversion = await client.post(
                f"{CONVEX_BASE}/event",
                json={
                    "type": "convert",
                    "campaignId": self.campaign_id,
                    "variantId": variant_id,
                    "segment": "human",
                    "assignmentId": assignment_id,
                    "value": 99.0
                }
            )
            conversion.raise_for_status()

        print("  ✅ Simulated: impression, click, conversion")
        return {"events": 3}

    @test("7. Evolution Engine Status")
    async def test_evolution_status(self):
        """Check evolution engine status"""
        print("\nChecking evolution status...")

        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{EVOLUTION_URL}/evolution-status/{self.campaign_id}"
            )
            response.raise_for_status()
            result = response.json()

        print(f"  Current generation: {result.get('currentGeneration', 0)}")
        return result

    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("TEST SUMMARY")
        print("="*60)

        passed = sum(1 for r in self.results if r["status"] == "PASSED")
        failed = sum(1 for r in self.results if r["status"] == "FAILED")

        print(f"\nTotal Tests: {len(self.results)}")
        print(f"Passed: {passed} ✅")
        print(f"Failed: {failed} ❌")

        if failed > 0:
            print("\nFailed Tests:")
            for r in self.results:
                if r["status"] == "FAILED":
                    print(f"  - {r['test']}: {r['error']}")

        print("\n" + "="*60)
        return failed == 0


async def main():
    """Run all tests"""
    print("🚀 Ad-Astra Agent System Test Suite")
    print("="*60)

    runner = TestRunner()

    try:
        # Run tests in sequence
        await runner.test_health_checks()
        await runner.test_create_campaign()
        await runner.test_create_agents()
        await runner.test_bandit_selection()
        await runner.test_generate_content()
        await runner.test_simulate_events()
        await runner.test_evolution_status()

        # Print summary
        success = runner.print_summary()

        if success:
            print("\n✅ ALL TESTS PASSED")
            sys.exit(0)
        else:
            print("\n❌ SOME TESTS FAILED")
            sys.exit(1)

    except Exception as e:
        print(f"\n❌ TEST SUITE FAILED: {e}")
        runner.print_summary()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
