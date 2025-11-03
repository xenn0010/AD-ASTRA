#!/bin/bash
# Ad-Astra - Stop All Services

echo "🛑 Stopping Ad-Astra Services..."

# Read PIDs and kill
if [ -f "pids/bandit.pid" ]; then
    kill $(cat pids/bandit.pid) 2>/dev/null && echo "  ✓ Stopped Bandit Service"
fi

if [ -f "pids/orchestrator.pid" ]; then
    kill $(cat pids/orchestrator.pid) 2>/dev/null && echo "  ✓ Stopped Agent Orchestrator"
fi

if [ -f "pids/evolution.pid" ]; then
    kill $(cat pids/evolution.pid) 2>/dev/null && echo "  ✓ Stopped Evolution Engine"
fi

if [ -f "pids/gateway.pid" ]; then
    kill $(cat pids/gateway.pid) 2>/dev/null && echo "  ✓ Stopped API Gateway"
fi

# Clean up
rm -f pids/*.pid

echo ""
echo "✅ All services stopped"
