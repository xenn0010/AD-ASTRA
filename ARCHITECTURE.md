# Ad-Astra Architecture Documentation

## System Overview

Ad-Astra is a distributed system consisting of multiple services that work together to create, deploy, and evolve AI advertising agents.

## Service Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER/CLIENT                              │
│  (Campaign Creator, Traffic, AI Shopping Agents)                │
└───────────┬─────────────────────────────────────────────────────┘
            │
            ↓
┌───────────────────────────────────────────────────────────────────┐
│                    CONVEX BACKEND (Database + API)                │
│  - Campaigns, Variants, Events, Metrics                          │
│  - HTTP Endpoints: /assign, /event, /admin/*                     │
└───────┬───────────────────────────────┬───────────────────────────┘
        │                               │
        ↓                               ↓
┌─────────────────────┐      ┌─────────────────────────────┐
│  BANDIT SERVICE     │      │  AGENT ORCHESTRATOR         │
│  (Port 8000)        │      │  (Port 8001)                │
│                     │      │                             │
│  - Thompson Sampling│      │  - CrewAI Framework         │
│  - Arm Selection    │      │  - OpenAI GPT-4/GPT-5       │
│  - Reward Updates   │      │  - Agent Creation           │
│  - Redis State      │      │  - Content Generation       │
└─────────────────────┘      │  - Personality/Strategy     │
                             └──────────┬──────────────────┘
                                        │
                                        ↓
                             ┌─────────────────────────────┐
                             │  EVOLUTION ENGINE           │
                             │  (Port 8002)                │
                             │                             │
                             │  - Fitness Calculation      │
                             │  - Parent Selection         │
                             │  - Crossover & Mutation     │
                             │  - Scheduled Evolution      │
                             └─────────────────────────────┘
                                        │
                                        ↓
┌──────────────────────────────────────────────────────────────────┐
│                    OFFER PAGES SERVICE                           │
│                    (Port 8787)                                   │
│                                                                  │
│  - Human Landing Pages (HTML)                                   │
│  - AI Agent Endpoints (JSON-LD)                                 │
│  - Dynamic Content Rendering                                    │
└──────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Campaign Creation Flow

```
User
  │
  ↓ POST /admin/createCampaign
Convex Backend
  │ (creates campaign record)
  ↓
  │ Response: campaignId
  ↓
User calls Agent Orchestrator
  │
  ↓ POST /create-agents
Agent Orchestrator
  │ (generates 50 agents with GPT-4)
  │ - 10 landing_page agents
  │ - 10 social_media agents
  │ - 10 placement agents
  │ - 10 visual agents
  │ - 10 ai_context agents
  ↓
  │ For each agent:
  │ - Generate personality (tone/style/traits)
  │ - Generate strategy (objective/tactics)
  │ - Create system prompt
  │ - Call Convex to store variant
  ↓
Convex Backend
  │ (stores all 50 agent variants)
  ↓
Campaign Ready! 🚀
```

### 2. Traffic Assignment Flow

```
Visitor arrives
  │
  ↓ POST /assign
Convex Backend
  │ (fetch active variants for campaign)
  ↓
  │ Call Bandit Service
  ↓
Bandit Service
  │ (Thompson Sampling)
  │ - Sample Beta distribution for each agent
  │ - Select agent with highest sample
  ↓
  │ Return: variantId
  ↓
Convex Backend
  │ (create assignment record)
  ↓
  │ Response: {variantId, assignmentId, signature}
  ↓
Client/Visitor
  │ Redirected to agent's offer page
  ↓
Offer Pages Service
  │ (render agent's content)
  │ - Fetch variant payload from Convex
  │ - Render HTML (for humans) or JSON (for AI agents)
  ↓
Visitor sees personalized content 🎯
```

### 3. Event Tracking Flow

```
Visitor interacts
  │
  ↓ Impression/Click/Conversion
  │
  ↓ POST /event
Convex Backend
  │ (store event record)
  │ - type: impression/click/convert
  │ - variantId, assignmentId, timestamp
  │ - metadata (UA, geo, etc.)
  ↓
  │ If conversion:
  │   Forward to Bandit Service
  ↓
Bandit Service
  │ POST /reward
  │ (update arm parameters)
  │ - Increase alpha (success)
  │ - Update Beta distribution
  ↓
Agent's fitness improves ⬆️
```

### 4. Evolution Cycle Flow

```
Every 48 hours (scheduled)
  │
  ↓
Evolution Engine wakes up
  │
  ↓ Fetch agent metrics from Convex
  │
  │ For each agent:
  │ - Calculate fitness score
  │   = 0.3×CTR + 0.5×CVR + 0.2×Revenue
  ↓
  │ Sort agents by fitness
  │ Select top 20% (10 agents)
  ↓
Parent Selection Complete
  │
  ↓ Breeding Phase
  │
  │ For each new offspring:
  │   1. Select 2 random parents
  │   2. Crossover (combine traits)
  │      - Personality: random pick from parents
  │      - Strategy: combine tactics
  │      - LLM config: average temperature
  │   3. Mutation (15% chance)
  │      - Mutate tone/style/traits
  │      - Mutate tactics
  │      - Adjust temperature
  ↓
  │ Create new generation
  │ - Generation number++
  │ - Store parent IDs
  │ - Calculate new system prompts
  ↓
  │ Call Agent Orchestrator
  │ POST /breed-agents
  ↓
Agent Orchestrator
  │ (creates new agent variants)
  ↓
  │ Store in Convex
  ↓
Convex Backend
  │ (new generation deployed)
  │ (old weak agents marked inactive)
  ↓
New generation goes live! 🧬
```

## Component Details

### Agent Orchestrator

**Responsibilities:**
- Generate diverse agent personalities
- Create system prompts for GPT-4
- Handle dynamic content generation
- Coordinate agent creation with CrewAI

**Key Functions:**
- `generate_system_prompt()` - Creates agent instructions
- `random_personality()` - Generates personality config
- `random_strategy()` - Generates strategy config
- `call_convex_mutation()` - Stores agents in database

### Evolution Engine

**Responsibilities:**
- Calculate fitness scores
- Select top performers
- Breed new generations
- Apply genetic mutations
- Schedule automatic evolution

**Key Algorithms:**
- **Fitness Scoring:** Weighted combination of CTR, CVR, Revenue
- **Parent Selection:** Elitism (top 20%)
- **Crossover:** Single-point genetic crossover
- **Mutation:** Random trait variations with configurable rate

### Bandit Service

**Responsibilities:**
- Implement Thompson Sampling
- Select optimal agents for traffic
- Update arm parameters based on rewards
- Maintain state in Redis (optional)

**Algorithm:**
- Beta distribution per agent (α, β parameters)
- Sample from each distribution
- Select agent with highest sample
- Update α on success, β on failure

### Offer Pages Service

**Responsibilities:**
- Serve landing pages for humans (HTML)
- Serve structured data for AI agents (JSON-LD)
- Fetch variant content from Convex
- Render dynamic content

**Endpoints:**
- `GET /offer/:id` - HTML landing page
- `GET /offer/:id/ai.json` - AI agent data
- `GET /.well-known/ai.json` - AI agent policy

## Database Schema

### Core Tables

**campaigns**
```
- goal: {type, target}
- segments: ["human", "agent"]
- status: draft/running/paused/completed
- budgets: {daily, total, currency}
```

**variants**
```
- campaignId: ref
- agentType: landing_page/social_media/placement/visual/ai_context
- segment: human/agent
- payload: {human: {...}, agent: {...}}
- agentConfig: {personality, strategy, llmConfig, evolution}
- active: boolean
```

**agent_metrics**
```
- variantId: ref
- impressions, clicks, conversions, revenue
- ctr, cvr, avgEngagementTime, bounceRate
- fitnessScore
- windowStart, windowEnd
```

**evolution_history**
```
- campaignId: ref
- generation: number
- parentIds: [variantId, ...]
- childId: variantId
- mutationsApplied: [string, ...]
- timestamp
```

## Agent Types

### 1. Landing Page Agents 🎯
**Purpose:** Adapt webpage content based on visitor behavior

**Capabilities:**
- Dynamic headline generation
- Personalized copy
- Adaptive CTAs
- Content block optimization

**System Prompt Focus:**
- Conversion optimization
- Visitor engagement
- A/B testing intuition

### 2. Social Media Agents 📱
**Purpose:** Create viral social media ad content

**Capabilities:**
- Hook generation
- Platform-specific formatting
- Viral angle discovery
- Emoji and hashtag optimization

**System Prompt Focus:**
- Attention grabbing
- Shareability
- Platform best practices

### 3. Placement Agents 🎲
**Purpose:** Optimize ad timing and targeting

**Capabilities:**
- Time-of-day analysis
- Device targeting
- Geographic optimization
- Behavioral context

**System Prompt Focus:**
- ROI maximization
- Audience segmentation
- Contextual relevance

### 4. Visual Agents 🎨
**Purpose:** Generate image/video specifications

**Capabilities:**
- Visual concept generation
- Style recommendations
- Emotion targeting
- Brand alignment

**System Prompt Focus:**
- Visual storytelling
- Emotional impact
- Brand consistency

### 5. AI-Context Agents 🤖
**Purpose:** Optimize for AI shopping assistants

**Capabilities:**
- Structured data generation
- Semantic optimization
- Comparison facilitation
- Machine-readable content

**System Prompt Focus:**
- AI decision-making
- Structured formats
- Differentiator highlighting

## Performance Considerations

### Latency
- **Agent Creation:** ~5 seconds per agent (GPT-4 API call)
- **Content Generation:** ~1-2 seconds per request
- **Thompson Sampling:** <10ms
- **Evolution Cycle:** ~30-60 seconds

### Scalability
- **Concurrent Campaigns:** Unlimited (Convex scales)
- **Agents per Campaign:** Recommended 50-100
- **Traffic:** Limited by Bandit service capacity
- **Evolution:** Can process 1000s of agents

### Costs
- **GPT-4 API:** ~$0.01-0.03 per agent creation
- **Per Request:** ~$0.002 per content generation
- **Monthly (1 campaign):** ~$50-100 in LLM costs

## Security

### Authentication
- Admin endpoints require `x-admin-key` header
- Assignment signatures prevent tampering
- Convex handles auth for backend

### Rate Limiting
- LLM API calls: Respect OpenAI limits
- Assignment requests: Implement client-side caching
- Event tracking: Batch where possible

## Monitoring

### Health Checks
- `GET /health` on all services
- Response includes configuration status
- Monitor OpenAI API connectivity

### Metrics to Track
- Agent fitness scores (trending up?)
- Generation improvements (each gen better?)
- Conversion rates (overall CVR increasing?)
- Evolution cycles (completing successfully?)
- LLM costs (within budget?)

## Troubleshooting

### "No active variants"
- Check campaign status (should be "running")
- Verify agents created successfully
- Ensure `active: true` in variants table

### "OpenAI API error"
- Check API key in environment
- Verify GPT-4 access on account
- Monitor rate limits

### "Evolution not happening"
- Check MIN_INTERACTIONS_FOR_EVOLUTION met
- Verify scheduler running in evolution engine
- Check evolution engine logs

### "Agents not improving"
- Increase mutation rate (more exploration)
- Adjust fitness weights
- Verify tracking events firing correctly

## Configuration Best Practices

### For Exploration (Early Campaign)
```bash
MUTATION_RATE=0.3              # Higher exploration
BREEDING_POOL_PERCENTAGE=30    # Larger breeding pool
EVOLUTION_FREQUENCY_HOURS=24   # More frequent evolution
```

### For Exploitation (Late Campaign)
```bash
MUTATION_RATE=0.1              # Lower exploration
BREEDING_POOL_PERCENTAGE=10    # Elite breeding
EVOLUTION_FREQUENCY_HOURS=72   # Less frequent evolution
```

### For High Revenue Products
```bash
FITNESS_WEIGHT_REVENUE=0.6     # Prioritize revenue
FITNESS_WEIGHT_CONVERSION=0.3
FITNESS_WEIGHT_CTR=0.1
```

## Future Architecture

### Planned Additions
- **MCP Integration Layer:** Connect to external ad platforms
- **Visual Generation Service:** DALL-E/Midjourney integration
- **Real-time Chat Service:** WebSocket-based conversational agents
- **Analytics Dashboard:** Metabase/custom visualization
- **Multi-model Support:** Claude, Gemini, etc.

---

For implementation details, see [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)

For quick start, see [QUICKSTART.md](QUICKSTART.md)
