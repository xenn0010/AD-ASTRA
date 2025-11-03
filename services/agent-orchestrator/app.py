"""
Ad-Astra Agent Orchestrator Service
Powered by CrewAI and OpenAI GPT-4
Handles agent creation, coordination, and LLM interactions
"""

from __future__ import annotations

import asyncio
import copy
import logging
import os
import random
from collections import defaultdict
from typing import Any, Dict, List, Optional

import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from openai import AsyncOpenAI
from dotenv import load_dotenv

# CrewAI imports
from crewai import Agent, Crew, Task, Process

# Load environment variables from project root
import pathlib
project_root = pathlib.Path(__file__).parent.parent.parent
load_dotenv(project_root / ".env")

logger = logging.getLogger("agent_orchestrator")
logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))

# Initialize OpenAI client
openai_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Initialize Google API key for Nano Banana
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# FastAPI app
app = FastAPI(title="Ad-Astra Agent Orchestrator", version="0.2.0")

# In-memory storage for demo (replace with Convex in production)
CAMPAIGNS_STORE: Dict[str, Dict[str, Any]] = {}
VARIANTS_STORE: Dict[str, List[Dict[str, Any]]] = {}


# ============================================
# Pydantic Models
# ============================================

class PersonalityConfig(BaseModel):
    tone: str  # friendly, professional, enthusiastic, etc.
    style: str  # consultative, direct, storytelling, etc.
    traits: List[str]  # empathetic, data-driven, creative, etc.


class StrategyConfig(BaseModel):
    objective: str  # maximize_conversions, build_trust, educate, etc.
    tactics: List[str]  # social_proof, urgency, value_focused, etc.
    adaptationRate: float = Field(ge=0, le=1)


class LLMConfig(BaseModel):
    model: str = "gpt-4-turbo-preview"
    systemPrompt: str
    temperature: float = Field(ge=0, le=2, default=0.7)
    maxTokens: int = Field(ge=100, le=4000, default=2000)


class EvolutionConfig(BaseModel):
    generation: int = 0
    parentIds: List[str] = []
    mutationRate: float = Field(ge=0, le=1, default=0.15)
    fitnessScore: float = 0.0


class AgentConfigModel(BaseModel):
    personality: PersonalityConfig
    strategy: StrategyConfig
    llmConfig: LLMConfig
    evolution: EvolutionConfig


class CampaignAsset(BaseModel):
    assetType: str  # image, video, text, pdf
    fileName: str
    fileUrl: str
    description: Optional[str] = None
    tags: List[str] = []


class CreateAgentRequest(BaseModel):
    campaignId: str
    agentType: str  # landing_page, social_media, placement, visual, ai_context
    segment: str  # human or agent
    assets: List[CampaignAsset]
    productInfo: Dict[str, Any]
    goal: Dict[str, Any]  # type: conversions/revenue, target: number
    count: int = 10  # How many seed agents to create


class GenerateContentRequest(BaseModel):
    variantId: str
    agentConfig: AgentConfigModel
    context: Dict[str, Any]  # User behavior, page context, etc.
    contentType: str  # headline, subhead, full_page, social_post, etc.


class BreedAgentsRequest(BaseModel):
    campaignId: str
    parentIds: List[str]  # Top performing agent IDs
    targetGeneration: int
    mutationRate: float = 0.15


# ============================================
# Agent Personality and Strategy Pools
# ============================================

PERSONALITY_POOLS = {
    "tones": ["friendly", "professional", "enthusiastic", "consultative", "bold", "sophisticated", "playful"],
    "styles": ["direct_sale", "education", "storytelling", "social_proof", "urgency", "value_focused", "luxury_positioning"],
    "traits": ["empathetic", "data-driven", "creative", "authentic", "confident", "humorous", "inspiring"]
}


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


# ============================================
# Helper Functions
# ============================================

def generate_system_prompt(
    agent_type: str,
    personality: PersonalityConfig,
    strategy: StrategyConfig,
    product_info: Dict[str, Any],
    goal: Dict[str, Any]
) -> str:
    """Generate a system prompt for the agent based on its configuration."""

    goal_desc = f"{goal['type']} with target of {goal['target']}"

    base_prompt = f"""You are an AI advertising agent for {product_info.get('name', 'our product')}.

PERSONALITY:
- Tone: {personality.tone}
- Style: {personality.style}
- Key Traits: {', '.join(personality.traits)}

GOAL: {goal_desc}

STRATEGY:
- Objective: {strategy.objective}
- Tactics: {', '.join(strategy.tactics)}

PRODUCT INFO:
{format_product_info(product_info)}

"""

    # Add agent-type specific instructions
    if agent_type == "landing_page":
        base_prompt += """
YOUR ROLE: Generate compelling landing page content that adapts to visitor behavior.
- Create headlines that grab attention
- Write persuasive copy that drives action
- Adapt content based on how users interact with the page
- Focus on conversion optimization
"""
    elif agent_type == "social_media":
        base_prompt += """
YOUR ROLE: Create engaging social media ad content.
- Craft attention-grabbing hooks
- Write concise, shareable copy
- Include strong CTAs
- Optimize for platform-specific best practices
"""
    elif agent_type == "placement":
        base_prompt += """
YOUR ROLE: Decide optimal ad placement timing and targeting.
- Analyze user context (time, location, device, behavior)
- Recommend when and where to show ads
- Maximize ROI through smart placement
"""
    elif agent_type == "visual":
        base_prompt += """
YOUR ROLE: Generate specifications for visual content.
- Describe compelling image/video concepts
- Specify visual elements that align with brand
- Optimize for emotional impact
"""
    elif agent_type == "ai_context":
        base_prompt += """
YOUR ROLE: Optimize structured data for AI agents and scrapers.
- Create semantic, machine-readable content
- Structure data for AI decision-making
- Highlight key differentiators for AI comparison
"""

    base_prompt += "\nALWAYS stay in character and apply your tactics strategically."

    return base_prompt


def format_product_info(product_info: Dict[str, Any]) -> str:
    """Format product information for prompt."""
    lines = []
    for key, value in product_info.items():
        if isinstance(value, list):
            lines.append(f"- {key}: {', '.join(str(v) for v in value)}")
        else:
            lines.append(f"- {key}: {value}")
    return '\n'.join(lines)


def random_personality() -> PersonalityConfig:
    """Generate a random personality configuration."""
    return PersonalityConfig(
        tone=random.choice(PERSONALITY_POOLS["tones"]),
        style=random.choice(PERSONALITY_POOLS["styles"]),
        traits=random.sample(PERSONALITY_POOLS["traits"], k=random.randint(2, 4))
    )


def random_strategy(goal: Dict[str, Any]) -> StrategyConfig:
    """Generate a random strategy configuration."""
    objectives = ["maximize_conversions", "build_trust", "educate", "create_urgency", "showcase_value"]
    tactics_pool = ["social_proof", "urgency", "value_focused", "storytelling", "data_driven", "emotional_appeal"]

    return StrategyConfig(
        objective=random.choice(objectives),
        tactics=random.sample(tactics_pool, k=random.randint(2, 4)),
        adaptationRate=random.uniform(0.2, 0.5)
    )


def mutate_personality(parent: PersonalityConfig, mutation_rate: float) -> PersonalityConfig:
    """Mutate a personality with given mutation rate."""
    new_personality = PersonalityConfig(
        tone=parent.tone,
        style=parent.style,
        traits=parent.traits.copy()
    )

    if random.random() < mutation_rate:
        new_personality.tone = random.choice(PERSONALITY_POOLS["tones"])

    if random.random() < mutation_rate:
        new_personality.style = random.choice(PERSONALITY_POOLS["styles"])

    if random.random() < mutation_rate:
        # Mutate one trait
        idx = random.randint(0, len(new_personality.traits) - 1)
        new_personality.traits[idx] = random.choice(PERSONALITY_POOLS["traits"])

    return new_personality


def mutate_strategy(parent: StrategyConfig, mutation_rate: float) -> StrategyConfig:
    """Mutate a strategy with given mutation rate."""
    objectives = ["maximize_conversions", "build_trust", "educate", "create_urgency", "showcase_value"]
    tactics_pool = ["social_proof", "urgency", "value_focused", "storytelling", "data_driven", "emotional_appeal"]

    new_strategy = StrategyConfig(
        objective=parent.objective,
        tactics=parent.tactics.copy(),
        adaptationRate=parent.adaptationRate
    )

    if random.random() < mutation_rate:
        new_strategy.objective = random.choice(objectives)

    if random.random() < mutation_rate:
        # Mutate one tactic
        idx = random.randint(0, len(new_strategy.tactics) - 1)
        new_strategy.tactics[idx] = random.choice(tactics_pool)

    if random.random() < mutation_rate:
        # Mutate adaptation rate
        new_strategy.adaptationRate = random.uniform(0.2, 0.5)

    return new_strategy


def combine_personality(parent1: PersonalityConfig, parent2: PersonalityConfig) -> PersonalityConfig:
    """Blend two parent personalities."""
    trait_pool = list(dict.fromkeys(parent1.traits + parent2.traits))
    if not trait_pool:
        trait_pool = PERSONALITY_POOLS["traits"]
    max_traits = min(len(trait_pool), 4)
    trait_count = max(2, min(max_traits, random.randint(2, 4)))
    traits = random.sample(trait_pool, k=trait_count)

    return PersonalityConfig(
        tone=random.choice([parent1.tone, parent2.tone]),
        style=random.choice([parent1.style, parent2.style]),
        traits=traits,
    )


def combine_strategy(parent1: StrategyConfig, parent2: StrategyConfig) -> StrategyConfig:
    """Blend two parent strategies."""
    tactics_pool = list(dict.fromkeys(parent1.tactics + parent2.tactics))
    if not tactics_pool:
        tactics_pool = ["social_proof", "urgency", "value_focused", "storytelling", "data_driven", "emotional_appeal"]
    max_tactics = min(len(tactics_pool), 4)
    tactic_count = max(2, min(max_tactics, random.randint(2, 4)))

    return StrategyConfig(
        objective=random.choice([parent1.objective, parent2.objective]),
        tactics=random.sample(tactics_pool, k=tactic_count),
        adaptationRate=(parent1.adaptationRate + parent2.adaptationRate) / 2,
    )


def extract_product_info(variant: Dict[str, Any]) -> Dict[str, Any]:
    """Derive product info from existing variant payload."""
    payload = variant.get("payload", {}) or {}
    human = payload.get("human") or {}
    name = human.get("headline") or variant.get("name") or "Campaign Offer"
    description = human.get("subhead") or ""
    features = human.get("bullets") or []
    return {
        "name": name,
        "description": description,
        "features": features,
    }


def build_offspring_payload(
    parent_variant: Dict[str, Any],
    generation: int,
    product_name: str,
) -> Dict[str, Any]:
    """Create a payload for the offspring variant."""
    payload = copy.deepcopy(parent_variant.get("payload", {}) or {})
    human = payload.get("human")
    if human is not None:
        headline = human.get("headline") or product_name
        human["headline"] = f"{headline} · Gen{generation}"
        human.setdefault("cta", {"label": "Learn More", "url": os.getenv("DEFAULT_CTA_URL", "https://example.com")})
    agent_payload = payload.get("agent")
    if agent_payload is not None:
        jsonld = agent_payload.get("jsonld")
        if isinstance(jsonld, dict):
            jsonld["name"] = f"{product_name} Gen{generation}"
    return payload


def normalize_variant_id(raw_id: Any) -> str:
    """Best-effort conversion of Convex IDs to plain string identifiers."""
    if isinstance(raw_id, str):
        return raw_id
    if isinstance(raw_id, dict):
        for key in ("id", "_id", "$id"):
            if key in raw_id and isinstance(raw_id[key], str):
                return raw_id[key]
    return str(raw_id)


async def call_convex_mutation(endpoint: str, data: Dict[str, Any]) -> Any:
    """Call Convex mutation endpoint."""
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


async def call_convex_query(endpoint: str, params: Dict[str, Any]) -> Any:
    """Call Convex query endpoint."""
    convex_base = os.getenv("CONVEX_HTTP_BASE")
    if not convex_base:
        raise HTTPException(status_code=500, detail="CONVEX_HTTP_BASE not configured")

    response = await _request_with_retry(
        "GET",
        f"{convex_base}/{endpoint}",
        params=params,
    )
    return response.json()


# ============================================
# API Endpoints
# ============================================

@app.post("/create-agents")
async def create_agents(req: CreateAgentRequest) -> Dict[str, Any]:
    """
    Create seed agents for a campaign.
    Generates multiple agents with diverse personalities and strategies.
    """
    created_agents = []

    for i in range(req.count):
        # Generate random personality and strategy
        personality = random_personality()
        strategy = random_strategy(req.goal)

        # Generate system prompt
        system_prompt = generate_system_prompt(
            agent_type=req.agentType,
            personality=personality,
            strategy=strategy,
            product_info=req.productInfo,
            goal=req.goal
        )

        # Create LLM config
        llm_config = LLMConfig(
            model=os.getenv("OPENAI_MODEL", "gpt-4-turbo-preview"),
            systemPrompt=system_prompt,
            temperature=random.uniform(0.6, 0.9),
            maxTokens=int(os.getenv("OPENAI_MAX_TOKENS", "2000"))
        )

        # Create evolution config (generation 0 = seed)
        evolution = EvolutionConfig(
            generation=0,
            parentIds=[],
            mutationRate=float(os.getenv("MUTATION_RATE", "0.15")),
            fitnessScore=0.0
        )

        # Build agent config
        agent_config = AgentConfigModel(
            personality=personality,
            strategy=strategy,
            llmConfig=llm_config,
            evolution=evolution
        )

        # Create initial payload (will be enhanced by LLM)
        payload = {}
        if req.segment == "human":
            payload["human"] = {
                "headline": f"{req.productInfo.get('name', 'Product')} - Variant {i+1}",
                "subhead": "Loading optimized content...",
                "bullets": [],
                "cta": {"label": "Learn More", "url": os.getenv("DEFAULT_CTA_URL", "https://example.com")}
            }
        else:
            payload["agent"] = {
                "jsonld": {
                    "@context": "https://schema.org",
                    "@type": "Offer",
                    "name": req.productInfo.get('name', 'Product'),
                }
            }

        # Create variant in Convex
        variant_data = {
            "campaignId": req.campaignId,
            "segment": req.segment,
            "agentType": req.agentType,
            "payload": payload,
            "agentConfig": agent_config.model_dump(),
            "name": f"{req.agentType.title()} Agent Gen0-{i+1}",
            "active": True
        }

        result = await call_convex_mutation("createVariant", variant_data)
        created_agents.append(result)

    return {
        "campaignId": req.campaignId,
        "agentType": req.agentType,
        "count": len(created_agents),
        "agents": created_agents
    }


@app.post("/generate-content")
async def generate_content(req: GenerateContentRequest) -> Dict[str, Any]:
    """
    Generate content using an agent's LLM configuration.
    This is called dynamically when a user interacts with an ad.
    """
    config = req.agentConfig

    # Build prompt based on content type and context
    user_prompt = f"""Generate {req.contentType} based on the following context:

Context: {req.context}

Requirements:
- Stay true to your personality and strategy
- Make it compelling and conversion-focused
- Adapt to the user's behavior shown in context
- Keep it concise and impactful
"""

    try:
        # Call OpenAI API
        response = await openai_client.chat.completions.create(
            model=config.llmConfig.model,
            messages=[
                {"role": "system", "content": config.llmConfig.systemPrompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=config.llmConfig.temperature,
            max_tokens=config.llmConfig.maxTokens
        )

        generated_content = response.choices[0].message.content

        return {
            "variantId": req.variantId,
            "contentType": req.contentType,
            "content": generated_content,
            "usage": {
                "promptTokens": response.usage.prompt_tokens,
                "completionTokens": response.usage.completion_tokens,
                "totalTokens": response.usage.total_tokens
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Content generation failed: {str(e)}")


@app.post("/breed-agents")
async def breed_agents(req: BreedAgentsRequest) -> Dict[str, Any]:
    """
    Breed new generation of agents from top performers.
    Uses genetic algorithm to combine successful traits.
    """
    if len(req.parentIds) < 2:
        raise HTTPException(status_code=400, detail="At least two parents are required for breeding")

    try:
        parent_variants = []
        for parent_id in req.parentIds:
            variant = await call_convex_query("queries:getVariantById", {"id": parent_id})
            if not variant or not variant.get("agentConfig"):
                raise HTTPException(status_code=404, detail=f"Variant {parent_id} missing agent configuration")
            parent_variants.append(variant)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to fetch parent variants: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to load parent variants")

    if len(parent_variants) < 2:
        raise HTTPException(status_code=400, detail="Not enough valid parent variants found")

    try:
        campaign_stats = await call_convex_query("queries:getCampaignStats", {"campaignId": req.campaignId})
        campaign = (campaign_stats or {}).get("campaign")
    except Exception as exc:
        logger.warning("Unable to fetch campaign stats for %s: %s", req.campaignId, exc)
        campaign = None

    goal = (campaign or {}).get("goal") or {"type": "conversions", "target": 1}

    generation = req.targetGeneration
    grouped_parents: Dict[tuple[str, str], List[Dict[str, Any]]] = defaultdict(list)
    for variant in parent_variants:
        grouped_parents[(variant["agentType"], variant["segment"])].append(variant)

    children: List[Dict[str, Any]] = []

    child_counter = 0

    for (agent_type, segment), variants in grouped_parents.items():
        if len(variants) < 2:
            continue

        group_children = max(1, len(variants) // 2)

        for _ in range(group_children):
            parent1_variant, parent2_variant = random.sample(variants, 2)
            child_counter += 1

            parent1_cfg = AgentConfigModel(**parent1_variant["agentConfig"])
            parent2_cfg = AgentConfigModel(**parent2_variant["agentConfig"])

            personality = combine_personality(parent1_cfg.personality, parent2_cfg.personality)
            personality = mutate_personality(personality, req.mutationRate)

            strategy = combine_strategy(parent1_cfg.strategy, parent2_cfg.strategy)
            strategy = mutate_strategy(strategy, req.mutationRate)

            product_info_1 = extract_product_info(parent1_variant)
            product_info_2 = extract_product_info(parent2_variant)
            product_info = {
                "name": product_info_1["name"] or product_info_2["name"],
                "description": product_info_1["description"] or product_info_2["description"],
                "features": list(dict.fromkeys((product_info_1.get("features") or []) + (product_info_2.get("features") or []))),
            }

            system_prompt = generate_system_prompt(
                agent_type=agent_type,
                personality=personality,
                strategy=strategy,
                product_info=product_info,
                goal=goal,
            )

            avg_temperature = (parent1_cfg.llmConfig.temperature + parent2_cfg.llmConfig.temperature) / 2
            max_tokens = min(parent1_cfg.llmConfig.maxTokens, parent2_cfg.llmConfig.maxTokens)

            llm_config = LLMConfig(
                model=parent1_cfg.llmConfig.model,
                systemPrompt=system_prompt,
                temperature=max(0.1, min(1.5, avg_temperature + random.uniform(-0.1, 0.1))),
                maxTokens=max_tokens,
            )

            evolution_config = EvolutionConfig(
                generation=generation,
                parentIds=[
                    normalize_variant_id(parent1_variant["_id"]),
                    normalize_variant_id(parent2_variant["_id"]),
                ],
                mutationRate=req.mutationRate,
                fitnessScore=0.0,
            )

            offspring_config = AgentConfigModel(
                personality=personality,
                strategy=strategy,
                llmConfig=llm_config,
                evolution=evolution_config,
            )

            payload = build_offspring_payload(parent1_variant, generation, product_info["name"])

            try:
                child_id = await call_convex_mutation("createVariant", {
                    "campaignId": req.campaignId,
                    "segment": segment,
                    "agentType": agent_type,
                    "payload": payload,
                    "agentConfig": offspring_config.model_dump(),
                    "name": f"{agent_type.title()} Agent Gen{generation}-{child_counter}",
                    "active": True,
                })
            except Exception as exc:
                logger.exception("Failed to create offspring variant: %s", exc)
                raise HTTPException(status_code=500, detail="Failed to persist offspring variant")

            children.append({
                "variantId": normalize_variant_id(child_id),
                "agentType": agent_type,
                "segment": segment,
                "generation": generation,
                "parentIds": [
                    normalize_variant_id(parent1_variant["_id"]),
                    normalize_variant_id(parent2_variant["_id"]),
                ],
            })

    if not children:
        raise HTTPException(status_code=400, detail="No compatible parent pairs available for breeding")

    return {
        "campaignId": req.campaignId,
        "generation": generation,
        "bred": len(children),
        "agents": children,
    }


# ============================================
# Campaign Management Endpoints
# ============================================

class CreateCampaignRequest(BaseModel):
    name: str
    goal: Dict[str, Any]  # type: conversions/revenue, target: number
    segments: List[str]  # ["human", "agent"]
    description: Optional[str] = None


class AgentStatus(BaseModel):
    id: str
    campaignId: str
    type: str  # "creative", "optimizer", "analyst"
    status: str  # "initializing", "generating", "testing", "optimizing", "active", "error"
    progress: int
    createdAt: int
    tasksCompleted: int
    performance: int


class Creative(BaseModel):
    id: str
    type: str  # "image" | "video"
    url: str
    thumbnail: Optional[str] = None
    title: str
    variant: str
    status: str  # "generating" | "ready" | "deployed"
    performance: Optional[Dict[str, Any]] = None
    generatedBy: str
    createdAt: int
    segment: str  # "human" | "agent"


@app.post("/campaigns")
async def create_campaign(req: CreateCampaignRequest) -> Dict[str, Any]:
    """Create a new campaign."""
    import time
    import uuid

    # Generate campaign ID
    campaign_id = f"camp_{uuid.uuid4().hex[:12]}"

    # Create campaign object
    campaign = {
        "id": campaign_id,
        "name": req.name,
        "goal": req.goal,
        "status": "draft",
        "conversions": 0,
        "spend": 0.0,
        "segments": req.segments,
        "description": req.description or "",
        "createdAt": int(time.time() * 1000),
        "agentsActive": 0
    }

    # Store in memory
    CAMPAIGNS_STORE[campaign_id] = campaign
    VARIANTS_STORE[campaign_id] = []

    logger.info(f"Created campaign: {campaign_id} - {req.name}")
    return campaign


@app.get("/campaigns")
async def list_campaigns() -> List[Dict[str, Any]]:
    """List all campaigns."""
    return list(CAMPAIGNS_STORE.values())


@app.post("/campaigns/{campaign_id}/deploy")
async def deploy_campaign(campaign_id: str) -> Dict[str, Any]:
    """Deploy a campaign by creating initial agent variants."""
    # Get campaign from in-memory store
    campaign = CAMPAIGNS_STORE.get(campaign_id)

    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    # Default product info
    product_info = {
        "name": campaign.get("name", "Product"),
        "description": campaign.get("description", "Amazing product"),
        "features": ["High quality", "Great value", "Fast delivery"]
    }

    # Create 3 variants with different personalities
    import uuid
    variants_created = []

    for i, segment in enumerate(campaign.get("segments", ["human"])):
        for j in range(3):  # 3 variants per segment
            variant_id = f"var_{uuid.uuid4().hex[:8]}"
            variant = {
                "id": variant_id,
                "campaignId": campaign_id,
                "segment": segment,
                "agentType": "landing_page",
                "name": f"{segment.title()} Variant {j+1}",
                "impressions": 0,
                "clicks": 0,
                "conversions": 0,
                "ctr": 0.0,
                "cvr": 0.0
            }
            VARIANTS_STORE[campaign_id].append(variant)
            variants_created.append(variant)

    # Update campaign status
    campaign["status"] = "running"
    campaign["agentsActive"] = len(variants_created)

    logger.info(f"Deployed campaign {campaign_id} with {len(variants_created)} variants")

    return {
        "success": True,
        "message": f"Deployed campaign with {len(variants_created)} agents",
        "agentsCreated": len(variants_created)
    }


@app.post("/campaigns/{campaign_id}/pause")
async def pause_campaign(campaign_id: str) -> Dict[str, bool]:
    """Pause a campaign."""
    # In production, this would update campaign status in Convex
    return {"success": True}


@app.post("/campaigns/{campaign_id}/resume")
async def resume_campaign(campaign_id: str) -> Dict[str, bool]:
    """Resume a paused campaign."""
    # In production, this would update campaign status in Convex
    return {"success": True}


@app.get("/campaigns/{campaign_id}/metrics")
async def get_campaign_metrics(campaign_id: str) -> Dict[str, Any]:
    """Get metrics for a campaign."""
    try:
        stats = await call_convex_query("queries:getCampaignStats", {"campaignId": campaign_id})

        if not stats:
            return {
                "impressions": 0,
                "clicks": 0,
                "conversions": 0,
                "spend": 0.0,
                "ctr": 0.0,
                "cpc": 0.0,
                "conversionRate": 0.0
            }

        return {
            "impressions": stats.get("totalImpressions", 0),
            "clicks": stats.get("totalClicks", 0),
            "conversions": stats.get("totalConversions", 0),
            "spend": stats.get("totalRevenue", 0.0) * 0.3,  # Estimate spend as 30% of revenue
            "ctr": stats.get("overallCTR", 0.0) * 100,
            "cpc": 0.17,  # Mock CPC
            "conversionRate": stats.get("overallCVR", 0.0) * 100
        }
    except Exception as e:
        logger.exception("Failed to get campaign metrics: %s", e)
        return {
            "impressions": 0,
            "clicks": 0,
            "conversions": 0,
            "spend": 0.0,
            "ctr": 0.0,
            "cpc": 0.0,
            "conversionRate": 0.0
        }


# ============================================
# Agent Management Endpoints
# ============================================

@app.get("/agents")
async def list_agents(campaignId: Optional[str] = None) -> List[Dict[str, Any]]:
    """List all agents or agents for a specific campaign."""
    # Mock agent data for now
    if not campaignId:
        return []

    # Return mock agents
    return [
        {
            "id": f"agent_{i}",
            "campaignId": campaignId,
            "type": ["creative", "optimizer", "analyst"][i % 3],
            "status": ["active", "generating", "optimizing"][i % 3],
            "progress": [100, 65, 82][i % 3],
            "createdAt": int(__import__('time').time() * 1000) - (i * 10000),
            "tasksCompleted": [24, 15, 19][i % 3],
            "performance": [94, 87, 91][i % 3]
        }
        for i in range(3)
    ]


@app.post("/agents")
async def create_agent_endpoint(campaignId: str, type: str) -> Dict[str, Any]:
    """Create a new agent for a campaign."""
    # Mock response
    import time
    return {
        "id": f"agent_{int(time.time())}",
        "campaignId": campaignId,
        "type": type,
        "status": "initializing",
        "progress": 0,
        "createdAt": int(time.time() * 1000),
        "tasksCompleted": 0,
        "performance": 0
    }


@app.post("/agents/{agent_id}/stop")
async def stop_agent(agent_id: str) -> Dict[str, bool]:
    """Stop a running agent."""
    return {"success": True}


# ============================================
# Creative Management Endpoints
# ============================================

@app.get("/creatives")
async def list_creatives(campaignId: Optional[str] = None) -> List[Dict[str, Any]]:
    """List all creatives or creatives for a specific campaign."""
    # Mock creative data
    if not campaignId:
        return []

    import time
    return [
        {
            "id": f"creative_{i}",
            "type": "image" if i % 2 == 0 else "video",
            "url": f"https://picsum.photos/seed/{i}/400/300",
            "thumbnail": f"https://picsum.photos/seed/{i}/200/150",
            "title": f"Creative Variant {i+1}",
            "variant": f"Gen 0 - Variant {i+1}",
            "status": ["ready", "deployed", "generating"][i % 3],
            "performance": {
                "views": 1200 + (i * 300),
                "clicks": 85 + (i * 15),
                "ctr": 7.1 + (i * 0.5)
            } if i % 3 != 2 else None,
            "generatedBy": f"Agent {i % 3 + 1}",
            "createdAt": int(time.time() * 1000) - (i * 20000),
            "segment": "human" if i % 2 == 0 else "agent"
        }
        for i in range(6)
    ]


async def generate_image_with_nano_banana(prompt: str, aspect_ratio: str = "16:9") -> Dict[str, str]:
    """Generate image using Google Nano Banana (Gemini 2.5 Flash Image)"""
    import base64
    import io

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key={GOOGLE_API_KEY}",
                headers={"Content-Type": "application/json"},
                json={
                    "contents": [{
                        "parts": [{"text": prompt}]
                    }],
                    "generationConfig": {
                        "responseModalities": ["IMAGE"],
                        "imageConfig": {
                            "aspectRatio": aspect_ratio
                        }
                    }
                }
            )

            if response.status_code != 200:
                logger.error(f"Nano Banana error: {response.text}")
                raise HTTPException(status_code=500, detail=f"Image generation failed: {response.text}")

            data = response.json()

            # Extract base64 image from response
            if "candidates" in data and len(data["candidates"]) > 0:
                candidate = data["candidates"][0]
                if "content" in candidate and "parts" in candidate["content"]:
                    for part in candidate["content"]["parts"]:
                        if "inlineData" in part:
                            image_b64 = part["inlineData"]["data"]
                            mime_type = part["inlineData"]["mimeType"]

                            # Return as data URL
                            return {
                                "url": f"data:{mime_type};base64,{image_b64}",
                                "mimeType": mime_type
                            }

            raise HTTPException(status_code=500, detail="No image data in response")

    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Image generation timed out")
    except Exception as e:
        logger.exception(f"Nano Banana error: {e}")
        raise HTTPException(status_code=500, detail=f"Image generation failed: {str(e)}")


@app.post("/creatives/generate")
async def generate_creative(data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate a new creative using AI (Nano Banana for images)."""
    import time
    campaign_id = data.get("campaignId")
    creative_type = data.get("type", "image")
    prompt = data.get("prompt", "")
    segment = data.get("segment", "human")
    aspect_ratio = data.get("aspectRatio", "16:9")

    creative_id = f"creative_{int(time.time())}"

    if creative_type == "image":
        try:
            # Generate real image with Nano Banana
            image_data = await generate_image_with_nano_banana(prompt, aspect_ratio)

            return {
                "id": creative_id,
                "type": "image",
                "url": image_data["url"],
                "thumbnail": image_data["url"],  # Same as full image for now
                "title": f"Nano Banana: {prompt[:50]}...",
                "variant": "AI Generated",
                "status": "ready",
                "generatedBy": "Nano Banana (Gemini 2.5 Flash Image)",
                "createdAt": int(time.time() * 1000),
                "segment": segment,
                "prompt": prompt
            }
        except Exception as e:
            logger.error(f"Failed to generate image: {e}")
            # Fall back to placeholder if generation fails
            return {
                "id": creative_id,
                "type": "image",
                "url": f"https://picsum.photos/seed/{creative_id}/800/450",
                "thumbnail": f"https://picsum.photos/seed/{creative_id}/400/225",
                "title": f"Failed: {prompt[:50]}...",
                "variant": "Fallback",
                "status": "error",
                "generatedBy": "Fallback (Nano Banana failed)",
                "createdAt": int(time.time() * 1000),
                "segment": segment,
                "error": str(e)
            }

    # Video generation (placeholder for now - would use Veo2)
    return {
        "id": creative_id,
        "type": creative_type,
        "url": f"https://picsum.photos/seed/{creative_id}/800/450",
        "thumbnail": f"https://picsum.photos/seed/{creative_id}/400/225",
        "title": f"AI Generated {creative_type.title()}",
        "variant": "AI Generated",
        "status": "generating",
        "generatedBy": "Veo2 (Coming Soon)",
        "createdAt": int(time.time() * 1000),
        "segment": segment
    }


@app.get("/creatives/{creative_id}/performance")
async def get_creative_performance(creative_id: str) -> Dict[str, Any]:
    """Get performance metrics for a creative."""
    return {
        "views": 1500,
        "clicks": 105,
        "ctr": 7.0
    }


# ============================================
# Chat Endpoint
# ============================================

@app.post("/chat")
async def chat(message: str, campaignId: Optional[str] = None) -> Dict[str, str]:
    """Chat with the campaign assistant."""
    # Simple mock response - in production, this would use OpenAI
    responses = [
        "I can help you optimize your campaign performance!",
        "Let me analyze your campaign metrics and suggest improvements.",
        "Based on current performance, I recommend increasing budget for top-performing variants.",
        "Your human segment is outperforming the AI segment by 12%. Consider allocating more budget there."
    ]

    import random
    return {
        "response": random.choice(responses)
    }


@app.get("/health")
async def health() -> Dict[str, Any]:
    """Health check endpoint."""
    return {
        "status": "ok",
        "service": "agent-orchestrator",
        "openai_configured": bool(os.getenv("OPENAI_API_KEY")),
        "convex_configured": bool(os.getenv("CONVEX_HTTP_BASE"))
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8001"))
    uvicorn.run(app, host="0.0.0.0", port=port)
