# Metorial MCP Integration Guide

## What is Metorial MCP?

**Metorial** is a serverless runtime platform for **Model Context Protocol (MCP)** servers.
Think of it as **"Vercel for MCP"** - it makes connecting AI agents to external tools and APIs incredibly easy.

---

## Why Use Metorial with Ad-Astra?

### Current Ad-Astra Capabilities
✅ Generate ad copy with GPT-5/Gemini
✅ Optimize traffic with Thompson Sampling
✅ Evolve agents with genetic algorithms

### With Metorial MCP Added
✅ **Plus all of the above**
✅ Agents can access **600+ integrations**
✅ Real-time market research
✅ Competitor analysis
✅ Dynamic pricing data
✅ Social media trend analysis
✅ Customer sentiment from reviews
✅ And much more!

---

## How It Works

### Without Metorial
```
AI Agent → Generate ad copy → Done
```

### With Metorial
```
AI Agent
  ↓
  → Access Google Trends (via MCP)
  → Check competitor prices (via MCP)
  → Read customer reviews (via MCP)
  → Analyze sentiment (via MCP)
  ↓
  → Generate highly informed ad copy → Much better results!
```

---

## Metorial MCP Use Cases for Ad-Astra

### 1. Dynamic Market Research
```python
# Agent can check what's trending
trending = mcp.call_tool({
    "tool": "google_trends",
    "action": "get_trending",
    "params": {"category": "beauty", "region": "US"}
})

# Agent adapts headline based on trends
if "sustainable" in trending:
    headline = "Eco-Conscious Luxury Perfume..."
```

### 2. Competitor Intelligence
```python
# Check competitor pricing
competitor_prices = mcp.call_tool({
    "tool": "web_scraper",
    "action": "get_prices",
    "params": {"competitors": ["brand_a", "brand_b"]}
})

# Agent adjusts strategy
if our_price < avg_price:
    strategy = "value_focused"
else:
    strategy = "luxury_positioning"
```

### 3. Customer Sentiment Analysis
```python
# Read reviews from multiple sources
reviews = mcp.call_tool({
    "tool": "review_aggregator",
    "action": "get_sentiment",
    "params": {"product": "luxury_perfume"}
})

# Agent highlights what customers love
if reviews["love"] == "long_lasting":
    bullet = "Lasts 12+ hours - customers' #1 favorite feature"
```

### 4. Social Proof Automation
```python
# Get real social media mentions
mentions = mcp.call_tool({
    "tool": "social_media",
    "action": "get_mentions",
    "params": {"brand": "midnight_essence"}
})

# Agent includes real testimonials
if mentions > 1000:
    social_proof = "Join 10,000+ happy customers"
```

### 5. Real-Time Content Adaptation
```python
# Check current events
events = mcp.call_tool({
    "tool": "news_api",
    "action": "get_events",
    "params": {"category": "lifestyle"}
})

# Agent adapts messaging
if "valentines" in events:
    angle = "Perfect gift for your loved one"
elif "mothers_day" in events:
    angle = "Show mom she's special"
```

---

## How to Add Metorial to Ad-Astra

### Step 1: Sign Up for Metorial

1. Go to https://metorial.com
2. Create account
3. Get API key

### Step 2: Configure Ad-Astra

```bash
# Edit .env
METORIAL_API_KEY=your-key-here
METORIAL_ENABLED=true
```

### Step 3: Update Agent Orchestrator

```python
# services/agent-orchestrator/app.py

from metorial import MetorialClient

metorial = MetorialClient(api_key=os.getenv("METORIAL_API_KEY"))

async def create_agent_with_context(product_info):
    # Use Metorial to gather context
    trends = await metorial.call_tool({
        "tool": "google_trends",
        "action": "search",
        "params": {"keyword": product_info["name"]}
    })

    competitor_data = await metorial.call_tool({
        "tool": "web_scraper",
        "action": "get_prices",
        "params": {"product_type": product_info["category"]}
    })

    # Create agent with enriched context
    agent_prompt = f"""
    You are an AI advertising agent selling {product_info['name']}.

    Market Context (via Metorial MCP):
    - Current trends: {trends['trending_keywords']}
    - Competitor avg price: ${competitor_data['avg_price']}
    - Market sentiment: {trends['sentiment']}

    Create compelling ad copy that leverages these insights.
    """

    return agent_prompt
```

### Step 4: Enable in API Gateway

```python
# api-gateway/server.py

@app.post("/api/campaigns")
async def create_campaign(req: CreateCampaignRequest):
    # If Metorial enabled, gather market intelligence
    if os.getenv("METORIAL_ENABLED") == "true":
        market_data = await get_market_intelligence(req)
        req.context = market_data

    # Create campaign with enriched data
    ...
```

---

## Available MCP Tools via Metorial

Metorial provides access to **600+ integrations**:

### Research & Data
- Google Trends
- News APIs
- Wikipedia
- Academic databases
- Market research tools

### E-commerce
- Price comparison
- Product reviews
- Inventory tracking
- Shipping calculators

### Social Media
- Twitter/X
- Instagram
- Facebook
- TikTok
- LinkedIn

### Analytics
- Google Analytics
- Mixpanel
- Segment
- Custom databases

### Communication
- Email (Gmail, Outlook)
- Slack
- Discord
- SMS

### Content
- Image search
- Stock photos
- Video platforms
- Content databases

---

## Example: Enhanced Agent with Metorial

### Before Metorial
```
Agent generates:
  "Luxury Perfume - Midnight Essence
   Handcrafted in France
   $99.99"
```

### After Metorial
```
Agent researches → Finds:
  - "Sustainability" is trending +450%
  - Competitor prices: $85-$120
  - Customers love "long-lasting"
  - Valentine's Day in 2 weeks

Agent generates:
  "Sustainably-Crafted Midnight Essence
   Lasts 12+ hours (top-rated by 10,000+ customers)
   Perfect Valentine's Gift - $99.99 (Best value vs competitors)
   Limited Edition - 48 bottles left"
```

**Result**: Much higher conversion rate!

---

## Cost Considerations

### Metorial Pricing
- **Free Tier**: 1,000 MCP calls/month
- **Pro**: $29/month - 50,000 calls
- **Business**: $99/month - 500,000 calls

### When to Use
- ✅ High-value campaigns (>$1000 budget)
- ✅ Competitive markets
- ✅ Dynamic products (pricing changes)
- ❌ Simple products (less benefit)
- ❌ Low-budget tests (<$100)

---

## Integration Status in Ad-Astra

### Current Status: **Configured but Not Implemented**

```bash
# In .env.example
MCP_METORIAL_ENABLED=true
MCP_METORIAL_API_KEY=your-key-here
MCP_METORIAL_API_URL=https://api.metorial.com
```

### Files Ready
- ✅ Configuration in .env
- ✅ Placeholder code in `integrations/mcp/`
- ⏸️ Not yet connected to agent orchestrator
- ⏸️ Optional feature (not required for MVP)

---

## Should You Use Metorial?

### ✅ Use It If:
- You need competitive intelligence
- Market changes frequently
- You want maximum performance
- Budget allows ($29+/month)
- Selling high-ticket items

### ⏸️ Skip It If:
- Just testing Ad-Astra
- Simple products
- Limited budget
- MVP phase
- Static markets

---

## How to Implement (When Ready)

### Option 1: DIY Integration
```bash
1. Sign up for Metorial
2. Get API key
3. Install SDK: pip install metorial-python
4. Update agent-orchestrator/app.py
5. Test with real campaign
```

### Option 2: Use Our Pre-built Integration
```bash
# Coming soon!
cd integrations/mcp
python setup_metorial.py --api-key YOUR_KEY
```

---

## Alternative to Metorial

### Use Direct APIs Instead
If you don't want Metorial, you can:
- Call Google Trends API directly
- Scrape competitor sites (carefully!)
- Use your own data sources
- Integrate with your CRM

**Metorial just makes it easier** by providing 600+ tools in one place.

---

## Bottom Line

### Metorial MCP is:
- ✅ **Optional** - Not required to use Ad-Astra
- ✅ **Powerful** - Gives agents superpowers
- ✅ **Easy** - One API, 600+ tools
- ⏸️ **Later** - Add after core platform works
- 💰 **Paid** - Requires subscription

### Recommendation:
1. **Now**: Use Ad-Astra without Metorial (works great!)
2. **Later**: Add Metorial for advanced campaigns
3. **Test**: Start with free tier (1000 calls/month)
4. **Scale**: Upgrade if it improves performance

---

## Resources

- Metorial Website: https://metorial.com
- MCP Documentation: https://github.com/metorial/mcp-index
- Ad-Astra Integration: `integrations/mcp/` (stub code)

---

**Ready when you are, but not required to start!** 🚀
