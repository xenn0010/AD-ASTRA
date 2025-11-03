#!/bin/bash

# Ad-Astra Quick Demo Startup Script
# Starts all services needed for demo

echo "🚀 Starting Ad-Astra Demo..."
echo ""

# Check if running in correct directory
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found. Please run from project root."
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

echo "📦 Starting services..."
echo ""

# Start Bandit Service (Port 8000)
echo "🎰 Starting Bandit Service (http://localhost:8000)..."
cd services/bandit
python3 -m pip install -q -r requirements.txt
python3 app.py &
BANDIT_PID=$!
cd ../..

# Wait a moment for bandit to start
sleep 2

# Start Agent Orchestrator (Port 8001)
echo "🤖 Starting Agent Orchestrator (http://localhost:8001)..."
cd services/agent-orchestrator
python3 -m pip install -q -r requirements.txt
python3 app.py &
ORCHESTRATOR_PID=$!
cd ../..

# Wait a moment
sleep 2

# Start Evolution Engine (Port 8002)
echo "🧬 Starting Evolution Engine (http://localhost:8002)..."
cd services/evolution-engine
python3 -m pip install -q -r requirements.txt
python3 app.py &
EVOLUTION_PID=$!
cd ../..

# Wait a moment
sleep 2

# Start Frontend (Port 5173)
echo "🎨 Starting Frontend (http://localhost:5173)..."
cd web/frontend
npm install --silent
npm run dev &
FRONTEND_PID=$!
cd ../..

echo ""
echo "✅ All services started!"
echo ""
echo "📍 Service URLs:"
echo "   Frontend:          http://localhost:5173"
echo "   Bandit Service:    http://localhost:8000"
echo "   Orchestrator:      http://localhost:8001"
echo "   Evolution Engine:  http://localhost:8002"
echo ""
echo "🎬 DEMO READY!"
echo ""
echo "To stop all services, press Ctrl+C"
echo ""

# Wait for user interrupt
trap "echo ''; echo '🛑 Stopping services...'; kill $BANDIT_PID $ORCHESTRATOR_PID $EVOLUTION_PID $FRONTEND_PID 2>/dev/null; exit" INT

# Keep script running
wait
