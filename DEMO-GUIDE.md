# Ad-Astra Live Demo Guide

## 🚀 Quick Start (30 seconds)

```bash
./start-demo.sh
```

Then open: **http://localhost:5173**

---

## 🎬 Demo Flow (5 minutes)

### **Act 1: The Platform (1 min)**
1. Show landing page - explain the vision
2. Click "Get started" → Dashboard
3. "This is our autonomous agent advertising platform"

### **Act 2: Live AI Image Generation (2 min)**
1. Scroll to the **PromptBox** at bottom
2. Type: `"Luxury perfume bottle with midnight roses"`
3. Click **Generate**
4. Wait 10 seconds → **REAL Nano Banana image appears!**
5. Open browser console → Show the actual base64 image data
6. "This is Google's Gemini 2.5 Flash generating real images"

### **Act 3: Create Campaign (1 min)**
1. Click **"New Campaign"** button
2. Name: `"Midnight Rose Launch"`
3. Goal: `50 conversions`
4. Segments: `Human` + `AI Agent`
5. Click **Create**
6. Campaign card appears!

### **Act 4: The Code (1 min)**
Show the backend in VS Code:

**Multi-Armed Bandit** (`services/bandit/app.py:84-110`)
```python
def sample_beta(alpha: float, beta: float) -> float:
    x = random.gammavariate(alpha, 1.0)
    y = random.gammavariate(beta, 1.0)
    return x / (x + y)
```
"Thompson Sampling - real Bayesian optimization"

**Genetic Algorithm** (`services/evolution-engine/app.py:168-210`)
```python
def crossover(parent1, parent2):
    # Single-point crossover
    offspring_personality = {
        "tone": random.choice([parent1.tone, parent2.tone]),
        "style": random.choice([parent1.style, parent2.style])
    }
```
"Real genetic programming - agents breed and mutate"

---

## 🎯 Key Talking Points

### **What Makes This Special:**

1. **Real AI Integration**
   - Nano Banana (Gemini 2.5 Flash) generates actual images
   - OpenAI GPT-5 for agent personalities
   - Not a mockup - real API calls

2. **Genetic Algorithms**
   - Thompson Sampling for multi-armed bandit
   - Crossover + Mutation for agent breeding
   - Fitness-based natural selection

3. **Dual-Audience Innovation**
   - Optimizes for BOTH humans AND AI agents
   - JSON-LD structured data for AI shopping assistants
   - Future-proof for agent economy

4. **Distributed Microservices**
   - 4 separate services (Bandit, Orchestrator, Evolution, Frontend)
   - Docker-ready architecture
   - Convex real-time backend

---

## 🔥 Demo One-Liners

**"We built an advertising platform that evolves like biology."**

**"Watch as AI generates this image in real-time."** *(Nano Banana demo)*

**"Top 20% agents breed. Weak ones die. Natural selection for ads."**

**"This isn't just for humans - it's optimized for AI shopping agents too."**

**"Thompson Sampling learns which variants convert best in real-time."**

---

## 🐛 Troubleshooting

**"Failed to generate image"**
- Check `GOOGLE_API_KEY` in `.env`
- Backend must be running on port 8001

**"Failed to create campaign"**
- Check `CONVEX_URL` in `.env`
- Orchestrator must be running on port 8001

**Services won't start**
```bash
# Install Python dependencies
cd services/bandit && pip install -r requirements.txt
cd ../agent-orchestrator && pip install -r requirements.txt
cd ../evolution-engine && pip install -r requirements.txt

# Install frontend dependencies
cd ../../web/frontend && npm install
```

---

## 📊 What's Actually Working

✅ **Frontend** - Full React dashboard with MUI
✅ **Nano Banana** - Real AI image generation
✅ **Multi-Armed Bandit** - Thompson Sampling algorithm
✅ **Evolution Engine** - Genetic algorithm (crossover + mutation)
✅ **Agent Orchestrator** - Personality generation + LLM integration
✅ **Campaign Management** - Create, deploy, pause, resume

⏳ **Not Yet Connected**
- Convex database (using mock data for now)
- Real ad platform integrations (Google Ads, Meta, etc.)
- Full evolution trigger (manual trigger works)

---

## 🎯 The Story

"Most ad platforms require manual A/B testing and constant optimization.

We built a system where AI agents compete, breed, and evolve automatically.

Deploy once. Hit your conversion goal. The agents handle the rest.

Oh, and it works for AI shopping agents too - because that's the future."

---

## 🚀 Quick Commands

**Start everything:**
```bash
./start-demo.sh
```

**Test Nano Banana:**
```bash
curl -X POST http://localhost:8001/creatives/generate \
  -H "Content-Type: application/json" \
  -d '{"campaignId":"demo","type":"image","prompt":"luxury perfume bottle","segment":"human"}'
```

**Test Bandit:**
```bash
curl -X POST http://localhost:8000/select \
  -H "Content-Type: application/json" \
  -d '{"campaignId":"test","segment":"human","arms":["var1","var2","var3"]}'
```

**Health Check All Services:**
```bash
curl http://localhost:8000/health  # Bandit
curl http://localhost:8001/health  # Orchestrator
curl http://localhost:8002/health  # Evolution
```

---

**GO CRUSH THAT DEMO! 🚀**
