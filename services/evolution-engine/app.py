"""
Ad-Astra Evolution Engine
Handles agent breeding, mutation, and natural selection
Uses genetic algorithms to evolve high-performing agents
"""

from __future__ import annotations

import asyncio
import os
import random
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple

import httpx
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from apscheduler.schedulers.asyncio import AsyncIOScheduler

app = FastAPI(title="Ad-Astra Evolution Engine", version="0.1.0")
scheduler = AsyncIOScheduler()


# ============================================
# Configuration
# ============================================

EVOLUTION_FREQUENCY_HOURS = int(os.getenv("EVOLUTION_FREQUENCY_HOURS", "48"))
BREEDING_POOL_PERCENTAGE = float(os.getenv("BREEDING_POOL_PERCENTAGE", "20"))
MUTATION_RATE = float(os.getenv("MUTATION_RATE", "0.15"))
MIN_INTERACTIONS_FOR_EVOLUTION = int(os.getenv("MIN_INTERACTIONS_FOR_EVOLUTION", "1000"))

# Fitness score weights
FITNESS_WEIGHT_CTR = float(os.getenv("FITNESS_WEIGHT_CTR", "0.3"))
FITNESS_WEIGHT_CONVERSION = float(os.getenv("FITNESS_WEIGHT_CONVERSION", "0.5"))
FITNESS_WEIGHT_REVENUE = float(os.getenv("FITNESS_WEIGHT_REVENUE", "0.2"))


# ============================================
# Pydantic Models
# ============================================

class AgentMetrics(BaseModel):
    variantId: str
    impressions: int
    clicks: int
    conversions: int
    revenue: float
    ctr: float
    cvr: float
    fitnessScore: float


class AgentConfig(BaseModel):
    personality: Dict[str, Any]
    strategy: Dict[str, Any]
    llmConfig: Dict[str, Any]
    evolution: Dict[str, Any]


class EvolveRequest(BaseModel):
    campaignId: str
    force: bool = False  # Force evolution even if min interactions not met


class FitnessCalculationRequest(BaseModel):
    variantId: str
    campaignId: str


# ============================================
# Helper Functions
# ============================================

async def _request_with_retry(
    method: str,
    url: str,
    *,
    json: Optional[Dict[str, Any]] = None,
    params: Optional[Dict[str, Any]] = None,
    headers: Optional[Dict[str, str]] = None,
    attempts: int = 3,
    timeout: float = 15.0,
) -> httpx.Response:
    last_error: Optional[Exception] = None
    for attempt in range(1, attempts + 1):
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                response = await client.request(method, url, json=json, params=params, headers=headers)
                response.raise_for_status()
                return response
        except Exception as exc:
            last_error = exc
            if attempt == attempts:
                break
            await asyncio.sleep(min(2 ** attempt, 5))
    assert last_error is not None
    raise last_error


async def call_convex_query(endpoint: str, params: Dict[str, Any]) -> Any:
    """Call Convex query endpoint with retry logic."""
    convex_base = os.getenv("CONVEX_HTTP_BASE")
    if not convex_base:
        raise HTTPException(status_code=500, detail="CONVEX_HTTP_BASE not configured")

    response = await _request_with_retry("GET", f"{convex_base}/{endpoint}", params=params)
    return response.json()


async def call_convex_mutation(endpoint: str, data: Dict[str, Any]) -> Any:
    """Call Convex mutation endpoint with retry logic."""
    convex_base = os.getenv("CONVEX_HTTP_BASE")
    if not convex_base:
        raise HTTPException(status_code=500, detail="CONVEX_HTTP_BASE not configured")

    admin_secret = os.getenv("ADMIN_SECRET")
    headers = {"x-admin-key": admin_secret} if admin_secret else {}

    response = await _request_with_retry(
        "POST",
        f"{convex_base}/admin/{endpoint}",
        json=data,
        headers=headers,
    )
    return response.json()


async def call_orchestrator(endpoint: str, data: Dict[str, Any]) -> Any:
    """Call agent orchestrator service with retry logic."""
    orchestrator_url = os.getenv("AGENT_ORCHESTRATOR_URL", "http://localhost:8001")
    response = await _request_with_retry("POST", f"{orchestrator_url}/{endpoint}", json=data)
    return response.json()


def calculate_fitness_score(metrics: AgentMetrics) -> float:
    """
    Calculate fitness score for an agent based on performance metrics.
    Higher score = better performance
    """
    # Normalize metrics
    ctr_score = min(metrics.ctr * 10, 1.0)  # Normalize CTR (assume 10% is excellent)
    cvr_score = min(metrics.cvr * 5, 1.0)   # Normalize CVR (assume 20% is excellent)
    revenue_score = min(metrics.revenue / 1000, 1.0)  # Normalize revenue

    # Weighted fitness
    fitness = (
        FITNESS_WEIGHT_CTR * ctr_score +
        FITNESS_WEIGHT_CONVERSION * cvr_score +
        FITNESS_WEIGHT_REVENUE * revenue_score
    )

    return fitness


def select_parents(agents: List[Dict[str, Any]], pool_percentage: float) -> List[Dict[str, Any]]:
    """
    Select top performing agents for breeding (elitism).
    """
    # Sort by fitness score (descending)
    sorted_agents = sorted(agents, key=lambda a: a.get("fitnessScore", 0), reverse=True)

    # Take top percentage
    pool_size = max(2, int(len(sorted_agents) * pool_percentage / 100))
    return sorted_agents[:pool_size]


def crossover(parent1: AgentConfig, parent2: AgentConfig) -> AgentConfig:
    """
    Combine two parent agents to create offspring.
    Uses single-point crossover for genetic traits.
    """
    # Randomly inherit traits from each parent
    offspring_personality = {
        "tone": random.choice([parent1.personality["tone"], parent2.personality["tone"]]),
        "style": random.choice([parent1.personality["style"], parent2.personality["style"]]),
        "traits": random.sample(
            parent1.personality["traits"] + parent2.personality["traits"],
            k=min(4, len(parent1.personality["traits"]))
        )
    }

    offspring_strategy = {
        "objective": random.choice([parent1.strategy["objective"], parent2.strategy["objective"]]),
        "tactics": random.sample(
            parent1.strategy["tactics"] + parent2.strategy["tactics"],
            k=min(4, len(parent1.strategy["tactics"]))
        ),
        "adaptationRate": (parent1.strategy["adaptationRate"] + parent2.strategy["adaptationRate"]) / 2
    }

    # LLM config mostly stays same but temperature can vary
    offspring_llm = {
        "model": parent1.llmConfig["model"],
        "systemPrompt": parent1.llmConfig["systemPrompt"],  # Will be regenerated
        "temperature": (parent1.llmConfig["temperature"] + parent2.llmConfig["temperature"]) / 2,
        "maxTokens": parent1.llmConfig["maxTokens"]
    }

    return AgentConfig(
        personality=offspring_personality,
        strategy=offspring_strategy,
        llmConfig=offspring_llm,
        evolution={
            "generation": parent1.evolution["generation"] + 1,
            "parentIds": [parent1.evolution.get("variantId"), parent2.evolution.get("variantId")],
            "mutationRate": MUTATION_RATE,
            "fitnessScore": 0.0
        }
    )


def mutate(agent: AgentConfig, mutation_rate: float) -> AgentConfig:
    """
    Apply random mutations to agent configuration.
    """
    personality_traits_pool = ["empathetic", "data-driven", "creative", "authentic", "confident", "humorous"]
    tones_pool = ["friendly", "professional", "enthusiastic", "consultative", "bold", "sophisticated"]
    styles_pool = ["direct_sale", "education", "storytelling", "social_proof", "urgency", "value_focused"]

    # Mutate personality
    if random.random() < mutation_rate:
        agent.personality["tone"] = random.choice(tones_pool)

    if random.random() < mutation_rate:
        agent.personality["style"] = random.choice(styles_pool)

    if random.random() < mutation_rate and agent.personality["traits"]:
        idx = random.randint(0, len(agent.personality["traits"]) - 1)
        agent.personality["traits"][idx] = random.choice(personality_traits_pool)

    # Mutate strategy
    tactics_pool = ["social_proof", "urgency", "value_focused", "storytelling", "data_driven", "emotional_appeal"]
    if random.random() < mutation_rate and agent.strategy["tactics"]:
        idx = random.randint(0, len(agent.strategy["tactics"]) - 1)
        agent.strategy["tactics"][idx] = random.choice(tactics_pool)

    # Mutate temperature slightly
    if random.random() < mutation_rate:
        agent.llmConfig["temperature"] = max(0.1, min(1.5, agent.llmConfig["temperature"] + random.uniform(-0.2, 0.2)))

    return agent


async def fetch_agent_metrics(campaign_id: str) -> List[AgentMetrics]:
    """
    Fetch performance metrics for all agents in a campaign.
    """
    try:
        metrics_data = await call_convex_query("queries:getCampaignMetrics", {"campaignId": campaign_id})

        metrics_list = []
        for m in metrics_data:
            metrics_list.append(AgentMetrics(
                variantId=m["variantId"],
                impressions=m.get("impressions", 0),
                clicks=m.get("clicks", 0),
                conversions=m.get("conversions", 0),
                revenue=m.get("revenue", 0.0),
                ctr=m.get("ctr", 0.0),
                cvr=m.get("cvr", 0.0),
                fitnessScore=m.get("fitnessScore", 0.0)
            ))

        return metrics_list
    except Exception as e:
        print(f"[Evolution] Error fetching metrics: {e}")
        return []


async def evolve_campaign(campaign_id: str, force: bool = False) -> Dict[str, Any]:
    """
    Main evolution logic:
    1. Fetch all agents and their metrics
    2. Calculate fitness scores
    3. Select top performers
    4. Breed new generation
    5. Apply mutations
    6. Deploy new agents
    """
    print(f"[Evolution] Starting evolution for campaign {campaign_id}")

    try:
        await call_convex_mutation("recalculateMetricsForCampaign", {"campaignId": campaign_id})
    except Exception as exc:
        print(f"[Evolution] Failed to recalculate metrics for {campaign_id}: {exc}")

    # Fetch agent metrics
    metrics = await fetch_agent_metrics(campaign_id)

    if not metrics:
        return {
            "status": "skipped",
            "reason": "No metrics found for campaign"
        }

    if not force and sum(m.impressions for m in metrics) < MIN_INTERACTIONS_FOR_EVOLUTION:
        return {
            "status": "skipped",
            "reason": f"Not enough interactions yet (min: {MIN_INTERACTIONS_FOR_EVOLUTION})"
        }

    # Calculate and update fitness scores
    agents_with_fitness = []
    for metric in metrics:
        fitness = calculate_fitness_score(metric)

        # Update fitness score in Convex
        try:
            await call_convex_mutation("mutations:updateVariantFitness", {
                "variantId": metric.variantId,
                "fitnessScore": fitness
            })
        except Exception as e:
            print(f"[Evolution] Error updating fitness for {metric.variantId}: {e}")

        agents_with_fitness.append({
            "variantId": metric.variantId,
            "fitnessScore": fitness,
            "metrics": metric.model_dump()
        })

    # Select parents (top performers)
    parents = select_parents(agents_with_fitness, BREEDING_POOL_PERCENTAGE)

    if len(parents) < 2:
        return {
            "status": "skipped",
            "reason": "Not enough agents to breed (need at least 2)"
        }

    print(f"[Evolution] Selected {len(parents)} parents for breeding")

    # Fetch parent agent configurations
    parent_variants = []
    for parent in parents:
        try:
            variant = await call_convex_query("queries:getVariantById", {"id": parent["variantId"]})
            if variant and variant.get("agentConfig"):
                parent_variants.append(variant)
        except Exception as e:
            print(f"[Evolution] Error fetching variant {parent['variantId']}: {e}")

    if len(parent_variants) < 2:
        return {
            "status": "error",
            "reason": "Could not fetch enough parent configurations"
        }

    # Breed new generation
    target_generation = max(
        v.get("agentConfig", {}).get("evolution", {}).get("generation", 0)
        for v in parent_variants
    ) + 1

    print(f"[Evolution] Breeding generation {target_generation}")

    offspring_created = []
    num_offspring = len(parent_variants)  # Create as many offspring as we have parents

    for i in range(num_offspring):
        # Select two random parents
        parent1, parent2 = random.sample(parent_variants, 2)

        parent1_config = AgentConfig(**parent1["agentConfig"])
        parent2_config = AgentConfig(**parent2["agentConfig"])

        # Crossover
        offspring_config = crossover(parent1_config, parent2_config)

        # Mutation
        offspring_config = mutate(offspring_config, MUTATION_RATE)

        # Update generation
        offspring_config.evolution["generation"] = target_generation
        offspring_config.evolution["parentIds"] = [parent1["_id"], parent2["_id"]]

        # Prepare data for orchestrator
        breeding_data = {
            "campaignId": campaign_id,
            "segment": parent1["segment"],
            "agentType": parent1["agentType"],
            "parentConfigs": [parent1_config.model_dump(), parent2_config.model_dump()],
            "offspringConfig": offspring_config.model_dump(),
            "generation": target_generation
        }

        # Call orchestrator to create the new agent
        try:
            result = await call_orchestrator("breed-agents", {
                "campaignId": campaign_id,
                "parentIds": [parent1["_id"], parent2["_id"]],
                "targetGeneration": target_generation,
                "mutationRate": MUTATION_RATE
            })
            offspring_created.append(result)

            # Record evolution history
            mutations_applied = [
                f"tone_{offspring_config.personality['tone']}" if offspring_config.personality["tone"] != parent1_config.personality["tone"] else None,
                f"style_{offspring_config.personality['style']}" if offspring_config.personality["style"] != parent1_config.personality["style"] else None,
            ]
            mutations_applied = [m for m in mutations_applied if m]  # Filter out None

            await call_convex_mutation("mutations:insertEvolutionHistory", {
                "campaignId": campaign_id,
                "generation": target_generation,
                "parentIds": [parent1["_id"], parent2["_id"]],
                "childId": result.get("childId", "unknown"),
                "mutationsApplied": mutations_applied,
                "reason": f"Automatic evolution cycle - generation {target_generation}"
            })

        except Exception as e:
            print(f"[Evolution] Error creating offspring {i}: {e}")

    avg_fitness = sum(p["fitnessScore"] for p in parents) / len(parents) if parents else 0

    return {
        "status": "completed",
        "campaignId": campaign_id,
        "generation": target_generation,
        "parentsSelected": len(parents),
        "offspringCreated": len(offspring_created),
        "averageParentFitness": avg_fitness,
        "offspring": offspring_created
    }


# ============================================
# API Endpoints
# ============================================

@app.post("/evolve")
async def trigger_evolution(req: EvolveRequest, background_tasks: BackgroundTasks) -> Dict[str, Any]:
    """
    Manually trigger evolution for a campaign.
    """
    background_tasks.add_task(evolve_campaign, req.campaignId, req.force)

    return {
        "status": "started",
        "campaignId": req.campaignId,
        "message": "Evolution process started in background"
    }


@app.post("/calculate-fitness")
async def calculate_fitness(req: FitnessCalculationRequest) -> Dict[str, Any]:
    """
    Calculate and update fitness score for a specific agent.
    """
    # TODO: Fetch metrics from Convex and calculate fitness
    # For now, return placeholder

    return {
        "variantId": req.variantId,
        "fitnessScore": 0.0,
        "message": "Fitness calculation not yet implemented"
    }


@app.get("/evolution-status/{campaign_id}")
async def get_evolution_status(campaign_id: str) -> Dict[str, Any]:
    """
    Get evolution status for a campaign.
    """
    # TODO: Fetch evolution history from Convex

    return {
        "campaignId": campaign_id,
        "currentGeneration": 0,
        "totalAgents": 0,
        "lastEvolution": None,
        "nextEvolution": None
    }


@app.get("/health")
async def health() -> Dict[str, Any]:
    """Health check endpoint."""
    return {
        "status": "ok",
        "service": "evolution-engine",
        "config": {
            "evolutionFrequencyHours": EVOLUTION_FREQUENCY_HOURS,
            "breedingPoolPercentage": BREEDING_POOL_PERCENTAGE,
            "mutationRate": MUTATION_RATE,
            "minInteractions": MIN_INTERACTIONS_FOR_EVOLUTION
        }
    }


# ============================================
# Scheduled Jobs
# ============================================

@app.on_event("startup")
async def startup_event():
    """Start the scheduler on app startup."""
    # TODO: Add scheduled evolution jobs
    # scheduler.add_job(
    #     evolve_all_active_campaigns,
    #     'interval',
    #     hours=EVOLUTION_FREQUENCY_HOURS
    # )
    # scheduler.start()
    print(f"[Evolution Engine] Started (evolution frequency: {EVOLUTION_FREQUENCY_HOURS}h)")


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8002"))
    uvicorn.run(app, host="0.0.0.0", port=port)
