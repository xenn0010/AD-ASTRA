#!/usr/bin/env python3
"""
Ad-Astra Integration Testing
Tests all services running together
"""

import httpx
import asyncio
import json

print("="*60)
print("Ad-Astra Integration Test Suite")
print("="*60)

async def test_services():
    results = {}

    print("\n1. Testing Service Health\n" + "-"*60)

    services = {
        "API Gateway": "http://localhost:8888/health",
        "Bandit Service": "http://localhost:8000/health",
        "Evolution Engine": "http://localhost:8002/health",
    }

    async with httpx.AsyncClient(timeout=5.0) as client:
        for name, url in services.items():
            try:
                response = await client.get(url)
                if response.status_code == 200:
                    print(f"✅ {name}: HEALTHY")
                    results[name] = "healthy"
                else:
                    print(f"❌ {name}: UNHEALTHY ({response.status_code})")
                    results[name] = "unhealthy"
            except Exception as e:
                print(f"❌ {name}: ERROR - {str(e)}")
                results[name] = "error"

    print("\n2. Testing API Gateway Status\n" + "-"*60)

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get("http://localhost:8888/status")
            status = response.json()
            print(json.dumps(status, indent=2))
            results["Gateway Status"] = "working"
    except Exception as e:
        print(f"❌ Status endpoint failed: {e}")
        results["Gateway Status"] = "error"

    print("\n3. Testing Bandit Service Directly\n" + "-"*60)

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Test bandit selection
            response = await client.post(
                "http://localhost:8000/select",
                json={
                    "campaignId": "test_campaign",
                    "segment": "human",
                    "arms": ["variant_1", "variant_2", "variant_3"]
                }
            )
            if response.status_code == 200:
                selection = response.json()
                print(f"✅ Bandit selection working: {selection}")
                results["Bandit Selection"] = "working"
            else:
                print(f"❌ Bandit selection failed: {response.status_code}")
                results["Bandit Selection"] = "failed"
    except Exception as e:
        print(f"❌ Bandit test failed: {e}")
        results["Bandit Selection"] = "error"

    print("\n4. Testing Bandit Reward Update\n" + "-"*60)

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                "http://localhost:8000/reward",
                json={
                    "campaignId": "test_campaign",
                    "segment": "human",
                    "variantId": "variant_1",
                    "reward": 1.0
                }
            )
            if response.status_code == 200:
                reward_result = response.json()
                print(f"✅ Bandit reward working: {reward_result}")
                results["Bandit Reward"] = "working"
            else:
                print(f"❌ Bandit reward failed: {response.status_code}")
                results["Bandit Reward"] = "failed"
    except Exception as e:
        print(f"❌ Bandit reward test failed: {e}")
        results["Bandit Reward"] = "error"

    print("\n" + "="*60)
    print("Integration Test Results")
    print("="*60)

    total = len(results)
    passed = sum(1 for v in results.values() if v in ["healthy", "working"])

    print(f"\nTests Passed: {passed}/{total}\n")

    for test, status in results.items():
        icon = "✅" if status in ["healthy", "working"] else "❌"
        print(f"{icon} {test}: {status}")

    print("\n" + "="*60)

    if passed == total:
        print("🎉 ALL TESTS PASSED!")
        return 0
    else:
        print(f"⚠️  {total - passed} tests failed or had errors")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(test_services())
    exit(exit_code)
