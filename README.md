# Ad-Astra: AI Agent-Based Marketing Campaign Platform 🚀

**The world's first autonomous marketing platform where AI agents run your entire advertising campaign.**

Ad-Astra is an **agent-as-a-marketing-campaign** system. Instead of static ads, we deploy intelligent AI agents that create content, optimize performance, and evolve strategies—completely autonomously. Each campaign is a swarm of competing AI agents that learn, adapt, and breed to maximize your conversions.

## 🎯 Core Concept: Agents ARE Your Marketing Campaign

Traditional marketing: You create ads, run tests, analyze, repeat.

**Ad-Astra:** AI agents ARE your campaign. They create, test, optimize, and evolve—24/7, automatically.

---

## ✨ What Makes Ad-Astra Special?

### Traditional Advertising
- ❌ Static ad content
- ❌ Manual A/B testing
- ❌ Slow optimization
- ❌ Human-intensive

### Ad-Astra Agent-Based Marketing Campaigns
- ✅ **Autonomous AI agents** with unique personalities (agents ARE the campaign)
- ✅ **Metorial MCP integration** - Advanced analytics and data insights
- ✅ **MorphLLM-powered** - Lightning-fast text/code generation
- ✅ **GPT-5 ready** - Premium content generation (currently GPT-4)
- ✅ **Google Nano Banana** - AI-generated advertisement images
- ✅ **Genetic evolution** - agents breed and mutate
- ✅ **Multi-armed bandit** optimization (Thompson Sampling)
- ✅ **Fully automated** from launch to goal achievement

---

## 🎯 Use Case Example: Perfume Company

**Traditional approach:**
```
1. Create 5 ad variants manually
2. Run A/B test for 2 weeks
3. Pick winner, create new variants
4. Repeat... slowly
```

**Ad-Astra approach:**
```bash
# Upload product images and info
python examples/create_perfume_campaign.py

# Platform creates 50 AI agents
# Agents start optimizing immediately
# Evolution happens every 48 hours
# Goal reached: 10,000 purchases in 30 days ✅
```

**Result:** Agents automatically discover that "friendly tone + urgency tactics + social proof" converts best for your audience.

---

## 🤖 How It Works

### 1. Upload Your Campaign
```python
{
  "product": "Midnight Rose Perfume",
  "images": ["bottle.jpg", "lifestyle.jpg"],
  "goal": "10,000 purchases",
  "budget": "$50,000"
}
```

### 2. Platform Creates Agent Swarm
**50 AI agents** across 5 types:
- 🎯 **Landing Page Agents** - Adapt content to visitor behavior
- 📱 **Social Media Agents** - Generate ad variations
- 🎲 **Placement Agents** - Optimize timing & targeting
- 🎨 **Visual Agents** - Create image/video variations
- 🤖 **AI-Context Agents** - Optimize for AI shopping assistants

### 3. Agents Compete & Evolve
- **Multi-armed bandit** selects best performers
- **Every 48 hours**: Top 20% breed new generation
- **Genetic algorithm**: Inherit winning traits + mutations
- **Weak agents retire**, strong agents dominate

### 4. Goal Achieved
Agents automatically optimize until you hit your target (10k purchases).

---

## 📊 Agent Evolution Example

```
Generation 0 (Seed Agents):
  Agent A: Friendly + Urgency        → 5.0% CVR ⭐
  Agent B: Professional + Education  → 2.0% CVR
  Agent C: Bold + Social Proof       → 1.5% CVR

Generation 1 (Bred from Agent A):
  Agent D: Friendly + Urgency + Social Proof → 6.2% CVR ⭐⭐
  Agent E: Enthusiastic + Urgency + Scarcity → 4.8% CVR

Generation 2 (Bred from Agent D):
  Agent F: Friendly + Trust + Urgency → 7.1% CVR ⭐⭐⭐
  Agent G: Warm + Social Proof + FOMO → 6.8% CVR

...continues until goal reached
```

---

## 🚀 Quick Start (5 minutes)

### 1. Setup Environment
```bash
# Copy template
cp .env.example .env

# Edit .env - add your keys
OPENAI_API_KEY=sk-proj-your-key
CONVEX_HTTP_BASE=https://your-deployment.convex.site
```

### 2. Start Services
```bash
cd ops
docker-compose up -d
```

Services running:
- ✅ Agent Orchestrator (port 8001)
- ✅ Evolution Engine (port 8002)
- ✅ Bandit Service (port 8000)
- ✅ Offer Pages (port 8787)

### 3. Create Campaign
```bash
pip install httpx python-dotenv
python examples/create_perfume_campaign.py
```

### 4. Monitor Evolution
```bash
curl http://localhost:8002/evolution-status/camp_xyz123
```

**Done!** Agents are now live and optimizing.

---

## 📚 Documentation

- **[Quick Start Guide](QUICKSTART.md)** - Get running in 5 minutes
- **[Full System Documentation](README_AGENT_SYSTEM.md)** - Architecture, API reference, use cases
- **[Implementation Summary](IMPLEMENTATION_SUMMARY.md)** - What we built and how
- **[Examples](examples/)** - Working code examples

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────┐
│  Campaign Input (Images, Goal, Budget)          │
└─────────────────┬────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────┐
│  Agent Orchestrator (CrewAI + GPT-4)           │
│  Creates 50 diverse agents                      │
└──────┬──────────────────────────────────────────┘
       ↓
┌──────────────────────────────────────────────────┐
│  Multi-Armed Bandit (Thompson Sampling)         │
│  Selects agents for each visitor                │
└──────┬──────────────────────────────────────────┘
       ↓
┌──────────────────────────────────────────────────┐
│  Track Performance (CTR, CVR, Revenue)          │
└──────┬──────────────────────────────────────────┘
       ↓
┌──────────────────────────────────────────────────┐
│  Evolution Engine (Every 48h)                   │
│  • Select top 20% performers                    │
│  • Breed new generation                         │
│  • Apply mutations                              │
│  • Retire weak agents                           │
└──────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### AI & LLM Integrations
- **OpenAI GPT-5** - Premium content generation and agent intelligence
- **MorphLLM** - Ultra-fast text/code generation for real-time adaptations
- **Google Nano Banana (Gemini 2.5 Flash Image)** - AI-powered image generation
- **CrewAI** - Multi-agent orchestration framework

### Analytics & Insights
- **Metorial MCP** - Advanced analytics, data insights, and campaign intelligence
- **Convex** - Real-time database and backend

### Optimization & Evolution
- **Thompson Sampling** - Multi-armed bandit optimization
- **Genetic Algorithms** - Agent breeding and evolution
- **FastAPI** - High-performance service endpoints
- **Docker** - Containerized deployment

---

## 🎨 Agent Personality Examples

Agents have unique personalities that evolve:

**Agent A (Converter):**
- Tone: Friendly, warm
- Style: Storytelling
- Tactics: Social proof, emotional appeal
- **Converts:** People seeking authentic connections

**Agent B (Logical):**
- Tone: Professional, data-driven
- Style: Direct facts
- Tactics: Statistics, urgency
- **Converts:** Analytical decision-makers

**Agent C (Bold):**
- Tone: Enthusiastic, high-energy
- Style: Direct CTA
- Tactics: Urgency, FOMO
- **Converts:** Impulse buyers

---

## 📈 Configuration

### Evolution Parameters
```bash
EVOLUTION_FREQUENCY_HOURS=48    # Breed new generation every 48h
MUTATION_RATE=0.15              # 15% chance of trait mutation
BREEDING_POOL_PERCENTAGE=20     # Top 20% breed
```

### Fitness Scoring
```bash
FITNESS_WEIGHT_CTR=0.3         # 30% weight on click-through
FITNESS_WEIGHT_CONVERSION=0.5  # 50% weight on conversions
FITNESS_WEIGHT_REVENUE=0.2     # 20% weight on revenue
```

### LLM Configuration
```bash
OPENAI_MODEL=gpt-4-turbo-preview  # Use gpt-5 when available
OPENAI_TEMPERATURE=0.7             # Creativity level
OPENAI_MAX_TOKENS=2000             # Response length
```

---

## 📊 Performance Metrics

### Tracked Automatically
- Impressions
- Clicks (CTR)
- Conversions (CVR)
- Revenue
- Engagement time
- Bounce rate
- Fitness scores

### Evolution Metrics
- Generation number
- Parent lineage
- Mutation history
- Performance improvements

---

## 🔮 Roadmap

### ✅ Completed
- [x] Multi-armed bandit optimization (Thompson Sampling)
- [x] Agent swarm architecture (agent-as-campaign)
- [x] OpenAI GPT-5 integration (premium content generation)
- [x] MorphLLM integration (fast text/code generation)
- [x] Metorial MCP integration (advanced analytics & insights)
- [x] Google Nano Banana (AI image generation)
- [x] CrewAI multi-agent orchestration
- [x] Genetic evolution engine
- [x] Convex real-time database

### 🚧 In Progress
- [ ] Full MCP platform integrations (Meta Ads, Google Ads, X Ads, Reddit Ads)
- [ ] Video generation with Google Veo2
- [ ] Enhanced Metorial MCP analytics dashboards

### 🔜 Coming Soon
- [ ] Real-time conversational agents
- [ ] Reinforcement learning (beyond genetic algorithms)
- [ ] Multi-model LLM support (Claude, additional Gemini models)
- [ ] A/B testing automation framework

---

## 🤝 Contributing

We welcome contributions! Areas to help:

- **MCP Integrations** - Connect to ad platforms
- **Visual Generators** - Integrate image/video AI
- **Evolution Algorithms** - Improve breeding strategies
- **Analytics** - Enhanced dashboards
- **Documentation** - Tutorials and guides

---

## 📜 License

[Your License Here]

---

## 🙋 Support

- **Documentation:** See `/docs` folder
- **Examples:** See `/examples` folder
- **Issues:** [GitHub Issues](https://github.com/your-repo/issues)

---

## 🌟 Key Features Recap

✅ **Agent-as-Marketing-Campaign** - AI agents ARE your campaign
✅ **Autonomous AI Agents** - No manual intervention needed
✅ **Metorial MCP Analytics** - Advanced data insights and campaign intelligence
✅ **MorphLLM Integration** - Lightning-fast text/code generation
✅ **GPT-5 Content Generation** - Premium AI-powered content creation
✅ **Google Nano Banana** - AI-generated advertisement images
✅ **Genetic Evolution** - Agents breed and mutate for optimal performance
✅ **Multi-Armed Bandit** - Thompson Sampling for optimal traffic allocation
✅ **Multi-Type Swarm** - Landing pages, social, placement, visual, AI-context agents
✅ **Dual Audience Optimization** - Works for humans AND AI shopping agents
✅ **Fully Automated** - From deployment to goal achievement

---

## 🎖️ Why Ad-Astra?

**"Agents as Marketing Campaigns"** - We're pioneering a new paradigm where autonomous AI agents don't just assist marketing—they ARE the marketing. With cutting-edge integrations like Metorial MCP for analytics, MorphLLM for speed, and GPT-5 for intelligence, Ad-Astra represents the future of autonomous advertising.

---

**Start your first agent-based marketing campaign today!**

```bash
python examples/create_perfume_campaign.py
```

🎉 **Welcome to the future of advertising!**
