#!/usr/bin/env python3
"""
Ad-Astra API Testing Suite
Tests all configured APIs and reports readiness
"""

import os
import sys
import httpx
import asyncio
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_header(text):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{text.center(60)}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.RESET}\n")

def print_success(text):
    print(f"{Colors.GREEN}✓{Colors.RESET} {text}")

def print_error(text):
    print(f"{Colors.RED}✗{Colors.RESET} {text}")

def print_warning(text):
    print(f"{Colors.YELLOW}⚠{Colors.RESET} {text}")

def print_info(text):
    print(f"{Colors.BLUE}ℹ{Colors.RESET} {text}")

# Test results tracking
results = {
    "morphllm": False,
    "openai": False,
    "google": False,
    "crewai": False
}

async def test_morphllm():
    """Test MorphLLM API connectivity"""
    print_header("Testing MorphLLM API")

    api_key = os.getenv("MORPHLLM_API_KEY")

    if not api_key:
        print_error("MORPHLLM_API_KEY not found in .env")
        return False

    print_info(f"API Key found: {api_key[:10]}...{api_key[-10:]}")

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Try to call MorphLLM API - test with their correct endpoint
            response = await client.post(
                "https://api.morphllm.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "morph-v3-fast",
                    "messages": [{"role": "user", "content": "Test"}],
                    "max_completion_tokens": 10
                }
            )

            if response.status_code == 200:
                print_success("MorphLLM API is working!")
                print_info(f"Response time: {response.elapsed.total_seconds():.2f}s")
                return True
            elif response.status_code == 401:
                print_error("MorphLLM API key is invalid (401 Unauthorized)")
                return False
            else:
                print_warning(f"MorphLLM responded with status {response.status_code}")
                print_info(f"Response: {response.text[:200]}")
                return False

    except httpx.ConnectError:
        print_error("Cannot connect to MorphLLM API (connection error)")
        return False
    except Exception as e:
        print_error(f"MorphLLM test failed: {str(e)}")
        return False

async def test_openai():
    """Test OpenAI GPT-5 API"""
    print_header("Testing OpenAI GPT-5 API")

    api_key = os.getenv("OPENAI_API_KEY")
    model = os.getenv("OPENAI_MODEL", "gpt-5")

    if not api_key:
        print_warning("OPENAI_API_KEY not set - skipping")
        return False

    print_info(f"API Key found: {api_key[:10]}...{api_key[-10:]}")
    print_info(f"Model: {model}")

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": model,
                    "messages": [{"role": "user", "content": "Say 'API test successful' in 3 words"}],
                    "max_completion_tokens": 10
                }
            )

            if response.status_code == 200:
                data = response.json()
                message = data["choices"][0]["message"]["content"]
                print_success(f"OpenAI API is working! Response: {message}")
                return True
            elif response.status_code == 401:
                print_error("OpenAI API key is invalid (401 Unauthorized)")
                return False
            elif response.status_code == 404:
                print_error(f"Model '{model}' not found - GPT-5 may not be available yet")
                print_info("Try setting OPENAI_MODEL=gpt-4-turbo or gpt-4o")
                return False
            else:
                print_warning(f"OpenAI responded with status {response.status_code}")
                print_info(f"Response: {response.text[:200]}")
                return False

    except Exception as e:
        print_error(f"OpenAI test failed: {str(e)}")
        return False

async def test_google():
    """Test Google API (Gemini, NanoBanana, Veo2)"""
    print_header("Testing Google API (Gemini + NanoBanana + Veo2)")

    api_key = os.getenv("GOOGLE_API_KEY")

    if not api_key:
        print_warning("GOOGLE_API_KEY not set - skipping")
        return False

    print_info(f"API Key found: {api_key[:10]}...{api_key[-10:]}")

    # Test Gemini text generation
    print_info("\nTesting Gemini 2.5 Flash...")
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}",
                headers={"Content-Type": "application/json"},
                json={
                    "contents": [{
                        "parts": [{"text": "Say 'API test successful' in 3 words"}]
                    }]
                }
            )

            if response.status_code == 200:
                data = response.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                print_success(f"Gemini API is working! Response: {text.strip()}")
            elif response.status_code == 404:
                print_warning("Gemini 2.5 Flash not found, trying gemini-1.5-pro...")
                response = await client.post(
                    f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key={api_key}",
                    headers={"Content-Type": "application/json"},
                    json={
                        "contents": [{
                            "parts": [{"text": "Say 'API test successful' in 3 words"}]
                        }]
                    }
                )
                if response.status_code == 200:
                    data = response.json()
                    text = data["candidates"][0]["content"]["parts"][0]["text"]
                    print_success(f"Gemini 1.5 Pro is working! Response: {text.strip()}")
                else:
                    print_error(f"Gemini API failed: {response.status_code}")
                    return False
            else:
                print_error(f"Gemini API failed: {response.status_code}")
                print_info(f"Response: {response.text[:200]}")
                return False

        print_success("Google API (Gemini) is functional!")
        print_info("Note: NanoBanana and Veo2 use the same API key")
        return True

    except Exception as e:
        print_error(f"Google API test failed: {str(e)}")
        return False


async def test_crewai():
    """Test CrewAI installation and imports"""
    print_header("Testing CrewAI")

    try:
        import crewai
        print_success(f"CrewAI installed: version {crewai.__version__}")

        from crewai import Agent, Task, Crew
        print_success("CrewAI imports working (Agent, Task, Crew)")

        # Try to create a simple agent
        agent = Agent(
            role="Test Agent",
            goal="Test CrewAI functionality",
            backstory="A test agent for Ad-Astra",
            verbose=False,
            allow_delegation=False
        )
        print_success("CrewAI Agent creation successful!")

        return True

    except ImportError as e:
        print_error(f"CrewAI not installed: {str(e)}")
        print_info("Install with: pip install crewai")
        return False
    except Exception as e:
        print_error(f"CrewAI test failed: {str(e)}")
        return False

async def main():
    print_header("Ad-Astra API Testing Suite")
    print_info("Testing all configured APIs and dependencies...\n")

    # Run all tests
    results["morphllm"] = await test_morphllm()
    results["openai"] = await test_openai()
    results["google"] = await test_google()
    results["crewai"] = await test_crewai()

    # Final report
    print_header("Readiness Report")

    total = len(results)
    passed = sum(results.values())

    print(f"\nTests Passed: {passed}/{total}\n")

    for service, status in results.items():
        status_icon = "✓" if status else "✗"
        color = Colors.GREEN if status else Colors.RED
        print(f"  {color}{status_icon}{Colors.RESET} {service.upper().ljust(15)} - {'READY' if status else 'NOT READY'}")

    print("\n" + "="*60 + "\n")

    # Determine overall readiness
    critical_services = ["morphllm", "crewai"]
    critical_ready = all(results[s] for s in critical_services)

    if passed == total:
        print_success(f"{Colors.BOLD}🚀 ALL SYSTEMS GO! Ad-Astra is fully functional!{Colors.RESET}")
        return 0
    elif critical_ready:
        print_warning(f"{Colors.BOLD}⚠️  PARTIALLY READY - Core services working, but some APIs need configuration{Colors.RESET}")
        print_info("You can start building, but configure missing APIs for full functionality")
        return 0
    else:
        print_error(f"{Colors.BOLD}❌ NOT READY - Critical services are not configured{Colors.RESET}")
        print_info("Configure the missing services before proceeding")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
