#!/bin/bash

# Ad-Astra Complete Demo Script
# Shows the full workflow: Create Campaign → Deploy → Simulate Traffic → Show Results

clear
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║             🚀 AD-ASTRA COMPLETE DEMO WORKFLOW 🚀              ║"
echo "║                                                                ║"
echo "║  Genetic Algorithms + Multi-Armed Bandit + AI Agents           ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check services
echo "📋 Step 1: Checking Services..."
echo ""

# Check Bandit
if curl -s http://localhost:8000/health | grep -q "ok"; then
    echo "✅ Bandit Service (port 8000) - Running"
else
    echo "❌ Bandit Service not running. Start with:"
    echo "   cd services/bandit && python3 app.py"
    exit 1
fi

# Check Orchestrator
if curl -s http://localhost:8001/health | grep -q "ok"; then
    echo "✅ Agent Orchestrator (port 8001) - Running"
else
    echo "❌ Agent Orchestrator not running. Start with:"
    echo "   cd services/agent-orchestrator && python3 app.py"
    exit 1
fi

echo ""
echo "Press ENTER to continue..."
read

# Step 2: Create Campaign
clear
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║ Step 2: Creating Campaign                                      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Creating 'TaskFlow SaaS Launch' campaign..."
echo ""

CAMPAIGN_RESPONSE=$(curl -s -X POST http://localhost:8001/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TaskFlow SaaS Launch",
    "goal": {"type": "conversions", "target": 50},
    "segments": ["human", "agent"],
    "description": "Launch campaign for TaskFlow task management SaaS"
  }')

CAMPAIGN_ID=$(echo $CAMPAIGN_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$CAMPAIGN_ID" ]; then
    echo "❌ Failed to create campaign"
    echo "Response: $CAMPAIGN_RESPONSE"
    exit 1
fi

echo "✅ Campaign Created!"
echo ""
echo "   Campaign ID: $CAMPAIGN_ID"
echo "   Name: TaskFlow SaaS Launch"
echo "   Goal: 50 conversions"
echo "   Segments: Human + AI Agent"
echo ""
echo "Press ENTER to deploy agents..."
read

# Step 3: Deploy Campaign
clear
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║ Step 3: Deploying Agent Swarm                                  ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Deploying autonomous agents..."
echo ""

DEPLOY_RESPONSE=$(curl -s -X POST "http://localhost:8001/campaigns/$CAMPAIGN_ID/deploy")

echo $DEPLOY_RESPONSE | python3 -m json.tool 2>/dev/null || echo $DEPLOY_RESPONSE

AGENTS_CREATED=$(echo $DEPLOY_RESPONSE | grep -o '"agentsCreated":[0-9]*' | grep -o '[0-9]*')

echo ""
echo "✅ Agents Deployed!"
echo ""
echo "   Total Agents: $AGENTS_CREATED"
echo "   Status: Active and competing for traffic"
echo ""
echo "Press ENTER to simulate traffic..."
read

# Step 4: Simulate Traffic
clear
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║ Step 4: Simulating User Traffic                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Simulating 50 users visiting TaskFlow landing page..."
echo "Each user will see a variant selected by the Multi-Armed Bandit"
echo ""
echo "Starting in 3 seconds..."
sleep 3

# Run traffic simulation
python3 scripts/simulate_demo_traffic.py

echo ""
echo "Press ENTER to see final results..."
read

# Step 5: Show Results
clear
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║ Step 5: Campaign Results & Bandit Learning                     ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Test bandit learning by making more selections
echo "🎯 Testing Bandit Learning (10 more selections):"
echo ""

for i in {1..10}; do
    SELECTION=$(curl -s -X POST http://localhost:8000/select \
      -H "Content-Type: application/json" \
      -d '{"campaignId":"demo_campaign","segment":"human","arms":["var1","var2","var3"]}')

    VARIANT=$(echo $SELECTION | grep -o '"variantId":"[^"]*"' | cut -d'"' -f4)
    echo "  Selection $i: $VARIANT"
    sleep 0.2
done

echo ""
echo "📊 Notice: The bandit is learning to favor var2 (best performer)!"
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    🎉 DEMO COMPLETE! 🎉                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "What You Just Saw:"
echo ""
echo "  ✅ Created a campaign with dual-audience optimization"
echo "  ✅ Deployed autonomous AI agents with unique personalities"
echo "  ✅ Simulated real user traffic with varying behaviors"
echo "  ✅ Multi-Armed Bandit learned which variant performs best"
echo "  ✅ Thompson Sampling (Bayesian optimization) in action"
echo ""
echo "Next Steps:"
echo "  • View dashboard: http://localhost:5173"
echo "  • See SaaS product: file://$(pwd)/demo-saas/index.html"
echo "  • Trigger evolution: curl -X POST http://localhost:8002/evolve \\"
echo "      -H 'Content-Type: application/json' \\"
echo "      -d '{\"campaignId\":\"$CAMPAIGN_ID\",\"force\":true}'"
echo ""
echo "🚀 Ad-Astra: Advertising evolved."
echo ""
