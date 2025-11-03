# Ad-Astra Complete Implementation Plan

## Overview
Transform Ad-Astra into a fully functional AI agent advertising platform with:
- ✅ CrewAI agent orchestration
- ✅ TypeScript/Convex backend
- 🚧 Vite React frontend
- 🚧 Multi-LLM support (OpenAI GPT-4, Google Gemini)
- 🚧 MCP integrations (Metorial, Meta Ads)
- 🚧 Creative generation (NanoBanana, Veo2)
- 🚧 **Agent learning from performance data**

---

## Architecture Validation ✅

**Is the architecture correct?**
- ✅ **YES** - CrewAI for agent orchestration is correct
- ✅ **YES** - TypeScript/Convex backend is solid
- ✅ **YES** - Separate services (bandit, orchestrator, evolution) makes sense
- ✅ **YES** - Multi-armed bandit + genetic evolution is the right approach

---

## Phase 1: Core Infrastructure (CURRENT)

### 1.1 Environment Configuration ✅
**File**: `.env.example`

**What we have**:
- ✅ OpenAI GPT-4 config
- ✅ Google Gemini config
- ✅ Metorial MCP config (corrected from Morphic)
- ✅ Meta Ads MCP config
- ✅ NanoBanana image generation
- ✅ Veo2 video generation
- ✅ Agent learning parameters
- ✅ All service URLs

**Action**: User needs to fill in actual API keys in `.env`

### 1.2 Backend Schema ✅
**Files**: `backend/convex/schema.ts`, `mutations.ts`, `queries.ts`

**What we have**:
- ✅ Extended schema with agent types
- ✅ Agent config (personality, strategy, LLM, evolution)
- ✅ Metrics tables (agent_metrics, agent_interactions, agent_memory)
- ✅ Evolution history tracking
- ✅ Mutations for creating/updating agents
- ✅ Queries for fetching metrics and stats

**Status**: COMPLETE

### 1.3 Agent Orchestrator Service ✅
**Files**: `services/agent-orchestrator/app.py`

**What we have**:
- ✅ CrewAI-based agent creation
- ✅ GPT-4 integration
- ✅ Personality/strategy generation
- ✅ System prompt creation per agent type
- ✅ Crossover and mutation functions

**What we need**:
- 🚧 Add Google Gemini support
- 🚧 Add Metorial MCP integration
- 🚧 Complete `/breed-agents` endpoint
- 🚧 Add agent learning mechanism

### 1.4 Evolution Engine ✅
**Files**: `services/evolution-engine/app.py`

**What we have**:
- ✅ Fitness scoring
- ✅ Parent selection (elitism)
- ✅ Genetic crossover
- ✅ Mutation logic
- ✅ Integration with Convex

**Status**: MOSTLY COMPLETE (needs testing)

---

## Phase 2: Frontend (PRIORITY NOW)

### 2.1 Vite React Setup 🚧
**Create**: `web/frontend/`

**Structure**:
```
web/frontend/
├── package.json
├── vite.config.ts
├── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── Dashboard.tsx
│   │   ├── CampaignList.tsx
│   │   ├── CampaignStats.tsx
│   │   ├── AgentTree.tsx
│   │   └── MetricsChart.tsx
│   ├── api/
│   │   └── convex.ts
│   └── types/
│       └── index.ts
```

**Features** (bare bones):
- Campaign list view
- Campaign stats dashboard
- Agent evolution visualization
- Simple metrics charts

**Tech Stack**:
- Vite + React + TypeScript
- TailwindCSS for styling
- Recharts for metrics
- Convex React client

---

## Phase 3: Multi-LLM Integration 🚧

### 3.1 Google Gemini Support
**File**: `services/agent-orchestrator/app.py`

**Add**:
```python
from google import generativeai as genai

# Initialize Gemini
genai.configure(api_key=os.getenv("GOOGLE_GEMINI_API_KEY"))

async def call_gemini(prompt, system_prompt):
    model = genai.GenerativeModel(
        model_name=os.getenv("GOOGLE_GEMINI_MODEL"),
        system_instruction=system_prompt
    )
    response = await model.generate_content_async(prompt)
    return response.text
```

**Update `/generate-content`** to support both OpenAI and Gemini based on `LLM_PROVIDER` env var

### 3.2 Multi-Model Strategy
- If `LLM_PROVIDER=openai`: Use GPT-4
- If `LLM_PROVIDER=gemini`: Use Gemini
- If `LLM_PROVIDER=multi`: Use both, compare results

---

## Phase 4: MCP Integrations 🚧

### 4.1 Metorial MCP Integration
**Purpose**: Fast content edits and AI research

**Create**: `integrations/mcp/metorial.py`

```python
import httpx

class MetorialMCP:
    def __init__(self, api_key, api_url):
        self.api_key = api_key
        self.api_url = api_url

    async def research_topic(self, query):
        """Use Metorial to research a topic"""
        pass

    async def optimize_content(self, content, goal):
        """Use Metorial to optimize ad content"""
        pass

    async def generate_variations(self, base_content, count=5):
        """Generate content variations quickly"""
        pass
```

**Use cases**:
- Research competitor ads
- Optimize headlines/copy
- Generate content variations for agents

### 4.2 Meta Ads MCP Integration
**Purpose**: Sync campaigns to Facebook/Instagram Ads

**Create**: `integrations/mcp/meta_ads.py`

```python
class MetaAdsMCP:
    def __init__(self, access_token, ad_account_id):
        self.access_token = access_token
        self.ad_account_id = ad_account_id
        self.graph_api = "https://graph.facebook.com/v18.0"

    async def create_campaign(self, campaign_data):
        """Create campaign on Meta"""
        pass

    async def create_ad_set(self, campaign_id, targeting):
        """Create ad set with targeting"""
        pass

    async def create_ad_creative(self, image_hash, headline, body):
        """Create ad creative"""
        pass

    async def get_insights(self, ad_id):
        """Fetch performance metrics"""
        pass
```

---

## Phase 5: Creative Generation APIs 🚧

### 5.1 NanoBanana Image Generation
**Create**: `generators/image-nanobanana/client.py`

```python
class NanoBananaClient:
    async def generate_image(self, prompt, style="photorealistic"):
        """Generate product images"""
        response = await httpx.post(
            f"{NANOBANANA_API_URL}/generate",
            json={
                "prompt": prompt,
                "model": "stable-diffusion-xl",
                "style": style
            },
            headers={"Authorization": f"Bearer {API_KEY}"}
        )
        return response.json()["image_url"]
```

**Integration**:
- Visual agents call this to generate image variations
- Store generated images in asset storage
- Track which images perform best

### 5.2 Veo2 Video Generation
**Create**: `generators/video-veo2/client.py`

```python
class Veo2Client:
    async def generate_video(self, script, duration=30):
        """Generate product videos"""
        response = await httpx.post(
            f"{VEO2_API_URL}/generate",
            json={
                "script": script,
                "duration": duration,
                "model": "veo-2-base"
            },
            headers={"Authorization": f"Bearer {API_KEY}"}
        )
        return response.json()["video_url"]
```

---

## Phase 6: Agent Learning System 🚧 **CRITICAL**

### 6.1 Make CrewAI Agents Learn
**Current**: Agents are static - they don't learn from performance

**Goal**: Agents adapt their behavior based on what works

**Implementation**:

**File**: `services/agent-orchestrator/learning.py`

```python
class AgentLearning:
    """Makes agents learn from performance data"""

    async def update_agent_memory(self, variant_id):
        """
        Analyze agent performance and store insights
        """
        # 1. Fetch metrics for this agent
        metrics = await get_agent_metrics(variant_id)

        # 2. Fetch interaction history
        interactions = await get_agent_interactions(variant_id)

        # 3. Analyze what worked
        insights = await analyze_performance(metrics, interactions)

        # 4. Store in agent_memory table
        await store_insights(variant_id, insights)

    async def analyze_performance(self, metrics, interactions):
        """
        Use LLM to analyze what made this agent successful/fail
        """
        prompt = f"""
        Analyze this agent's performance:
        - CTR: {metrics.ctr}
        - CVR: {metrics.cvr}
        - Interactions: {len(interactions)}

        What tactics worked? What didn't?
        """

        insights = await call_llm(prompt)
        return insights

    async def apply_learning_to_prompt(self, agent_config, variant_id):
        """
        Enhance system prompt with learned insights
        """
        # Fetch agent memory
        memory = await get_agent_memory(variant_id)

        # Add successful tactics to system prompt
        enhanced_prompt = agent_config.llmConfig.systemPrompt
        enhanced_prompt += f"\n\nLEARNED INSIGHTS:\n{memory.insights}"

        return enhanced_prompt
```

**Integration into `/generate-content`**:
```python
@app.post("/generate-content")
async def generate_content(req: GenerateContentRequest):
    # BEFORE calling LLM, enhance prompt with learning
    enhanced_prompt = await agent_learning.apply_learning_to_prompt(
        req.agentConfig,
        req.variantId
    )

    # Use enhanced prompt
    response = await openai_client.chat.completions.create(
        model=req.agentConfig.llmConfig.model,
        messages=[
            {"role": "system", "content": enhanced_prompt},  # ← Learning applied!
            {"role": "user", "content": user_prompt}
        ]
    )
    ...
```

### 6.2 Scheduled Learning Updates
**Add to evolution engine**:

```python
@scheduler.scheduled_job('interval', minutes=30)
async def update_all_agent_memories():
    """
    Every 30 minutes, analyze performance and update agent memories
    """
    active_variants = await get_active_variants()

    for variant in active_variants:
        await agent_learning.update_agent_memory(variant.id)
```

---

## Testing Plan

### Integration Testing Checklist

```bash
# 1. Test OpenAI GPT-4
python -m pytest tests/test_openai_integration.py

# 2. Test Google Gemini
python -m pytest tests/test_gemini_integration.py

# 3. Test Metorial MCP
python -m pytest tests/test_metorial_mcp.py

# 4. Test Meta Ads MCP
python -m pytest tests/test_meta_ads_mcp.py

# 5. Test NanoBanana
python -m pytest tests/test_nanobanana.py

# 6. Test Veo2
python -m pytest tests/test_veo2.py

# 7. Test agent learning
python -m pytest tests/test_agent_learning.py

# 8. End-to-end test
python scripts/test_system.py
```

---

## Implementation Priority

### **RIGHT NOW** (Next 2 hours):
1. ✅ Update .env with Metorial (DONE)
2. 🚧 Create Vite frontend skeleton
3. 🚧 Add Google Gemini to orchestrator
4. 🚧 Implement agent learning system

### **Today**:
5. Test OpenAI + Gemini with real keys
6. Create Metorial MCP client
7. Create Meta Ads MCP client
8. Test agent creation end-to-end

### **This Week**:
9. Add NanoBanana integration
10. Add Veo2 integration
11. Build frontend dashboard
12. Full system integration test
13. Deploy to production

---

## Summary: What We Understand

✅ **Architecture**: CrewAI + TS backend is CORRECT
✅ **Integrations needed**:
   - Metorial MCP (not Morphic) ✅ Corrected
   - Meta Ads MCP
   - Google Gemini
   - NanoBanana
   - Veo2

✅ **Critical feature**: Agent learning from performance data
✅ **Goal**: Agents that actually learn and improve, not just evolve genetically

✅ **Next steps**:
   1. Setup Vite frontend
   2. Add all integrations
   3. Implement learning system
   4. Test with real API keys

**Ready to proceed?** Let's build! 🚀
