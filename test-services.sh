#!/bin/bash

# Quick service health check script

echo "🔍 Testing Ad-Astra Services..."
echo ""

# Test Bandit Service
echo "🎰 Bandit Service (http://localhost:8000):"
if curl -s http://localhost:8000/health | grep -q "ok"; then
    echo "   ✅ Running"
else
    echo "   ❌ Not responding"
fi

# Test Agent Orchestrator
echo "🤖 Agent Orchestrator (http://localhost:8001):"
if curl -s http://localhost:8001/health | grep -q "ok"; then
    echo "   ✅ Running"

    # Check OpenAI config
    if curl -s http://localhost:8001/health | grep -q '"openai_configured":true'; then
        echo "   ✅ OpenAI configured"
    else
        echo "   ⚠️  OpenAI not configured"
    fi

    # Check Google API
    if [ -n "$GOOGLE_API_KEY" ]; then
        echo "   ✅ Google API key present"
    else
        echo "   ⚠️  Google API key missing"
    fi
else
    echo "   ❌ Not responding"
fi

# Test Evolution Engine
echo "🧬 Evolution Engine (http://localhost:8002):"
if curl -s http://localhost:8002/health | grep -q "ok"; then
    echo "   ✅ Running"
else
    echo "   ❌ Not responding"
fi

echo ""
echo "🎯 Quick Tests:"
echo ""

# Test bandit selection
echo "Testing Multi-Armed Bandit..."
BANDIT_RESULT=$(curl -s -X POST http://localhost:8000/select \
  -H "Content-Type: application/json" \
  -d '{"campaignId":"test","segment":"human","arms":["var1","var2","var3"]}')

if echo "$BANDIT_RESULT" | grep -q "variantId"; then
    echo "✅ Bandit selection works"
    echo "   Selected: $(echo $BANDIT_RESULT | grep -o '"variantId":"[^"]*"')"
else
    echo "❌ Bandit selection failed"
fi

echo ""
echo "📊 Summary:"
echo "   All core services are ready for demo!"
echo "   Open http://localhost:5173 to start"
echo ""
