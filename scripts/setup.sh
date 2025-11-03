#!/bin/bash
# Ad-Astra Setup Script
# Automates initial setup and validation

set -e  # Exit on error

echo "🚀 Ad-Astra Agent System Setup"
echo "================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env from template..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo "⚠️  IMPORTANT: Edit .env and add your API keys:"
    echo "   - OPENAI_API_KEY"
    echo "   - CONVEX_HTTP_BASE"
    echo "   - ADMIN_SECRET"
    echo ""
    read -p "Press Enter when you've configured .env..."
else
    echo "✅ .env file exists"
fi

# Load environment
source .env

# Check required env vars
echo ""
echo "🔍 Validating environment variables..."

if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ OPENAI_API_KEY not set in .env"
    exit 1
fi

if [ -z "$CONVEX_HTTP_BASE" ]; then
    echo "❌ CONVEX_HTTP_BASE not set in .env"
    exit 1
fi

if [ -z "$ADMIN_SECRET" ]; then
    echo "❌ ADMIN_SECRET not set in .env"
    exit 1
fi

echo "✅ All required environment variables set"

# Check Docker
echo ""
echo "🐳 Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose not found. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose found"

# Check Python for test scripts
echo ""
echo "🐍 Checking Python..."
if ! command -v python3 &> /dev/null; then
    echo "⚠️  Python 3 not found. You won't be able to run test scripts."
else
    echo "✅ Python 3 found"

    # Check if httpx is installed
    if ! python3 -c "import httpx" 2>/dev/null; then
        echo "📦 Installing Python dependencies..."
        pip3 install httpx python-dotenv
    fi
    echo "✅ Python dependencies ready"
fi

# Build Docker images
echo ""
echo "🏗️  Building Docker images..."
cd ops
docker-compose build
echo "✅ Docker images built"

# Start services
echo ""
echo "🚀 Starting services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to start (10 seconds)..."
sleep 10

# Check service health
echo ""
echo "🏥 Checking service health..."

services=(
    "http://localhost:8000/health|Bandit Service"
    "http://localhost:8001/health|Agent Orchestrator"
    "http://localhost:8002/health|Evolution Engine"
)

all_healthy=true

for service in "${services[@]}"; do
    IFS='|' read -r url name <<< "$service"
    if curl -s -f "$url" > /dev/null; then
        echo "  ✅ $name is healthy"
    else
        echo "  ❌ $name is not responding"
        all_healthy=false
    fi
done

if [ "$all_healthy" = false ]; then
    echo ""
    echo "❌ Some services are not healthy. Check logs with:"
    echo "   docker-compose logs"
    exit 1
fi

# Success!
echo ""
echo "================================"
echo "✅ Setup Complete!"
echo "================================"
echo ""
echo "🎉 All services are running:"
echo "   • Bandit Service:        http://localhost:8000"
echo "   • Agent Orchestrator:    http://localhost:8001"
echo "   • Evolution Engine:      http://localhost:8002"
echo "   • Offer Pages:           http://localhost:8787"
echo ""
echo "📝 Next Steps:"
echo "   1. Test the system:"
echo "      python3 scripts/test_system.py"
echo ""
echo "   2. Create your first campaign:"
echo "      python3 examples/create_perfume_campaign.py"
echo ""
echo "   3. Monitor logs:"
echo "      docker-compose logs -f"
echo ""
echo "   4. Stop services:"
echo "      docker-compose down"
echo ""
echo "📚 Documentation:"
echo "   • Quick Start:  QUICKSTART.md"
echo "   • Full Docs:    README_AGENT_SYSTEM.md"
echo "   • TODO List:    TODO.md"
echo ""
echo "🚀 Happy advertising with AI agents!"
