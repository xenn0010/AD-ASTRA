#!/bin/bash
# Ad-Astra - Start All Services

echo "🚀 Starting Ad-Astra Services..."
echo ""

# Check .env file
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "Please copy .env.example to .env and configure your API keys"
    exit 1
fi

# Start services in background
echo "Starting Bandit Service (port 8000)..."
cd services/bandit && python app.py > ../../logs/bandit.log 2>&1 &
BANDIT_PID=$!

sleep 2

echo "Starting Agent Orchestrator (port 8001)..."
cd ../agent-orchestrator && python app.py > ../../logs/orchestrator.log 2>&1 &
ORCH_PID=$!

sleep 2

echo "Starting Evolution Engine (port 8002)..."
cd ../evolution-engine && python app.py > ../../logs/evolution.log 2>&1 &
EVO_PID=$!

sleep 2

echo "Starting API Gateway (port 8888)..."
cd ../../api-gateway && python server.py > ../logs/gateway.log 2>&1 &
GATEWAY_PID=$!

sleep 3

# Save PIDs
echo $BANDIT_PID > ../pids/bandit.pid
echo $ORCH_PID > ../pids/orchestrator.pid
echo $EVO_PID > ../pids/evolution.pid
echo $GATEWAY_PID > ../pids/gateway.pid

echo ""
echo "✅ All services started!"
echo ""
echo "Service Status:"
echo "  Bandit Service:      http://localhost:8000 (PID: $BANDIT_PID)"
echo "  Agent Orchestrator:  http://localhost:8001 (PID: $ORCH_PID)"
echo "  Evolution Engine:    http://localhost:8002 (PID: $EVO_PID)"
echo "  API Gateway:         http://localhost:8888 (PID: $GATEWAY_PID)"
echo ""
echo "📊 Check status: curl http://localhost:8888/status"
echo "📝 Logs in: ./logs/"
echo "🛑 Stop all: ./stop-all.sh"
echo ""
