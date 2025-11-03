# Quick Start Guide: Agent-Based Advertising

Get your first AI agent campaign running in 5 minutes!

## Prerequisites

- Docker & Docker Compose
- OpenAI API key (GPT-4 access)
- Convex account (free tier works)

## Step 1: Environment Setup

1. **Copy environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Configure required variables:**
   ```bash
   # Edit .env file
   OPENAI_API_KEY=sk-proj-your-key-here
   CONVEX_HTTP_BASE=https://your-deployment.convex.site
   ADMIN_SECRET=your-secure-secret-key
   ```

## Step 2: Start Services

```bash
cd ops
docker-compose up -d
```

**Services starting:**
- ✅ Bandit Service (port 8000) - Multi-armed bandit
- ✅ Agent Orchestrator (port 8001) - AI agent creation
- ✅ Evolution Engine (port 8002) - Agent breeding
- ✅ Offer Pages (port 8787) - Landing pages

**Check health:**
```bash
curl http://localhost:8001/health
curl http://localhost:8002/health
```

## Step 3: Create Your First Campaign

**Option A: Use Example Script (Recommended)**
```bash
# Install Python dependencies
pip install httpx python-dotenv

# Run perfume campaign example
python examples/create_perfume_campaign.py
```

**Option B: Manual API Calls**
```bash
# 1. Create campaign
curl -X POST http://localhost:8788/admin/createCampaign \
  -H "x-admin-key: your-admin-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My First Campaign",
    "goal": {"type": "conversions", "target": 1000},
    "segments": ["human", "agent"]
  }'

# Response: {"id": "camp_xyz123"}

# 2. Create agents
curl -X POST http://localhost:8001/create-agents \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "camp_xyz123",
    "agentType": "landing_page",
    "segment": "human",
    "productInfo": {
      "name": "Your Product",
      "price": "$99"
    },
    "goal": {"type": "conversions", "target": 1000},
    "assets": [],
    "count": 10
  }'
```

## Step 4: Monitor Your Campaign

**Check evolution status:**
```bash
curl http://localhost:8002/evolution-status/camp_xyz123
```

**View agent performance:**
```bash
# Get bandit state
curl http://localhost:8000/health
```

**See live landing page:**
```bash
# Visit in browser
open http://localhost:8787/offer/var_abc456
```

## Step 5: Watch Agents Evolve

**What's happening automatically:**

1. **Traffic Distribution** (Real-time)
   - Multi-armed bandit assigns visitors to agents
   - Thompson Sampling picks best performers more often

2. **Performance Tracking** (Continuous)
   - Every interaction tracked: impressions, clicks, conversions
   - Fitness scores calculated based on CTR, CVR, revenue

3. **Evolution Cycles** (Every 48 hours)
   - Top 20% agents selected for breeding
   - New generation created with inherited traits
   - Mutations introduce variations
   - Weak agents retired

**Manual evolution trigger:**
```bash
curl -X POST http://localhost:8002/evolve \
  -H "Content-Type: application/json" \
  -d '{"campaignId": "camp_xyz123", "force": true}'
```

## Example Output

After running `create_perfume_campaign.py`:

```
🚀 Ad-Astra Agent-Based Campaign Creator
🌹 Creating Midnight Rose Perfume Campaign

📝 Creating campaign...
✅ Campaign created: k17abc123xyz

🤖 Creating agent swarm...
  Creating landing_page agents for human segment...
    ✅ Created 5 landing_page agents
  Creating landing_page agents for agent segment...
    ✅ Created 5 landing_page agents
  Creating social_media agents for human segment...
    ✅ Created 5 social_media agents
  [... continues for all types ...]

✅ Total agents created: 50

============================================================
🎉 CAMPAIGN DEPLOYED SUCCESSFULLY
============================================================

📊 Campaign ID: k17abc123xyz
🎯 Goal: 10,000 purchases
💰 Budget: $50,000 total ($1,666/day)
⏱️  Timeline: 30 days

🤖 Agent Swarm Composition:
  • landing_page (human): 5 agents
  • landing_page (agent): 5 agents
  • social_media (human): 5 agents
  • social_media (agent): 5 agents
  • placement (human): 5 agents
  • placement (agent): 5 agents
  • visual (human): 5 agents
  • visual (agent): 5 agents
  • ai_context (human): 5 agents
  • ai_context (agent): 5 agents

📈 What Happens Next:
  1. Multi-armed bandit starts selecting agents for traffic
  2. Agents adapt content based on visitor behavior
  3. Performance metrics tracked (CTR, CVR, revenue)
  4. Every 48 hours: Top 20% agents breed new generation
  5. Weak agents retire, strong agents dominate
  6. Process continues until 10k purchases reached

🚀 Agents are now LIVE and optimizing!
============================================================
```

## Configuration Tips

### Adjust Evolution Speed
```bash
# In .env
EVOLUTION_FREQUENCY_HOURS=24  # Evolve daily instead of every 48h
```

### Tune Fitness Weights
```bash
# Prioritize revenue over clicks
FITNESS_WEIGHT_CTR=0.2
FITNESS_WEIGHT_CONVERSION=0.3
FITNESS_WEIGHT_REVENUE=0.5
```

### Increase Mutation Rate
```bash
# More exploration (higher creativity)
MUTATION_RATE=0.3  # Default is 0.15
```

## Common Issues

### "OpenAI API key not configured"
- Check `.env` file has `OPENAI_API_KEY=sk-proj-...`
- Restart docker-compose: `docker-compose restart`

### "Convex HTTP base not configured"
- Set `CONVEX_HTTP_BASE` in `.env`
- Make sure Convex deployment is running

### Services won't start
```bash
# Check logs
docker-compose logs agent-orchestrator
docker-compose logs evolution-engine

# Rebuild
docker-compose up --build -d
```

## Next Steps

1. **Read full docs:** [README_AGENT_SYSTEM.md](README_AGENT_SYSTEM.md)
2. **Explore API:** Test endpoints with Postman/Insomnia
3. **Customize agents:** Modify personality/strategy pools in `services/agent-orchestrator/app.py`
4. **Add MCP integrations:** Connect to Meta Ads, Google Ads (coming soon)
5. **Monitor dashboards:** Set up Metabase for analytics

## Support

- **Issues:** [GitHub Issues](https://github.com/your-repo/issues)
- **Docs:** See `/docs` folder
- **Examples:** See `/examples` folder

---

**You're ready! Your AI agents are now optimizing your campaigns autonomously.** 🎉
