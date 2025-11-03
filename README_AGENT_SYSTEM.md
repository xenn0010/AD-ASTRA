# Ad-Astra Agent-Based Advertising Platform

## Overview

Ad-Astra is an **AI-powered agent-based advertising platform** that creates, deploys, and evolves autonomous AI agents to optimize your ad campaigns. Instead of static ads, you get **adaptive agents** that learn and improve over time to maximize conversions.

### What Makes This Different?

- **Traditional Ads**: Static content, manual A/B testing, slow optimization
- **Ad-Astra Agents**: Autonomous AI agents that adapt, learn, and evolve automatically

## How It Works

### 1. Upload Your Campaign Assets
```bash
# Upload product images, videos, brand content
POST /upload-assets
{
  "campaignId": "camp_123",
  "files": [...],
  "productInfo": {
    "name": "Midnight Rose Perfume",
    "description": "Luxury fragrance with notes of rose, sandalwood, and vanilla",
    "price": "$89",
    "targetAudience": "Women 25-45, luxury shoppers"
  }
}
```

### 2. Set Your Goal
```bash
# Define what success looks like
POST /create-campaign
{
  "goal": {
    "type": "conversions",  # or "revenue"
    "target": 10000          # 10,000 purchases
  },
  "timeline": "30 days",
  "budget": {
    "total": 50000,
    "currency": "USD"
  }
}
```

### 3. Deploy Agent Swarm
The platform automatically creates **multiple agent types**:

#### **Agent Types:**

1. **Landing Page Agents** 🎯
   - Adapt page content based on visitor behavior
   - Dynamically change headlines, images, CTAs
   - Learn what resonates with different visitors

2. **Social Media Agents** 📱
   - Generate ad variations for Meta, Google, X, Reddit
   - Test different angles, hooks, and messaging
   - Evolve winning creative concepts

3. **Placement Agents** 🎲
   - Optimize when/where to show ads
   - Learn best times, devices, contexts
   - Maximize ROI through smart targeting

4. **Visual Agents** 🎨
   - Create image/video variations
   - Test different visual styles
   - Combine winning elements

5. **AI-Context Agents** 🤖
   - Optimize for AI shopping assistants
   - Structure data for AI agents browsing your site
   - Win in the age of AI-powered e-commerce

### 4. Agents Learn & Evolve

**Multi-Armed Bandit Optimization:**
- Thompson Sampling selects which agents get traffic
- Winning agents get shown more often
- Underperformers get less traffic

**Evolutionary Algorithm:**
- Every 48 hours (configurable), top 20% of agents "breed"
- Offspring inherit successful traits from parent agents
- Random mutations introduce new variations
- Weak agents die off naturally

**Example Evolution:**
```
Generation 0 (Seed Agents):
  Agent A: Friendly tone + Urgency tactics → 5% CVR ⭐
  Agent B: Professional tone + Education → 2% CVR
  Agent C: Bold tone + Social proof → 1.5% CVR

Generation 1 (Bred from Agent A):
  Agent D: Friendly + Urgency + Social proof → 6.2% CVR ⭐⭐
  Agent E: Enthusiastic + Urgency + Scarcity → 4.8% CVR

Generation 2 (Bred from Agent D):
  Agent F: Friendly + Urgency + Trust signals → 7.1% CVR ⭐⭐⭐
  ...continues until goal reached
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Campaign Input                        │
│  (Images, Product Info, Goal: 10k purchases)            │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│           Agent Orchestrator (CrewAI + GPT-4)           │
│  Creates 10 seed agents per type (50 total agents)     │
└────────────┬────────────────────────────────────────────┘
             │
             ├──────────┬──────────┬──────────┬──────────┐
             ▼          ▼          ▼          ▼          ▼
        Landing    Social     Placement  Visual    AI-Context
         Page      Media                             Agents
        Agents    Agents     Agents     Agents
             │
             └──────────┬──────────────────────────────────┐
                        ▼                                   │
              ┌─────────────────────┐                     │
              │  Multi-Armed Bandit │                     │
              │  (Thompson Sampling)│                     │
              │  Selects which agent│                     │
              │  to show each user  │                     │
              └──────────┬──────────┘                     │
                         │                                 │
                         ▼                                 │
              ┌──────────────────────┐                    │
              │   Track Performance  │                    │
              │  (CTR, CVR, Revenue) │                    │
              └──────────┬───────────┘                    │
                         │                                 │
                         ▼                                 │
              ┌──────────────────────┐                    │
              │   Evolution Engine   │◄───────────────────┘
              │  - Calculate fitness │
              │  - Select top 20%    │
              │  - Breed new gen     │
              │  - Apply mutations   │
              └──────────────────────┘
```

## API Reference

### Agent Orchestrator Service (Port 8001)

#### Create Seed Agents
```bash
POST http://localhost:8001/create-agents
Content-Type: application/json

{
  "campaignId": "camp_123",
  "agentType": "landing_page",  # or social_media, placement, visual, ai_context
  "segment": "human",           # or "agent" for AI scrapers
  "assets": [
    {
      "assetType": "image",
      "fileName": "perfume_bottle.jpg",
      "fileUrl": "https://cdn.example.com/perfume.jpg",
      "tags": ["product", "luxury"]
    }
  ],
  "productInfo": {
    "name": "Midnight Rose Perfume",
    "price": "$89",
    "features": ["Long-lasting", "Luxury ingredients", "Eco-friendly"],
    "targetAudience": "Women 25-45"
  },
  "goal": {
    "type": "conversions",
    "target": 10000
  },
  "count": 10
}
```

**Response:**
```json
{
  "campaignId": "camp_123",
  "agentType": "landing_page",
  "count": 10,
  "agents": [
    {
      "id": "var_xyz123",
      "generation": 0,
      "personality": {
        "tone": "friendly",
        "style": "storytelling"
      }
    }
  ]
}
```

#### Generate Dynamic Content
```bash
POST http://localhost:8001/generate-content
Content-Type: application/json

{
  "variantId": "var_xyz123",
  "agentConfig": { ... },
  "context": {
    "userBehavior": "scrolled_50_percent",
    "timeOnPage": 15,
    "previousPages": ["/products", "/reviews"]
  },
  "contentType": "headline"
}
```

**Response:**
```json
{
  "variantId": "var_xyz123",
  "contentType": "headline",
  "content": "Discover Your Signature Scent - Limited Stock Remaining",
  "usage": {
    "totalTokens": 124
  }
}
```

### Evolution Engine Service (Port 8002)

#### Trigger Evolution
```bash
POST http://localhost:8002/evolve
Content-Type: application/json

{
  "campaignId": "camp_123",
  "force": false  # Set true to force evolution even without min interactions
}
```

**Response:**
```json
{
  "status": "started",
  "campaignId": "camp_123",
  "message": "Evolution process started in background"
}
```

#### Get Evolution Status
```bash
GET http://localhost:8002/evolution-status/camp_123
```

**Response:**
```json
{
  "campaignId": "camp_123",
  "currentGeneration": 3,
  "totalAgents": 50,
  "topPerformers": [
    {
      "variantId": "var_abc456",
      "generation": 2,
      "fitnessScore": 0.87,
      "ctr": 0.08,
      "cvr": 0.071
    }
  ]
}
```

## Configuration

### Environment Variables

Copy [.env.example](.env.example) to `.env` and configure:

**Required:**
```bash
# OpenAI (for agent LLM)
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4-turbo-preview  # Use gpt-5 when available

# Convex Backend
CONVEX_HTTP_BASE=https://your-deployment.convex.site
ADMIN_SECRET=your-secret-key
```

**Optional:**
```bash
# Evolution Settings
EVOLUTION_FREQUENCY_HOURS=48      # How often to breed new generations
MUTATION_RATE=0.15                # Mutation probability (0-1)
BREEDING_POOL_PERCENTAGE=20       # Top % to use for breeding

# Fitness Weights
FITNESS_WEIGHT_CTR=0.3            # Weight for click-through rate
FITNESS_WEIGHT_CONVERSION=0.5     # Weight for conversion rate
FITNESS_WEIGHT_REVENUE=0.2        # Weight for revenue
```

## Quick Start

### 1. Start Services
```bash
cd ops
docker-compose up -d
```

This starts:
- **Bandit Service** (Port 8000) - Multi-armed bandit optimization
- **Agent Orchestrator** (Port 8001) - Agent creation & LLM calls
- **Evolution Engine** (Port 8002) - Breeding & evolution
- **Offer Pages** (Port 8787) - Landing page serving

### 2. Create Campaign
```bash
# See examples/create_campaign.py
python examples/create_perfume_campaign.py
```

### 3. Monitor Progress
```bash
# Check agent performance
curl http://localhost:8002/evolution-status/camp_123

# View landing page
open http://localhost:8787/offer/var_xyz123
```

### 4. Evolution Happens Automatically
Every 48 hours (configurable), the evolution engine:
- Calculates fitness scores
- Breeds top 20% performers
- Deploys new generation
- Retires underperformers

## Agent Personality Examples

The system generates diverse agent personalities:

**Agent A:**
- Tone: Friendly
- Style: Storytelling
- Tactics: Social proof, Emotional appeal
- Strategy: Build trust through narrative

**Agent B:**
- Tone: Professional
- Style: Data-driven
- Tactics: Statistics, Urgency
- Strategy: Logical persuasion with scarcity

**Agent C:**
- Tone: Enthusiastic
- Style: Direct sale
- Tactics: Bold claims, Clear CTA
- Strategy: High-energy conversion focus

## Use Cases

### E-Commerce (Perfume Company Example)
```
Input: Product images, descriptions, $50k budget
Goal: 10,000 purchases in 30 days
Agents: Create 50 agents (10 per type)
Result: Agents evolve messaging, find winning angles, hit goal
```

### SaaS
```
Input: Product screenshots, feature list
Goal: 1,000 trial signups
Agents: Test educational vs urgency approaches
Result: Agents learn which messaging converts developers vs business users
```

### Lead Generation
```
Input: Service description, case studies
Goal: 500 qualified leads
Agents: Optimize form placement, copy, CTAs
Result: Agents find optimal conversion paths
```

## Monitoring & Analytics

### Fitness Scoring

Each agent gets a fitness score (0-1) based on:
```
Fitness = (0.3 × CTR) + (0.5 × CVR) + (0.2 × Revenue)
```

### Performance Metrics Tracked
- Impressions
- Clicks (CTR)
- Conversions (CVR)
- Revenue
- Engagement time
- Bounce rate

### Evolution History
Track each generation:
- Parent IDs
- Mutations applied
- Performance improvements
- Trait inheritance

## Roadmap

- [x] Multi-armed bandit optimization
- [x] Agent swarm architecture
- [x] OpenAI GPT-4 integration
- [x] Evolution engine
- [ ] Visual content generation (integrate DALL-E/Midjourney)
- [ ] MCP integrations (Meta Ads, Google Ads, X Ads)
- [ ] Real-time chat agents (future phase)
- [ ] Reinforcement learning (beyond genetic algorithms)
- [ ] Multi-model support (Claude, Gemini, etc.)

## Support

For questions or issues:
- GitHub Issues: [Your repo]
- Docs: See `/docs` folder
- Examples: See `/examples` folder

## License

[Your license]
