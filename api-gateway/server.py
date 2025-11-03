#!/usr/bin/env python3
"""
Ad-Astra Unified API Gateway
Routes requests to appropriate microservices
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx
import os
from typing import Dict, Any, Optional
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Ad-Astra API Gateway",
    description="Unified API for AI agent advertising platform",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Service URLs from environment
SERVICES = {
    "bandit": os.getenv("BANDIT_SERVICE_URL", "http://localhost:8000"),
    "orchestrator": os.getenv("AGENT_ORCHESTRATOR_URL", "http://localhost:8001"),
    "evolution": os.getenv("EVOLUTION_SERVICE_URL", "http://localhost:8002"),
    "convex": os.getenv("CONVEX_URL", "https://your-deployment.convex.cloud"),
}

# ============================================
# Health & Status
# ============================================

@app.get("/health")
async def health():
    """Health check for API gateway"""
    return {"status": "healthy", "service": "api-gateway"}

@app.get("/status")
async def status():
    """Check status of all services"""
    statuses = {}

    async with httpx.AsyncClient(timeout=5.0) as client:
        for name, url in SERVICES.items():
            try:
                if name == "convex":
                    # Convex doesn't have /health endpoint
                    statuses[name] = {"status": "configured", "url": url}
                else:
                    response = await client.get(f"{url}/health")
                    statuses[name] = {
                        "status": "healthy" if response.status_code == 200 else "unhealthy",
                        "url": url
                    }
            except Exception as e:
                statuses[name] = {"status": "error", "error": str(e), "url": url}

    return {
        "gateway": "healthy",
        "services": statuses
    }

# ============================================
# Campaign Management
# ============================================

class CreateCampaignRequest(BaseModel):
    name: str
    description: Optional[str] = None
    goal_type: str = "conversions"  # or "revenue"
    goal_target: float = 1000
    segments: list[str] = ["human", "agent"]

@app.post("/api/campaigns")
async def create_campaign(req: CreateCampaignRequest):
    """
    Create a new campaign with AI agent swarm

    This will:
    1. Create campaign in Convex
    2. Generate 50+ agent variants via orchestrator
    3. Initialize bandit state
    """
    async with httpx.AsyncClient(timeout=60.0) as client:
        # Step 1: Create campaign in Convex
        campaign_response = await client.post(
            f"{SERVICES['convex']}/api/campaigns",
            json={
                "goal": {"type": req.goal_type, "target": req.goal_target},
                "segments": req.segments,
                "name": req.name,
                "description": req.description
            }
        )

        if campaign_response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to create campaign in Convex")

        campaign_id = campaign_response.json()["campaignId"]

        # Step 2: Generate agent swarm
        agents_response = await client.post(
            f"{SERVICES['orchestrator']}/create-agents",
            json={
                "campaignId": campaign_id,
                "count": 50,  # 10 per agent type * 5 types
                "segments": req.segments
            }
        )

        if agents_response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to create agents")

        agents = agents_response.json()

        return {
            "campaignId": campaign_id,
            "agentsCreated": len(agents.get("agents", [])),
            "status": "running",
            "message": "Campaign created with AI agent swarm"
        }

@app.get("/api/campaigns")
async def list_campaigns():
    """List all campaigns"""
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(f"{SERVICES['convex']}/api/campaigns")
        return response.json()

@app.get("/api/campaigns/{campaign_id}")
async def get_campaign(campaign_id: str):
    """Get campaign details including metrics"""
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(f"{SERVICES['convex']}/api/campaigns/{campaign_id}")
        return response.json()

# ============================================
# Traffic Assignment (Bandit)
# ============================================

class AssignVariantRequest(BaseModel):
    campaignId: str
    segment: str = "human"
    context: Optional[Dict[str, Any]] = None

@app.post("/api/assign")
async def assign_variant(req: AssignVariantRequest):
    """
    Assign a visitor to the best-performing agent variant
    Uses Thompson Sampling multi-armed bandit
    """
    async with httpx.AsyncClient(timeout=10.0) as client:
        # Get available variants for this campaign
        variants_response = await client.get(
            f"{SERVICES['convex']}/api/campaigns/{req.campaignId}/variants",
            params={"segment": req.segment, "active": True}
        )

        if variants_response.status_code != 200:
            raise HTTPException(status_code=404, detail="Campaign not found")

        variants = variants_response.json().get("variants", [])

        if not variants:
            raise HTTPException(status_code=404, detail="No active variants")

        arm_ids = [v["_id"] for v in variants]

        # Get assignment from bandit
        bandit_response = await client.post(
            f"{SERVICES['bandit']}/select",
            json={
                "campaignId": req.campaignId,
                "segment": req.segment,
                "arms": arm_ids,
                "context": req.context
            }
        )

        if bandit_response.status_code != 200:
            raise HTTPException(status_code=500, detail="Bandit selection failed")

        selection = bandit_response.json()
        variant_id = selection["variantId"]

        # Record assignment in Convex
        import time
        import uuid

        assignment_response = await client.post(
            f"{SERVICES['convex']}/api/assignments",
            json={
                "campaignId": req.campaignId,
                "segment": req.segment,
                "variantId": variant_id,
                "reqId": str(uuid.uuid4()),
                "ts": int(time.time() * 1000),
                "meta": req.context
            }
        )

        assignment_id = assignment_response.json().get("assignmentId")

        # Get variant payload
        variant = next((v for v in variants if v["_id"] == variant_id), None)

        return {
            "assignmentId": assignment_id,
            "variantId": variant_id,
            "variant": variant,
            "explore": selection.get("explore", False)
        }

# ============================================
# Event Tracking
# ============================================

class TrackEventRequest(BaseModel):
    assignmentId: str
    eventType: str  # "impression", "click", "convert"
    value: Optional[float] = None

@app.post("/api/events")
async def track_event(req: TrackEventRequest):
    """
    Track an event (impression, click, conversion)
    Updates bandit rewards automatically
    """
    async with httpx.AsyncClient(timeout=10.0) as client:
        # Get assignment details
        assignment_response = await client.get(
            f"{SERVICES['convex']}/api/assignments/{req.assignmentId}"
        )

        if assignment_response.status_code != 200:
            raise HTTPException(status_code=404, detail="Assignment not found")

        assignment = assignment_response.json()

        # Record event in Convex
        import time

        event_response = await client.post(
            f"{SERVICES['convex']}/api/events",
            json={
                "type": req.eventType,
                "campaignId": assignment["campaignId"],
                "variantId": assignment["variantId"],
                "segment": assignment["segment"],
                "assignmentId": req.assignmentId,
                "ts": int(time.time() * 1000),
                "value": req.value
            }
        )

        # Update bandit reward
        reward_value = 0.0
        if req.eventType == "click":
            reward_value = 1.0
        elif req.eventType == "convert":
            reward_value = 10.0  # Higher reward for conversions

        if reward_value > 0:
            await client.post(
                f"{SERVICES['bandit']}/reward",
                json={
                    "campaignId": assignment["campaignId"],
                    "segment": assignment["segment"],
                    "variantId": assignment["variantId"],
                    "reward": reward_value,
                    "assignmentId": req.assignmentId
                }
            )

        return {"ok": True, "eventRecorded": req.eventType}

# ============================================
# Agent Evolution
# ============================================

@app.post("/api/campaigns/{campaign_id}/evolve")
async def trigger_evolution(campaign_id: str):
    """
    Manually trigger evolution for a campaign
    Normally runs automatically every 48 hours
    """
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            f"{SERVICES['evolution']}/evolve",
            json={"campaignId": campaign_id}
        )

        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Evolution failed")

        return response.json()

@app.get("/api/campaigns/{campaign_id}/evolution-history")
async def get_evolution_history(campaign_id: str):
    """Get evolution history for a campaign"""
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(
            f"{SERVICES['convex']}/api/campaigns/{campaign_id}/evolution-history"
        )
        return response.json()

# ============================================
# Metrics & Analytics
# ============================================

@app.get("/api/campaigns/{campaign_id}/metrics")
async def get_campaign_metrics(campaign_id: str):
    """Get aggregated metrics for a campaign"""
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(
            f"{SERVICES['convex']}/api/campaigns/{campaign_id}/metrics"
        )
        return response.json()

@app.get("/api/campaigns/{campaign_id}/agents")
async def get_agent_performance(campaign_id: str, segment: Optional[str] = None):
    """Get performance metrics for all agents in a campaign"""
    async with httpx.AsyncClient(timeout=10.0) as client:
        params = {}
        if segment:
            params["segment"] = segment

        response = await client.get(
            f"{SERVICES['convex']}/api/campaigns/{campaign_id}/agent-metrics",
            params=params
        )
        return response.json()

# ============================================
# Main
# ============================================

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("API_GATEWAY_PORT", "8888"))
    uvicorn.run(app, host="0.0.0.0", port=port)
